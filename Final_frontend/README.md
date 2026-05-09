# MyAI Companion — Frontend

React Native app built with Expo. Runs on iPhone or Android via the Expo Go app.

For full setup instructions see the root [README.md](../README.md).

---

## Quick Start (if already set up)

```
cd Fursafe-Myai-Companion-Final/Final_frontend
npx expo start --clear
```

Scan the QR code with Expo Go on your phone.

---

## First Time Setup

### 1. Install packages
```
npm install
```

### 2. Install Expo packages
```
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

### 3. Set your backend IP

Find your computer's local IP:

Mac:
```
ipconfig getifaddr en0
```

Windows:
```
ipconfig
```

Open `src/services/apiService.js` and update line 4:
```javascript
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://YOUR_IP_HERE:8000";
```

Replace `YOUR_IP_HERE` with your actual IP. Save the file.

### 4. Start the app
```
npx expo start --clear
```

Scan the QR code:
- iPhone: use the Camera app
- Android: use the Expo Go app → Scan QR Code

---

## IP Address Changed?

Run this to get the new IP:
```
ipconfig getifaddr en0
```

Update line 4 in `src/services/apiService.js`, then:
```
npx expo start --clear
```

---

## File Structure

```
Final_frontend/
├── App.js                       ← navigation and global state
├── package.json                 ← dependencies
└── src/
    ├── screens/
    │   ├── Splashscreen.js
    │   ├── Onboardingscreen.js
    │   ├── Loginscreen.js
    │   ├── Signupscreen.js
    │   ├── Homescreen.js
    │   ├── Chatscreen.js        ← main AI chat
    │   ├── Recordscreen.js      ← voice recording
    │   ├── Camerascreen.js      ← OCR camera
    │   └── Userscreen.js        ← profile
    ├── services/
    │   └── apiService.js        ← all backend API calls
    └── styles/
        └── style.js             ← global styles
```

---

## Troubleshooting

**"Server timeout"** — Update IP in `apiService.js` line 4 and run `npx expo start --clear`

**Old version showing** — Always run `npx expo start --clear` (the `--clear` is required)

**Camera/mic not working** — Accept permissions on phone. iPhone: Settings → Expo Go → enable Camera + Microphone

**App crashes** — Run:
```
rm -rf node_modules
npm install
npx expo start --clear
```
