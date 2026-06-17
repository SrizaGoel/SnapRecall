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
async def upload_image(file: UploadFile = File(...)):
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
                    INSERT INTO SCREENSHOTS(image_url,processing_status,ocr_text,embedding) VALUES (:image_url,'embedded',:ocr_text,:embedding)
                    RETURNING screenshot_id
                """
            ),
            {
                "image_url":result["secure_url"],
                "ocr_text":ocr_text,
                "embedding":embedding
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

def retrieve_similar_screenshots(query):
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
                    FROM screenshots
                    WHERE embedding IS NOT NULL
                ) AS results
                WHERE distance < 0.7
                ORDER BY distance
                LIMIT 5
            """),
            {
                "query_embedding": str(query_embedding)
            }
        )

        return result.mappings().all()

@app.get("/search")
def query_search(query: str):

    results = retrieve_similar_screenshots(query)

    if not results:
        return {"message": "No relevant screenshots found"}

    return results
# change and verify the hardcoded 0.7 as threshold

@app.get("/ask")
def ask(question: str):

    matches = retrieve_similar_screenshots(question)

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
# @app.get("/db-test")
# def db_test():
#     with engine.connect() as conn:
#         result = conn.execute(text("SELECT 1"))
#         return {"result": result.scalar()}
# go to http://127.0.0.1:8000/docs to check get db test endpoint and click try it out -> execute 