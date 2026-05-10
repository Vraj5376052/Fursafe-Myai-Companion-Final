import os
import requests
from fastapi import APIRouter, HTTPException, UploadFile, File

router = APIRouter()


@router.post("/ocr")
async def scan_image(file: UploadFile = File(...)):
    ocr_api_key = os.getenv("OCR_API_KEY")

    if not ocr_api_key:
        raise HTTPException(status_code=500, detail="OCR_API_KEY not configured")

    try:
        image_bytes = await file.read()

        response = requests.post(
            "https://api.ocr.space/parse/image",
            files={"file": (file.filename or "image.jpg", image_bytes, "image/jpeg")},
            data={
                "apikey": ocr_api_key,
                "language": "eng",
                "isOverlayRequired": False,
                "detectOrientation": True,
                "scale": True,
                "OCREngine": 2,
            },
            timeout=25
        )

        result = response.json()

        if result.get("IsErroredOnProcessing"):
            raise HTTPException(status_code=400, detail=str(result.get("ErrorMessage", "OCR failed")))

        parsed = result.get("ParsedResults", [])
        if not parsed:
            return {"text": ""}

        text = parsed[0].get("ParsedText", "").strip()
        return {"text": text}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        audio_bytes = await file.read()

        resp = requests.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {groq_api_key}"},
            files={"file": ("recording.wav", audio_bytes, "audio/wav")},
            data={"model": "whisper-large-v3", "response_format": "json"},
            timeout=60,
        )

        result = resp.json()

        if not resp.ok:
            raise HTTPException(status_code=502, detail=result.get("error", {}).get("message", "Transcription error"))

        return {"text": result.get("text", "").strip()}

    except HTTPException:
        raise
    except Exception as e:
        print("TRANSCRIBE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
