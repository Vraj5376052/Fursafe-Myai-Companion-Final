# Fursafe MyAI Companion

A healthcare support mobile app. Patients describe symptoms or scan medical documents and receive plain-language AI summaries. Not a medical professional — always consult a doctor.

Built with **React Native (Expo)** + **FastAPI (Python)**.

---

## What You Need Before Starting

- A Mac, Windows, or Linux computer
- Your phone (iOS or Android) on the **same Wi-Fi** as your computer
- Internet connection

---

## Step 1 — Install these tools on your computer

### Node.js
Go to https://nodejs.org — download and install the **LTS** version.

Check it worked:
```
node --version
npm --version
```

### Miniconda (Python environment manager)
Go to https://docs.conda.io/en/latest/miniconda.html — download and install for your operating system.

Check it worked:
```
conda --version
```

### Git
Go to https://git-scm.com — download and install.

Check it worked:
```
git --version
```

### Expo Go (on your phone)
- iPhone: search "Expo Go" in the App Store
- Android: search "Expo Go" in the Google Play Store

---

## Step 2 — Get API keys (free)

You need two API keys. Get them before continuing.

### Groq API key (for AI chat + voice transcription)
1. Go to https://console.groq.com
2. Sign up with Google or email
3. Click **API Keys** in the left sidebar
4. Click **Create API Key**
5. Copy the key — it looks like `gsk_xxxxxxxxxxxx`

### OCR.space API key (for document scanning)
1. Go to https://ocr.space/ocrapi
2. Click **Free API** or **Register for free API key**
3. Fill in name and email
4. Check your email — the key will be in the email they send you

---

## Step 3 — Download the project

Open a terminal (Mac: search Terminal, Windows: search Command Prompt) and run:

```
git clone https://github.com/Vraj5376052/Fursafe-Myai-Companion-Final.git
```

Then go into the folder:
```
cd Fursafe-Myai-Companion-Final
```

---

## Step 4 — Find your computer's local IP address

Your phone needs to connect to your computer. Run this to find your IP:

**Mac:**
```
ipconfig getifaddr en0
```

**Windows:**
```
ipconfig
```
Look for **IPv4 Address** under your Wi-Fi section. It will look like `192.168.x.x` or `10.x.x.x`.

Write this IP down — you need it in Step 6.

---

## Step 5 — Set up and run the Backend

Open a new terminal window and run these commands **one at a time**:

```
cd Fursafe-Myai-Companion-Final/Final\ backend
```

Create the Python environment (only do this once):
```
conda create -n myai python=3.11 -y
```

Activate it (do this every time you open a new terminal):
```
conda activate myai
```

Install all Python packages:
```
pip install -r requirements.txt
```

Create the API keys file:
```
touch .env
```
On Windows instead run:
```
type nul > .env
```

Open the `.env` file in any text editor and paste this (replacing with your actual keys):
```
GROQ_API_KEY=paste_your_groq_key_here
OCR_API_KEY=paste_your_ocr_space_key_here
```
Save the file.

Start the backend server:
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Leave this terminal open. The backend must keep running while you use the app.

---

## Step 6 — Set up and run the Frontend

Open a **second** terminal window and run these commands **one at a time**:

```
cd Fursafe-Myai-Companion-Final/Final\ frontend
```

Install all JavaScript packages:
```
npm install
```

Install Expo packages:
```
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

**Update the IP address** — open `src/services/apiService.js` in a text editor. Find line 4 which looks like:
```
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://10.128.170.142:8000";
```

Replace the IP (`10.128.170.142`) with **your IP from Step 4**. For example if your IP is `192.168.1.50`:
```
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.50:8000";
```
Save the file.

Start the frontend:
```
npx expo start --clear
```

A QR code will appear in the terminal.

- **iPhone**: Open your camera app and point it at the QR code, then tap the notification
- **Android**: Open the Expo Go app, tap "Scan QR code", then scan it

The app will load on your phone.

---

## Every Time You Come Back

You need to start both the backend and frontend again. Open two terminal windows:

**Terminal 1 — Backend:**
```
cd Fursafe-Myai-Companion-Final/Final\ backend
conda activate myai
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```
cd Fursafe-Myai-Companion-Final/Final\ frontend
npx expo start --clear
```

---

## Common Problems

**"Server timeout" or "Network request failed" when logging in**

Your IP has changed (this happens when you reconnect to Wi-Fi). Run `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows) to get the new IP. Update it in `Final frontend/src/services/apiService.js` line 4, then restart the frontend with `npx expo start --clear`.

**"ModuleNotFoundError" when starting backend**

You forgot to activate conda. Run `conda activate myai` then try again.

**Old version of app showing on phone**

Run `npx expo start --clear` — the `--clear` flag clears the cache.

**Camera or microphone not working**

When the app asks for permission, tap Allow. On iPhone go to Settings → Expo Go → turn on Camera and Microphone.

**App crashes or shows white screen**

Run `npm install` then `npx expo start --clear`.

**"Email already registered" when signing up**

That email already has an account. Try logging in instead, or use a different email.
