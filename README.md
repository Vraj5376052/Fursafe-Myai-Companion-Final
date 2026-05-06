# Fursafe MyAI Companion

A healthcare support mobile app that lets patients describe symptoms or scan medical documents and receive plain-language AI summaries. Built with React Native (Expo) + FastAPI.

> **Disclaimer:** This app is not a medical professional. It only summarises and simplifies information. Always consult a qualified healthcare professional.

---

## Project Structure

```
Fursafe-MyAI-Companion-Final/
├── Final frontend/     # React Native app (Expo)
└── Final backend/      # FastAPI server (Python)
```

---

## Features

- **AI Chat** — describe symptoms, get plain-language summaries (Groq Llama 3.3-70b)
- **Voice Input** — record audio and transcribe to text (Groq Whisper)
- **Camera / OCR** — scan prescriptions or documents (OCR.space)
- **Translate** — translate AI responses to 9 languages
- **Text-to-Speech** — listen to AI responses (expo-speech)
- **Chat History** — create, view, and delete chat sessions
- **User Profile** — edit name/password, toggle auto-speak
- **JWT Auth** — secure login and registration

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.11 | https://www.python.org |
| Conda (Miniconda) | latest | https://docs.conda.io/en/latest/miniconda.html |
| Expo Go (phone) | latest | App Store / Google Play |
| Git | any | https://git-scm.com |

---

## Quick Start

See detailed setup in each folder:

- [Final frontend/README.md](Final%20frontend/README.md)
- [Final backend/README.md](Final%20backend/README.md)

### 1. Start the backend first
```bash
cd "Final backend"
conda activate myai
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the frontend
```bash
cd "Final frontend"
npx expo start --clear
```

### 3. Open on phone
Scan the QR code in your terminal with the **Expo Go** app.

---

## API Keys Required

| Key | Service | Get it at |
|-----|---------|----------|
| `GROQ_API_KEY` | AI chat + transcription | https://console.groq.com |
| `OCR_API_KEY` | Document scanning | https://ocr.space/ocrapi |

Add these to `Final backend/.env` (see backend README).
