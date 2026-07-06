import requests

API_KEY = "K86130492288957"

def extract_text(image_url):
    response = requests.post(
        "https://api.ocr.space/parse/image",
        data={
            "apikey": API_KEY,
            "url": image_url,
            "language": "eng",
        },
        timeout=60,
    )

    data = response.json()

    if data.get("IsErroredOnProcessing"):
        return ""

    parsed = data.get("ParsedResults", [])

    if not parsed:
        return ""

    return parsed[0].get("ParsedText", "")