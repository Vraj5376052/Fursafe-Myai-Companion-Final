# MyAI Companion — Backend

FastAPI server that handles login, AI chat, voice transcription, and document OCR.

---

## First-Time Setup

Run these commands one at a time in your terminal. Start from the project root folder.

### 1. Go into the backend folder
```
cd Fursafe-Myai-Companion-Final/Final\ backend
```

### 2. Create the Python environment (only once)
```
conda create -n myai python=3.11 -y
```

### 3. Activate the environment
```
conda activate myai
```
Run this every time you open a new terminal before starting the server.

### 4. Install all packages
```
pip install -r requirements.txt
```

### 5. Create the .env file with your API keys

**Mac/Linux:**
```
touch .env
```
**Windows:**
```
type nul > .env
```

Open `.env` in any text editor and add these two lines:
```
GROQ_API_KEY=your_groq_key_here
OCR_API_KEY=your_ocr_space_key_here
```

**Get Groq key (free):** https://console.groq.com → sign up → API Keys → Create API Key

**Get OCR.space key (free):** https://ocr.space/ocrapi → register → check your email

### 6. Start the server
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server is running when you see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

To test it, open http://localhost:8000 in your browser. You should see `{"status":"online"}`.

---

## Every Time After That

```
conda activate myai
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## API Routes

### Auth — `/auth`
| Method | Path | What it does |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns token + user |
| POST | `/auth/translate` | Translate text |
| PUT | `/auth/update-profile` | Change name or password |

### Chat — `/chat`
| Method | Path | What it does |
|--------|------|-------------|
| POST | `/chat/create-chat` | Start new chat |
| GET | `/chat/fetch-chats` | Get all chats |
| GET | `/chat/fetch-chat/{id}` | Get one chat with messages |
| POST | `/chat/add-chat/{id}` | Send message, get AI reply |
| DELETE | `/chat/delete-chat/{id}` | Delete a chat |

### Scan — `/api`
| Method | Path | What it does |
|--------|------|-------------|
| POST | `/api/ocr` | Upload image, get text back |
| POST | `/api/transcribe` | Upload audio, get text back |

---

## File Structure
```
Final backend/
├── main.py              ← entry point, run this with uvicorn
├── requirements.txt     ← all Python packages needed
├── .env                 ← your API keys (create this yourself)
├── myai_companion.db    ← SQLite database (auto-created)
└── app/
    ├── auth/router.py   ← login, register, translate, update profile
    ├── chat/router.py   ← chat CRUD + Groq AI responses
    ├── scan/router.py   ← OCR.space + Groq Whisper transcription
    ├── core/database.py ← database connection
    └── model/           ← database table definitions
```

---

## Troubleshooting

**`ModuleNotFoundError`**
```
conda activate myai
pip install -r requirements.txt
```

**`GROQ_API_KEY not configured`**
The `.env` file is missing or in the wrong folder. It must be inside `Final backend/` next to `main.py`.

**Database errors / schema mismatch**
Delete the database and let it recreate:
```
rm myai_companion.db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
On Windows:
```
del myai_companion.db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
