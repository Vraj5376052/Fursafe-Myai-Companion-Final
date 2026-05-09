# MyAI Companion — Backend

FastAPI server handling authentication, AI chat, voice transcription, and document OCR.

For full setup instructions see the root [README.md](../README.md).

---

## Quick Start (if already set up)

```
cd Fursafe-Myai-Companion-Final/Final\ backend
conda activate myai
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## First Time Setup

### 1. Create and activate Python environment
```
conda create -n myai python=3.11 -y
conda activate myai
```

### 2. Install packages
```
pip install -r requirements.txt
```

### 3. Create .env file with API keys

Mac/Linux:
```
touch .env
```

Windows:
```
type nul > .env
```

Open the `.env` file and add:
```
GROQ_API_KEY=your_groq_key_here
OCR_API_KEY=your_ocr_space_key_here
```

Get Groq key (free): https://console.groq.com → API Keys → Create API Key

Get OCR.space key (free): https://ocr.space/ocrapi → register → check email

### 4. Start the server
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Verify at http://localhost:8000 — should show `{"status":"online"}`

---

## API Routes

### Auth `/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account — returns token + user |
| POST | `/auth/login` | Login — returns token + user |
| POST | `/auth/translate` | Translate text to target language |
| PUT | `/auth/update-profile` | Update name or password |

### Chat `/chat`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat/create-chat` | Start a new chat session |
| GET | `/chat/fetch-chats` | Get all chats for logged-in user |
| GET | `/chat/fetch-chat/{id}` | Get one chat with all messages |
| POST | `/chat/add-chat/{id}` | Send message and get AI response |
| DELETE | `/chat/delete-chat/{id}` | Delete a chat and its messages |

### Scan `/api`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ocr` | Upload image → returns extracted text |
| POST | `/api/transcribe` | Upload audio → returns transcription |

---

## File Structure

```
Final backend/
├── main.py              ← run this with uvicorn
├── requirements.txt     ← Python dependencies
├── .env                 ← API keys (create this yourself, not in git)
├── myai_companion.db    ← SQLite database (auto-created on first run)
└── app/
    ├── auth/
    │   ├── router.py    ← login, register, translate, update-profile
    │   └── schemas.py   ← input validation
    ├── chat/
    │   └── router.py    ← chat CRUD + Groq AI
    ├── scan/
    │   └── router.py    ← OCR.space + Groq Whisper
    ├── core/
    │   └── database.py  ← SQLite connection
    └── model/
        ├── user.py      ← users table
        ├── chat.py      ← chats + messages tables
        └── transcript.py
```

---

## Troubleshooting

**`ModuleNotFoundError`** — Run `conda activate myai` then `pip install -r requirements.txt`

**`GROQ_API_KEY not configured`** — The `.env` file must be inside `Final backend/` next to `main.py`

**Database errors** — Delete and recreate:
```
rm myai_companion.db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
