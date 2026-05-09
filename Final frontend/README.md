# MyAI Companion — Frontend

React Native app built with Expo. Runs on your phone via the Expo Go app.

---

## Before You Start

- Install **Node.js** from https://nodejs.org (LTS version)
- Install **Expo Go** on your phone (App Store / Google Play)
- Make sure the **backend server is running** (see `Final backend/README.md`)
- Your phone and computer must be on the **same Wi-Fi network**

---

## First-Time Setup

Run these commands one at a time.

### 1. Go into the frontend folder
```
cd Fursafe-Myai-Companion-Final/Final\ frontend
```

### 2. Install JavaScript packages
```
npm install
```

### 3. Install Expo packages
```
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

### 4. Find your computer's local IP address

**Mac:**
```
ipconfig getifaddr en0
```

**Windows:**
```
ipconfig
```
Look for **IPv4 Address** under your Wi-Fi adapter. It will look like `192.168.x.x` or `10.x.x.x`.

### 5. Update the IP in apiService.js

Open `src/services/apiService.js` in a text editor. Line 4 looks like this:
```javascript
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://10.128.170.142:8000";
```

Replace the IP with **your actual IP from the step above**. For example:
```javascript
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.50:8000";
```
Save the file.

### 6. Start the app
```
npx expo start --clear
```

A QR code appears in the terminal.

- **iPhone**: Open the Camera app → point at QR code → tap the notification that appears
- **Android**: Open Expo Go app → tap "Scan QR code" → scan it

---

## Every Time After That

```
cd Fursafe-Myai-Companion-Final/Final\ frontend
npx expo start --clear
```

---

## If Your IP Changed

This happens when you reconnect to Wi-Fi or switch networks.

1. Run `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. Copy the new IP
3. Open `src/services/apiService.js` and update line 4
4. Save, then run `npx expo start --clear`

---

## Screens

| Screen | What it does |
|--------|-------------|
| Splash | Loading screen |
| Onboarding | 4-slide intro |
| Login | Sign in or continue as guest |
| Signup | Create account |
| Home | Main screen |
| Chat | AI conversation with history, chips, TTS |
| Record | Record voice → transcribe → send to AI |
| Camera | Scan document → OCR → send to AI |
| Profile | Edit name/password, toggle auto-speak, logout |

---

## Troubleshooting

**"Server timeout" or "Network request failed"**
1. Make sure the backend is running (see `Final backend/README.md`)
2. Get your current IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
3. Update it in `src/services/apiService.js` line 4
4. Restart: `npx expo start --clear`

**App shows old version / changes not appearing**
```
npx expo start --clear
```
The `--clear` flag is important — always include it.

**"Cannot find module" errors**
```
npm install
npx expo install expo-speech expo-av expo-camera expo-image-picker expo-secure-store
```

**Camera or microphone not working**
- Tap Allow when the app asks for permissions
- iPhone: Settings → Expo Go → enable Camera and Microphone
- Android: Settings → Apps → Expo Go → Permissions → enable all

**App crashes or white screen on open**
```
rm -rf node_modules
npm install
npx expo start --clear
```
On Windows:
```
rd /s /q node_modules
npm install
npx expo start --clear
```
