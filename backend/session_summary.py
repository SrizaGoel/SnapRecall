from sqlalchemy import text
from groq import Groq
import os
from dotenv import load_dotenv
import json

load_dotenv()

client=Groq(api_key=os.getenv("GROQ_API_KEY"))

from database import engine

def generate_session_summary(session_id):
    with engine.connect() as conn:
        result=conn.execute(
            text(
                """
                    SELECT ocr_text FROM screenshots WHERE session_id=:session_id AND ocr_text IS NOT NULL
                """
            ),
            {"session_id":session_id}
        )
        texts = []

        for row in result:
            texts.append(row[0])

        if not texts:
            return {
        "title": "Empty Session",
        "summary": "No screenshots found for this session."
        }


        context = "\n".join(texts)

        prompt = f"""
            These screenshots belong to one user session.

            OCR Content:
            {context}

            Generate:
            1. A short title (max 8 words)
            2. A concise summary (5-10 sentences) of the topic that is been talked about in the lecture

            IMPORTANT:
            Return ONLY valid JSON.
            Do not use markdown.
            Do not use ```json.
            Do not include any extra text.

            Format:

            {{
                "title": "...",
                "summary": "..."
            }}
            """

        response = client.chat.completions.create(model="llama-3.3-70b-versatile",
        messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
        )

        content = response.choices[0].message.content

        try:
            return json.loads(content)
        except Exception:
            return {
                "title": "Session Summary",
                "summary": content
            }

