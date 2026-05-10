# MyAI Companion — Frontend

React Native mobile app built with Expo. Works on iOS and Android via the Expo Go app.

---

## Tech Stack

- **React Native** + **Expo SDK 54**
- **expo-speech** — text-to-speech playback
- **expo-av** — audio recording (voice input)
- **expo-camera** — camera access for document scanning
- **expo-image-picker** — pick images from phone gallery
- **expo-secure-store** — secure token storage
- **@expo/vector-icons** — Ionicons icon set

---

## Setup from Scratch

### Step 1 — Install Node.js

Download LTS version from: https://nodejs.org

Verify the installation:
```bash
node --version
npm --version
```

### Step 2 — Install Expo CLI

```bash
npm install -g expo-cli
```

### Step 3 — Install Expo Go on your phone

- **iOS**: Open the App Store and search "Expo Go"
- **Android**: Open the Google Play Store and search "Expo Go"

Install the app — you'll use it to run the app on your phone during development.

### Step 4 — Clone the repo

```bash
git clone https://github.com/Vraj5376052/Fursafe-Myai-Companion-Final.git
cd Fursafe-Myai-Companion-Final/Final\ frontend
```

### Step 5 — Install Node dependencies

```bash
npm install
```

### Step 6 — Install Expo packages

```bash
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

### Step 7 — Update the backend IP address

Your phone connects to your computer's backend over Wi-Fi, so you need to set the correct IP.

**Find your machine's local IP:**

```bash
# macOS
ipconfig getifaddr en0

# Windows (in Command Prompt)
ipconfig
# Look for "IPv4 Address" under your Wi-Fi adapter

# Linux
hostname -I
```

Open `src/services/apiService.js` and update line 4:

```javascript
const BASE_URL = Platform.OS === "web"
  ? "http://localhost:8000"
  : "http://YOUR_IP_HERE:8000";   // <-- replace with your actual IP
```

Example:
```javascript
const BASE_URL = Platform.OS === "web"
  ? "http://localhost:8000"
  : "http://192.168.1.105:8000";
```

> **Important:** Your phone and your computer must be connected to the **same Wi-Fi network**.

### Step 8 — Start the backend

Before starting the app, make sure the backend server is running.
Follow the instructions in `Final backend/README.md`.

### Step 9 — Start the app

```bash
npx expo start --clear
```

A QR code will appear in your terminal.

- **iOS**: Open your phone's Camera app and scan the QR code
- **Android**: Open the Expo Go app and tap "Scan QR code"

The app will load on your phone.

---

## Screens

| Screen | Description |
|--------|-------------|
| Splash | Loading screen shown on app open |
| Onboarding | 4-slide intro carousel explaining the app |
| Login | Email/password login + guest mode |
| Signup | Create a new account |
| Home | Landing page with "Start Chat" button |
| Chat | Main AI chat with history, Explain/Translate/Summarise chips, TTS |
| Record | Tap to record voice → transcribed → sent to AI |
| Camera | Point camera at document → OCR → sent to AI |
| User | Edit profile, toggle auto-speak, language preference, logout |

---

## Project Structure

```
Final frontend/
├── App.js                        # Root component — navigation + global state
├── package.json                  # npm dependencies
├── app.json                      # Expo config
└── src/
    ├── screens/
    │   ├── Splashscreen.js       # Loading screen
    │   ├── Onboardingscreen.js   # Intro slides
    │   ├── Loginscreen.js        # Login form
    │   ├── Signupscreen.js       # Registration form
    │   ├── Homescreen.js         # Home landing
    │   ├── Chatscreen.js         # AI chat interface
    │   ├── Recordscreen.js       # Voice recording
    │   ├── Camerascreen.js       # Camera / OCR
    │   └── Userscreen.js         # User profile
    ├── services/
    │   └── apiService.js         # All backend API calls
    └── styles/
        └── style.js              # Global StyleSheet
```

---

## Troubleshooting

**"Network request failed" when logging in or chatting**
- Make sure the backend server is running (see `Final backend/README.md`)
- Check the IP in `src/services/apiService.js` — it must match your machine's current IP
- Both your phone and computer must be on the same Wi-Fi network
- If you changed networks, find the new IP and update `apiService.js`

**App shows old version / changes not appearing**
Always start with the cache cleared:
```bash
npx expo start --clear
```

**"Cannot find module" error for expo packages**
```bash
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

**Camera or microphone not working**
- When the app asks for permissions, tap "Allow"
- On iOS: go to Settings → Expo Go → enable Camera and Microphone
- On Android: go to Settings → Apps → Expo Go → Permissions

**QR code won't scan**
- Make sure Expo Go is installed on your phone
- Try pressing `w` in the terminal to open the web version for testing

**App crashes on open / white screen**
- Check the terminal for error messages
- Run `npm install` to make sure all packages are installed
- Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```
