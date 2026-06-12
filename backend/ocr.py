import requests
import cv2
import numpy as np
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True,lang="en")

def extract_text(image_url):
    # If the image is a URL, download it ourselves to prevent PaddleOCR's buggy 'tmp.jpg' cache
    if isinstance(image_url, str) and (image_url.startswith("http://") or image_url.startswith("https://")):
        resp = requests.get(image_url)
        image_bytes = np.frombuffer(resp.content, np.uint8)
        img = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
    else:
        img = image_url

    result = ocr.ocr(img)
    if not result or not result[0]:
        return ""
        
    texts = []
    for line in result[0]:
        texts.append(line[1][0])
    return "\n".join(texts)