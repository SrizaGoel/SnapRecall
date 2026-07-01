# Import torch first to resolve Windows DLL conflict (WinError 127) with PaddleOCR/PaddlePaddle
import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cloudinary.uploader
import cloudinary_config
from database import engine
from sqlalchemy import text
from embedding import generate_embedding
from ocr import extract_text
from llm import ask_groq
from session_summary import generate_session_summary
from datetime import date, timedelta
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message":"SnapRecall backend running"
    }

@app.post("/upload")
def upload_image(session_id: int = None, file: UploadFile = File(...)):
    result = cloudinary.uploader.upload(
        file.file,
        folder="snaprecall"
    )
    ocr_text=extract_text(result["secure_url"])
    embedding = generate_embedding(ocr_text)
    with engine.connect() as conn:
        db_result=conn.execute(
            text(
                """
                    INSERT INTO SCREENSHOTS(session_id,image_url,cloudinary_public_id,processing_status,ocr_text,embedding) VALUES (:session_id,:image_url,:cloudinary_public_id,'embedded',:ocr_text,:embedding)
                    RETURNING screenshot_id
                """
            ),
            {
                "image_url":result["secure_url"],
                "cloudinary_public_id":result["public_id"],
                "ocr_text":ocr_text,
                "embedding":embedding,
                "session_id":session_id
            }
        )
        screenshot_id = db_result.scalar()
        conn.commit()
    return {
        "filename": file.filename,
        "image_url": result["secure_url"],
        "public_id": result["public_id"],
        "status":"embedded",
        "screenshot_id":screenshot_id
    }

@app.get("/screenshots")
async def get_screenshots():
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    SELECT * FROM SCREENSHOTS WHERE is_deleted=FALSE ORDER BY CAPTURED_ON DESC
                """
            )
        )
        screenshots=result.mappings().all()
        return screenshots

def retrieve_similar_screenshots(user_id,query):
    query_embedding = generate_embedding(query)

    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT *
                FROM (
                    SELECT
                        screenshot_id,
                        image_url,
                        ocr_text,
                        embedding <=> CAST(:query_embedding AS vector) AS distance
                    FROM screenshots s JOIN sessions sess ON s.session_id = sess.session_id
                    WHERE sess.user_id = :user_id AND embedding IS NOT NULL
                ) AS results
                WHERE distance < 0.25
                ORDER BY distance
                LIMIT 5
            """),
            {
                "query_embedding": str(query_embedding),
                "user_id":user_id
            }
        )

        return result.mappings().all()

@app.get("/search")
def query_search(user_id:int,query: str):

    results = retrieve_similar_screenshots(user_id,query)

    if not results:
        return {"message": "No relevant screenshots found"}

    return results
# change and verify the hardcoded 0.25 as threshold

@app.get("/ask")
def ask(user_id:int,question: str):

    matches = retrieve_similar_screenshots(user_id,question)

    if not matches:
        return {"message": "No relevant screenshots found"}

    context = "\n\n".join(
        row["ocr_text"]
        for row in matches
    )

    answer = ask_groq(
        context=context,
        question=question
    )

    return {
        "answer": answer,
        "sources": matches
    }

@app.post("/start-session")
def start_session(user_id:int):
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    INSERT INTO sessions(user_id,start_time) VALUES (:user_id,NOW()) RETURNING session_id
                """
            ),
            {"user_id":user_id}
        )
        session_id=result.scalar()
        conn.commit()
        return {
            "session_id":session_id
        }

@app.post("/end-session/{session_id}")
def end_session(session_id:int):
    session=generate_session_summary(session_id)
    title=session["title"]
    summary=session["summary"]
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    UPDATE sessions SET end_time=NOW(),duration=NOW()-start_time,summary=:summary,title=:title WHERE session_id=:session_id
                """
            ),
            {
                "session_id":session_id,
                "summary":summary,
                "title":title
            }
        )
        conn.commit()
        return {
            "message":"Session ended"
        }
    
@app.get("/sessions")
def get_sessions():
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    SELECT*FROM sessions ORDER BY start_time DESC
                """
            )
        )
        sessions = result.mappings().all()

        return sessions
    
@app.get("/sessions/{session_id}")
def get_session(session_id: int):

    with engine.connect() as conn:

        result = conn.execute(
            text("""SELECT*FROM sessions WHERE session_id = :session_id """),
            {"session_id": session_id}
        )

        return result.mappings().first()

@app.get("/sessions/{session_id}/screenshots")
def get_screenshot(session_id:int):
    with engine.connect() as conn:
        result = conn.execute(
            text("""SELECT*FROM screenshots WHERE session_id = :session_id """),
            {"session_id": session_id}
        )

        return result.mappings().all()

@app.delete("/screenshots/{screenshot_id}")
def delete_screenshot(screenshot_id: int):
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT cloudinary_public_id FROM screenshots WHERE screenshot_id = :screenshot_id"),
            {"screenshot_id": screenshot_id}
        )
        row = result.mappings().first()
        if not row:
            return {"status": "error", "message": "Screenshot not found"}
        cloudinary_id = row["cloudinary_public_id"]
        conn.execute(
            text("DELETE FROM screenshots WHERE screenshot_id = :screenshot_id"),
            {"screenshot_id": screenshot_id}
        )
        conn.commit()
    if cloudinary_id:
        try:
            cloudinary.uploader.destroy(cloudinary_id)
        except Exception:
            pass
            
    return {"status": "deleted", "screenshot_id": screenshot_id}

@app.get("/sessions_by_range")
def get_session_by_range(start_date:str,end_date:str):
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    SELECT session_id,title,summary,start_time FROM sessions where DATE(start_time) BETWEEN :start_date and :end_date ORDER BY start_time
                """
            ),
            {
                "start_date":start_date,
                "end_date":end_date
            }
        )
        return result.mappings().all()

# @app.get("/db-test")
# def db_test():
#     with engine.connect() as conn:
#         result = conn.execute(text("SELECT 1"))
#         return {"result": result.scalar()}
# go to http://127.0.0.1:8000/docs to check get db test endpoint and click try it out -> execute 

def calculate_current_streak(study_dates):
    if not study_dates:
        return 0
    study_dates = sorted(set(study_dates))
    study_set = set(study_dates)
    today = date.today()
    if today in study_set:
        current = today
    elif today - timedelta(days=1) in study_set:
        current = today - timedelta(days=1)
    else:
        return 0
    streak = 0

    while current in study_set:
        streak += 1
        current -= timedelta(days=1)
    return streak

@app.get("/dashboard/{user_id}")
def get_dashboard_data(user_id:int):
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    SELECT DISTINCT DATE(start_time) AS study_day FROM sessions WHERE user_id = :user_id ORDER BY study_day DESC;
                """
            ),
            {"user_id": user_id}
        )
        study_dates = [row.study_day.isoformat() for row in result]

        return {
            "study_dates": study_dates,
            "current_streak":calculate_current_streak(study_dates)
        }