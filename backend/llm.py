from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client=Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq(context,question):
    prompt=f"""
                You are an AI chatbot  (Cipher). Answer using the users notes below
                Notes: {context}
                Question: {question}
                Answer clearly and precisely. Also include 1. proper summarizations at the end 2. important terms 3. Prerequisite knowledge 4. Anything extra which is imp but missimg the notes
            """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content