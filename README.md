<div align="center">

  <a href="#">
    <img src="frontend/public/favicon.svg" alt="io.chat logo" width="110" height="110" />
  </a>

  <h1>io.chat</h1>

  <p><strong>Real-time language exchange that breaks barriers.</strong></p>

  <p><em>(MERN Stack · Stream Chat & Video · LibreTranslate & LanguageTool)</em></p>

  <p>
    Full-stack real-time communication platform for language learners. Connect with global peers, chat with instant inline translation, polish your messages with AI grammar assistance, and launch HD WebRTC video calls directly in the browser.
  </p>

  <p>
    <a href="#"><img src="https://img.shields.io/badge/release-v1.0.0-7c3aed?style=flat" alt="release v1.0.0" /></a>
    <a href="#"><img src="https://img.shields.io/badge/license-ISC-4f46e5?style=flat" alt="license ISC" /></a>
    <a href="#"><img src="https://img.shields.io/badge/ci-passing-22c55e?style=flat" alt="ci passing" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Node-v20+-7c3aed?style=flat" alt="Node v20+" /></a>
    <a href="#"><img src="https://img.shields.io/badge/React-v19.0-6366f1?style=flat" alt="React v19" /></a>
  </p>

  <p>
    <a href="#quick-start">Quick start</a> ·
    <a href="#features">Features</a> ·
    <a href="#how-it-works">How it works</a> ·
    <a href="#architecture">Architecture</a> ·
    <a href="#install">Install</a> ·
    <a href="#configuration">Configuration</a> ·
    <a href="#security">Security</a>
  </p>

</div>

---

<a id="quick-start"></a>
## ⚡ Quick Start

### 1. Clone & install dependencies
```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment
Create `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET_KEY=<your-jwt-secret>
STREAM_API_KEY=<your-stream-api-key>
STREAM_API_SECRET=<your-stream-api-secret>
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_STREAM_API_KEY=<your-stream-api-key>
```

### 3. Run development servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

---

<a id="features"></a>
## ✨ Features

- **💬 Real-Time Messaging:** Stream Chat SDK with sub-second message sync, typing indicators, segmented emoji reactions, and file attachments.
- **🔍 In-Conversation Search:** Instant message discovery with auto-scroll highlighting (`jumpToMessage`).
- **🌐 Real-Time Translation:** One-click inline message translation into target languages (Hindi, Bengali, English) via LibreTranslate.
- **✍️ AI Grammar Writing Assistant:** Integrated LanguageTool checker directly in the message composer. Analyzes grammar and syntax with one-click corrections.
- **📹 WebRTC Video Calling:** High-definition video and audio rooms powered by Stream Video SDK with microphone/camera toggles and speaker layout.
- **🤝 Language Partner Discovery:** Smart social matching system filtering learners by language pairing and friend states.
- **🎨 32 Themes:** Instant customizable aesthetic engine powered by DaisyUI and persisted locally.

---

<a id="how-it-works"></a>
## ⚙️ How It Works

1. **Authentication:** Register an account; the backend salts your password with bcrypt, automatically queries an avatar microservice, provisions a Stream account, and issues a secure JWT.
2. **Matching:** Discover language learners who speak your target language, send mutual connection requests, and receive incoming notifications.
3. **Chatting:** Direct channels are generated deterministically (`[userA, userB].sort().join("-")`) using Stream Chat WebSockets.
4. **Translation & Grammar:** The message composer checks grammar via LanguageTool API, applying right-to-left character offset replacements. Received messages can be translated in place.
5. **Video Calls:** Clicking the video call button generates a `/call/:channelId` room and posts a link directly into chat for instant joining.

---

<a id="architecture"></a>
## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   io.chat Client                       │
│        React 19 • Vite • Tailwind CSS • DaisyUI        │
│          Stream Chat React • Stream Video React        │
└───────────────────────────┬────────────────────────────┘
                            │ (HTTPS REST + WSS)
┌───────────────────────────▼────────────────────────────┐
│                   io.chat Backend                      │
│            Node.js • Express.js (0.0.0.0:PORT)         │
│          JWT Auth Guard • Dynamic CORS Whitelist       │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
┌──────▼───────┐     ┌──────▼───────┐     ┌──────▼───────┐
│MongoDB Atlas │     │ Stream Cloud │     │LibreTranslate│
│(Users/Friends│     │ (Chat/Video) │     │& LanguageTool│
└──────────────┘     └──────────────┘     └──────────────┘
```

---

<a id="install"></a>
## 📦 Install

See the detailed [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md) for full prerequisites, database setups, and platform-specific commands.

---

<a id="configuration"></a>
## 🔧 Configuration

### Environment Variables Matrix

| Variable | Location | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | `backend/.env` | No | Server port (default: 5001) |
| `MONGO_URI` | `backend/.env` | Yes | MongoDB Atlas or local connection string |
| `JWT_SECRET_KEY` | `backend/.env` | Yes | Cryptographic secret for signing JWTs |
| `STREAM_API_KEY` | `backend/.env` | Yes | Stream application public key |
| `STREAM_API_SECRET` | `backend/.env` | Yes | Stream application private secret |
| `CLIENT_URL` | `backend/.env` | Yes | Allowed frontend origin for CORS |
| `VITE_STREAM_API_KEY` | `frontend/.env` | Yes | Client-side Stream public key |
| `VITE_API_URL` | `frontend/.env` | Production | Backend API base URL for Vercel deployment |

---

<a id="security"></a>
## 🛡️ Security

- **Dual Session Authentication:** `sameSite: "none"` and `secure: true` cross-origin cookies in production with `Authorization: Bearer` fallback interceptor.
- **Dynamic CORS:** Regex-validated origin checks preventing unauthorized cross-site requests.
- **Input Boundaries:** 5,000-character ceiling enforced on translation and grammar proxies.
- **Zero Secret Exposure:** Zero production keys or credentials committed to repository.

---

## 📄 Complete Technical Documentation

For complete sequence diagrams, database schemas, and full API endpoint specifications, read [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).
