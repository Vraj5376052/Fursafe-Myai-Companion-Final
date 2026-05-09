# MyAI Companion — Setup Guide

A healthcare support mobile app that lets patients describe symptoms, scan medical documents, and receive plain-language AI summaries via voice, camera, or text chat.

> This app is a support tool only. It does not provide medical advice. Always consult a qualified healthcare professional.

---

## Overview

The app has two parts that both need to be running at the same time:

- **Backend** — a Python server that runs on your computer
- **Frontend** — a React Native app that runs on your phone via Expo Go

---

## Requirements

You will need:

- A computer (Mac, Windows, or Linux)
- A smartphone (iPhone or Android)
- Both your computer and phone connected to the **same Wi-Fi network**
- Internet connection

---

## Part 1 — Install Software on Your Computer

### 1.1 Install Node.js

Go to https://nodejs.org and download the **LTS** version. Run the installer.

Verify it installed correctly by opening a terminal and running:

```
node --version
```

```
npm --version
```

Both commands should print a version number. If they do, Node.js is installed.

---

### 1.2 Install Miniconda

Miniconda manages the Python environment for the backend.

Go to https://docs.conda.io/en/latest/miniconda.html and download the installer for your operating system. Run it and follow the prompts. When it asks, choose to add conda to your PATH.

After installing, **close and reopen your terminal**, then verify:

```
conda --version
```

It should print something like `conda 24.x.x`.

---

### 1.3 Install Git

Go to https://git-scm.com and download Git for your operating system. Run the installer with default settings.

Verify:

```
git --version
```

---

### 1.4 Install Expo Go on your phone

- **iPhone**: Open the App Store, search **Expo Go**, install it
- **Android**: Open the Google Play Store, search **Expo Go**, install it

---

## Part 2 — Get API Keys

The app uses two external services. Both have free tiers. You need to sign up and get keys before the backend will work.

### 2.1 Groq API Key (used for AI chat and voice transcription)

1. Go to https://console.groq.com
2. Click **Sign Up** and create a free account
3. After logging in, click **API Keys** in the left sidebar
4. Click **Create API Key**
5. Give it any name (e.g. "myai")
6. Copy the key — it starts with `gsk_`
7. Save it somewhere — you will need it in Part 4

### 2.2 OCR.space API Key (used for scanning documents and prescriptions)

1. Go to https://ocr.space/ocrapi
2. Click **Free API** or the register link on the page
3. Fill in your name and email address and submit
4. Check your email inbox — they will send you the API key
5. Copy the key and save it — you will need it in Part 4

---

## Part 3 — Download the Project

Open a terminal on your computer and run these commands one at a time.

Clone the repository:

```
git clone https://github.com/Vraj5376052/Fursafe-Myai-Companion-Final.git
```

Move into the project folder:

```
cd Fursafe-Myai-Companion-Final
```

---

## Part 4 — Set Up the Backend

Open a terminal. Run each command below one at a time and wait for each to finish before running the next.

### 4.1 Go into the backend folder

```
cd Fursafe-Myai-Companion-Final/Final\ backend
```

### 4.2 Create the Python environment

This only needs to be done once:

```
conda create -n myai python=3.11 -y
```

Wait for it to finish. It may take a minute.

### 4.3 Activate the environment

```
conda activate myai
```

You will see `(myai)` appear at the start of your terminal line. You need to run this every time you open a new terminal before starting the backend.

### 4.4 Install Python packages

```
pip install -r requirements.txt
```

Wait for all packages to finish installing.

### 4.5 Create the API keys file

**Mac or Linux:**
```
touch .env
```

**Windows:**
```
type nul > .env
```

Now open the `.env` file in any text editor (Notepad, TextEdit, VS Code, etc.). The file is located inside the `Final backend` folder.

Paste in the following, replacing the placeholder text with your actual keys from Part 2:

```
GROQ_API_KEY=paste_your_groq_key_here
OCR_API_KEY=paste_your_ocr_space_key_here
```

Save and close the file.

### 4.6 Find your computer's local IP address

Your phone connects to the backend using your computer's local IP address on the Wi-Fi network. You need to find this now.

**Mac:**
```
ipconfig getifaddr en0
```

**Windows (run in Command Prompt):**
```
ipconfig
```
Look for **IPv4 Address** under the section for your Wi-Fi adapter. It will look like `192.168.x.x` or `10.x.x.x`.

**Linux:**
```
hostname -I
```

Write down this IP address. You will need it in Part 5.

### 4.7 Start the backend server

```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server is ready when you see this in the terminal:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

To double-check it is working, open a browser on your computer and go to:

```
http://localhost:8000
```

You should see: `{"status":"online"}`

**Leave this terminal open and running.** Do not close it while using the app.

---

## Part 5 — Set Up the Frontend

Open a **second terminal window** (keep the first one running the backend). Run each command below one at a time.

### 5.1 Go into the frontend folder

```
cd Fursafe-Myai-Companion-Final/Final_frontend
```

### 5.2 Install JavaScript packages

```
npm install
```

Wait for it to finish. This may take a few minutes the first time.

### 5.3 Install Expo packages

```
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

### 5.4 Update the IP address in the app

Open the file `Final_frontend/src/services/apiService.js` in a text editor.

Find **line 4** which looks like this:

```
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.247:8000";
```

Replace the IP address (the part after the last `http://` and before `:8000`) with **your IP address from Step 4.6**.

For example, if your IP is `192.168.1.50`, line 4 should look like:

```
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.50:8000";
```

Save the file.

### 5.5 Start the app

```
npx expo start --clear
```

A QR code will appear in the terminal.

**iPhone:** Open your phone's Camera app, point it at the QR code, and tap the yellow Expo Go notification that appears at the top.

**Android:** Open the Expo Go app, tap **Scan QR Code**, then point your camera at the QR code.

The app will load on your phone in about 10–30 seconds.

---

## Every Time You Come Back

You need to start both the backend and frontend again each time. Open two separate terminal windows.

**Terminal 1 — Backend:**

```
cd Fursafe-Myai-Companion-Final/Final\ backend
conda activate myai
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**

```
cd Fursafe-Myai-Companion-Final/Final_frontend
npx expo start --clear
```

Scan the QR code with Expo Go.

---

## Important: When Your IP Address Changes

Your computer's local IP address can change when you reconnect to Wi-Fi, restart your router, or switch networks. When this happens the app will show "Server timeout" or "Network request failed".

To fix it:

1. Run `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows) to get the new IP
2. Open `Final_frontend/src/services/apiService.js` and update line 4 with the new IP
3. Save the file
4. Run `npx expo start --clear`
5. Scan the QR code again

---

## Troubleshooting

**"Server timeout" when trying to log in or send a message**
- Make sure the backend terminal is open and showing `Application startup complete`
- Check the IP in `src/services/apiService.js` matches your current local IP
- Test by opening `http://YOUR_IP:8000` in your phone's browser — if it shows `{"status":"online"}` the backend is reachable
- Make sure your phone and computer are on the same Wi-Fi network
- Run `npx expo start --clear` and scan the QR code again fresh

**"ModuleNotFoundError" when starting the backend**
```
conda activate myai
pip install -r requirements.txt
```

**"GROQ_API_KEY not configured" error**
The `.env` file is missing or has the wrong content. Make sure the file is inside the `Final backend` folder (same folder as `main.py`) and contains your actual API key on a single line with no extra spaces.

**App shows old version / login still fails after changing IP**
Metro (the JS bundler) cached the old version. Force clear it:
```
npx expo start --clear
```
Then on your phone, fully close Expo Go (swipe it away in your app switcher) and scan the QR code again.

**Database error on startup**
Delete the database file and let the server recreate it:

Mac/Linux:
```
cd Fursafe-Myai-Companion-Final/Final\ backend
rm myai_companion.db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Windows:
```
cd Fursafe-Myai-Companion-Final\Final backend
del myai_companion.db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Camera or microphone not working on phone**
When the app requests permissions, tap Allow. If you accidentally denied them:
- iPhone: Settings → Expo Go → enable Camera and Microphone
- Android: Settings → Apps → Expo Go → Permissions → enable Camera and Microphone

**`npm install` fails or app crashes on open**
Delete and reinstall all packages:

Mac/Linux:
```
cd Fursafe-Myai-Companion-Final/Final_frontend
rm -rf node_modules
npm install
npx expo start --clear
```

Windows:
```
cd Fursafe-Myai-Companion-Final\Final_frontend
rd /s /q node_modules
npm install
npx expo start --clear
```

---

## App Features

| Feature | How to use |
|---------|-----------|
| AI Chat | Type a message and tap the send button |
| Voice Input | Tap the microphone icon, record, and it sends to AI |
| Document Scan | Tap the camera icon, scan a document, and it sends to AI |
| Explain | Tap the Explain chip to get a simple explanation of your last message |
| Summarise | Tap the Summarise chip to get a summary of your last message |
| Translate | Tap the Translate chip and select a language |
| Text-to-Speech | Tap the speaker icon on any AI message to hear it read aloud |
| Auto-Speak | Toggle in the header or Profile screen to auto-read every AI response |
| Chat History | Tap the menu icon (top right) to see, switch, or delete past chats |
| Edit Profile | Tap the person icon → Edit Profile to change your name or password |
| Guest Mode | Tap "Continue as Guest" on the login screen — limited to basic features |
