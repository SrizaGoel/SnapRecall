from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client=Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq(context,question):
    prompt=f"""
                You are Cipher, an intelligent AI study assistant that answers questions ONLY using the user's uploaded notes.

                Context (User's Notes):
                {context}

                Question:
                {question}

                Instructions:
                - Answer using only the information available in the provided notes.
                - Correct obvious OCR mistakes and improve grammar without changing the meaning.
                - Do not copy the notes verbatim unless necessary.
                - Use clear headings, bullet points, and numbered lists where appropriate.
                - Keep the answer concise but complete.
                - If the notes do not contain enough information to answer the question, clearly state that instead of making up facts.
                
                Format your response as follows:

                # Answer
                Provide a clear, well-structured answer.

                # Summary
                Summarize the topic in 3–6 concise bullet points.

                # Important Terms
                List the important terms with a one-line explanation for each.

                # Prerequisite Knowledge
                Mention any concepts the user should know beforehand to better understand this topic. If none, write "None."

                # Additional Insights
                Mention any important observations, common mistakes, exam tips, or related concepts that are useful but only if they are supported by or logically inferred from the provided notes.
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