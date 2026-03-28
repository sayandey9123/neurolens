from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from groq import Groq
import fitz
import os
import json
import base64

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = "llama-3.3-70b-versatile"

app = FastAPI(title="NeuroLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="ignore")

def get_document_content(file: UploadFile, file_bytes: bytes):
    name = file.filename.lower()
    if name.endswith(".pdf"):
        return {"type": "text", "content": extract_text_from_pdf(file_bytes)}
    elif name.endswith((".png", ".jpg", ".jpeg", ".webp")):
        encoded = base64.b64encode(file_bytes).decode("utf-8")
        return {"type": "image", "content": encoded, "media_type": file.content_type}
    elif name.endswith(".txt"):
        return {"type": "text", "content": extract_text_from_txt(file_bytes)}
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type.")


@app.get("/")
def root():
    return {"message": "NeuroLens API running!", "model": MODEL_NAME}


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    file_bytes = await file.read()
    doc = get_document_content(file, file_bytes)

    if doc["type"] == "image":
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{doc['media_type']};base64,{doc['content']}"
                        }
                    },
                    {
                        "type": "text",
                        "text": ANALYSIS_PROMPT
                    }
                ]
            }
        ]
        response = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=messages,
            max_tokens=2000,
        )
    else:
        if not doc["content"]:
            raise HTTPException(status_code=400, detail="Could not extract text.")
        prompt = f"{ANALYSIS_PROMPT}\n\n---DOCUMENT---\n{doc['content'][:12000]}"
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
        )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0]

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw}


@app.post("/ask")
async def ask_question(file: UploadFile = File(...), question: str = ""):
    file_bytes = await file.read()
    doc = get_document_content(file, file_bytes)

    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if doc["type"] == "image":
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{doc['media_type']};base64,{doc['content']}"
                        }
                    },
                    {
                        "type": "text",
                        "text": f"Answer this question about the image: {question}"
                    }
                ]
            }
        ]
        stream = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=messages,
            max_tokens=1000,
            stream=True,
        )
    else:
        prompt = (
            f"Document:\n{doc['content'][:12000]}\n\n"
            f"Question: {question}\n\n"
            f"Answer clearly and concisely based only on the document."
        )
        stream = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            stream=True,
        )

    def generate():
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    return StreamingResponse(generate(), media_type="text/plain")


ANALYSIS_PROMPT = """
Analyze this document and return ONLY a valid JSON object with exactly these fields:

{
  "summary": "A clear 3-5 sentence summary of the document",
  "sentiment": "Positive | Negative | Neutral | Mixed",
  "sentiment_score": 0.0,
  "classification": "The document category/type (e.g. Legal, Medical, Financial, Academic, News, Technical, Personal)",
  "key_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "word_count": 0,
  "reading_time": "X min read",
  "language": "English",
  "complexity": "Simple | Moderate | Complex",
  "key_insights": ["insight1", "insight2", "insight3"]
}

Return ONLY the JSON. No explanation, no markdown, no extra text.
"""