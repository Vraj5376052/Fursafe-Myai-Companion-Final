# MyAI Companion — Backend

FastAPI backend for the MyAI Companion app. Handles authentication, AI chat, OCR, and audio transcription.

---

## Tech Stack

- **Python 3.11**
- **FastAPI** — web framework
- **SQLite** — database (via SQLAlchemy)
- **Groq API** — Llama 3.3-70b (AI chat + translation) + Whisper large-v3 (transcription)
- **OCR.space API** — document/prescription scanning
- **python-jose** — JWT authentication
- **bcrypt** — password hashing

---

## Setup from Scratch

### Step 1 — Install Miniconda

Download and install from: https://docs.conda.io/en/latest/miniconda.html

Verify it works:
```bash
conda --version
```

### Step 2 — Create Python environment

```bash
conda create -n myai python=3.11 -y
conda activate myai
```

> Every time you open a new terminal you must run `conda activate myai` first.

### Step 3 — Clone the repo

```bash
git clone https://github.com/Vraj5376052/Fursafe-Myai-Companion-Final.git
cd Fursafe-Myai-Companion-Final/Final\ backend
```

### Step 4 — Install dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `fastapi` — web server framework
- `uvicorn` — ASGI server to run FastAPI
- `sqlalchemy` — ORM for SQLite database
- `bcrypt` — password hashing
- `python-jose` — JWT token generation and verification
- `python-dotenv` — loads environment variables from `.env`
- `requests` — HTTP calls to Groq and OCR.space APIs
- `python-multipart` — required for file upload endpoints (OCR/transcribe)

### Step 5 — Create `.env` file

In the `Final backend/` folder, create a file named `.env`:

```bash
# macOS / Linux
touch .env

# Windows
type nul > .env
```

Open the `.env` file and add your API keys:

```
GROQ_API_KEY=your_groq_api_key_here
OCR_API_KEY=your_ocr_space_api_key_here
```

**How to get your API keys:**

- **Groq** (free tier available):
  1. Go to https://console.groq.com
  2. Sign up / log in
  3. Click "API Keys" in the sidebar
  4. Click "Create API Key" and copy it

- **OCR.space** (free tier available):
  1. Go to https://ocr.space/ocrapi
  2. Click "Register for free API key"
  3. Fill in the form and check your email for the key

### Step 6 — Find your local IP address

Your phone needs to reach the backend server over Wi-Fi. Find your machine's IP:

```bash
# macOS
ipconfig getifaddr en0

# Windows (run in Command Prompt)
ipconfig
# Look for "IPv4 Address" under your Wi-Fi adapter

# Linux
hostname -I
```

You'll need this IP when setting up the frontend.

### Step 7 — Run the server

```bash
conda activate myai
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

To verify it's working, open http://localhost:8000 in your browser — you should see `{"status":"online"}`.

---

## API Endpoints

### Authentication — `/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user, returns JWT + user |
| POST | `/auth/login` | Login with email/password, returns JWT + user |
| POST | `/auth/translate` | Translate text to target language |
| PUT | `/auth/update-profile` | Update display name or password |

### Chat — `/chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/create-chat` | Create a new chat session |
| GET | `/chat/fetch-chats` | Get all chats for logged-in user |
| GET | `/chat/fetch-chat/{id}` | Get single chat with all messages |
| POST | `/chat/add-chat/{id}` | Send a message and get AI response |
| DELETE | `/chat/delete-chat/{id}` | Delete a chat and all its messages |

### Scan — `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr` | Upload an image, returns extracted text |
| POST | `/api/transcribe` | Upload audio file, returns transcription |

---

## Project Structure

```
Final backend/
├── main.py                  # FastAPI app entry point, CORS config, router registration
├── requirements.txt         # Python package dependencies
├── .env                     # API keys — create this yourself (not committed to git)
├── myai_companion.db        # SQLite database — auto-created on first run
└── app/
    ├── auth/
    │   ├── router.py        # Login, register, translate, update-profile endpoints
    │   └── schemas.py       # Pydantic input validation models
    ├── chat/
    │   └── router.py        # Chat CRUD + Groq AI response generation
    ├── scan/
    │   └── router.py        # OCR.space image scanning + Groq Whisper transcription
    ├── core/
    │   └── database.py      # SQLite engine setup, session factory
    └── model/
        ├── user.py          # User database table
        ├── chat.py          # Chat + ChatMessage database tables
        └── transcript.py    # Transcript database table
```

---

## Troubleshooting

**`ModuleNotFoundError` on startup**
Make sure you activated the conda environment:
```bash
conda activate myai
pip install -r requirements.txt
```

**`GROQ_API_KEY not configured` error**
Check that your `.env` file is in the `Final backend/` folder (same level as `main.py`) and contains the key.

**Phone can't connect to backend**
- Make sure your phone and computer are on the **same Wi-Fi network**
- Check the IP in `Final frontend/src/services/apiService.js` matches your current machine IP
- Run `ipconfig getifaddr en0` (Mac) to get your current IP

**Database schema errors**
Delete the auto-generated database file and restart — it will recreate:
```bash
rm myai_companion.db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
