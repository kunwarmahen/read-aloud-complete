# 🎧 Read Aloud — Complete

**A full-stack, cloud-enabled text-to-speech solution for reading any webpage aloud.**
This repository brings together the **Chrome Extension**, **Backend (FastAPI + TTS)**, and **Mobile App (React Native)** into one unified codebase — enabling a seamless “read anywhere, listen anywhere” experience.

---

## 🚀 Overview

Read Aloud Complete is designed to help you consume content on _your_ terms — hands-free and distraction-free.
Whether you're browsing the web, moving between devices, or prefer listening over reading, this system lets you:

- Send text from the Chrome extension to the cloud
- Convert it to audio using the backend TTS service
- Stream or play it instantly on your mobile app

Perfect for learning, productivity, accessibility, or reducing screen fatigue.

---

## 🏗️ Architecture

```
Chrome Extension → Cloud Backend (FastAPI) → Audio Storage → Mobile App (React Native)
```

### Components

- **Chrome Extension**:
  Extracts text from webpages and sends it to your backend.

- **Backend (Python + FastAPI)**:

  - Receives text
  - Generates speech using TTS
  - Returns a playable audio URL

- **Mobile App (React Native)**:

  - Displays your audio list
  - Streams/plays the generated audio
  - Works great as a remote “podcast-style” player

---

## ✨ Features

- 🌐 **Read any webpage aloud** with one click
- 📤 **Cloud syncing** across devices
- 🔊 **High-quality TTS** (extensible to OpenAI, Azure, AWS, etc.)
- 📱 **Cross-platform mobile app** (iOS + Android)
- ⏯️ **Audio playback controls** (play, pause, seek)
- 💾 **Persistent storage** for your audio history
- ⚙️ **Configurable API endpoint**

---

## 📂 Repository Structure

```
read-aloud-complete/
│
├── chrome-extension/     # Extension source
│   ├── popup/
│   ├── background/
│   └── manifest.json
│
├── backend/              # Python FastAPI server + TTS
│   ├── tts_service.py
│   ├── requirements.txt
│   └── utils/
│
├── mobile/               # React Native app (Expo)
│   ├── app/
│   ├── components/
│   └── package.json
│
└── README.md

read-aloud
│
└──combined_server.py     # Cast and TTS Server

```

---

## 📦 Installation & Setup

### 1️⃣ Backend (FastAPI + TTS)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
./quickstart.sh
```

By default, the server listens on:

```
http://localhost:8000
```

### 2️⃣ TTS and Cast Server

```bash
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python combined_server.py
```

By default, the server listens on:

````
http://localhost:5000


### 3️⃣ Chrome Extension

1. Go to **chrome://extensions**
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the `chrome-extension/` folder

Update the extension’s `API_URL` to point to your backend.

### 4️⃣ Mobile App (React Native)

```bash
cd mobile
npm install
npx expo start
````

Then open using the Expo Go app or a simulator.

Update environment variables to point the app to your backend.

---

## 🔧 Configuration

Backend URL config lives in:

- Chrome extension → `/chrome-extension/config.js`
- Mobile → `.env` (or inside config/constants.js depending on your setup)

Example:

```
API_URL=http://<your-server-ip>:8000
```

---

## 🔥 API Endpoints

### POST `/synthesize`

Send text → receive audio URL

**Request:**

```json
{
  "text": "Hello world!"
}
```

**Response:**

```json
{
  "audio_url": "https://your-server/audio/12345.mp3"
}
```

---

## 🧪 Testing

### Extension

- Install extension
- Visit any webpage
- Highlight text → click **Read Aloud**

### Backend

```bash
curl -X POST http://localhost:8000/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello"}'
```

### Mobile App

- Verify audio entries are visible
- Tap to play

---

## 📍 Roadmap

- [ ] Queue system for long articles
- [ ] Support for multiple voices
- [ ] Offline caching of audio
- [ ] Bookmark syncing
- [ ] User accounts + personalized library

---

## 🤝 Contributing

Feel free to open PRs, issues, or feature requests.
This project is evolving quickly — ideas are welcome!

---

## 📝 License

MIT License — free to modify and use.

---
