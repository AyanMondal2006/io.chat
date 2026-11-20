# io.chat — Local Machine Setup & Execution Guide

This guide provides end-to-end instructions for running **io.chat** on your local machine (Windows, macOS, or Linux).

> **Privacy & Security Note:** This guide contains zero private API keys, database credentials, or secret tokens. Replace placeholder tags like `<your-...>` with your own development credentials.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:

1. **Node.js:** Version `18.0.0` or higher (`node -v`).
2. **npm:** Version `9.0.0` or higher (`npm -v`).
3. **Git:** (`git -v`).
4. **MongoDB:** Either:
   - A local MongoDB instance (`mongodb://localhost:27017/iochat_db`), or
   - A free cloud database on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
5. **GetStream.io Account:** A free developer account at [getstream.io](https://getstream.io) to obtain:
   - Stream App API Key
   - Stream App Secret

---

## 2. Directory Structure Overview

```text
STREAMIFY/
├── backend/               # Express.js REST API & WebSocket server
│   ├── src/
│   │   ├── controllers/   # Auth, user, chat, translation, grammar
│   │   ├── lib/           # MongoDB connection & Stream SDK setup
│   │   ├── middleware/    # JWT protectRoute middleware
│   │   ├── models/        # User & FriendRequest Mongoose models
│   │   └── routes/        # Express route definitions
│   ├── .env               # Backend environment variables (create this)
│   └── package.json
├── frontend/              # Vite + React 19 SPA
│   ├── src/
│   │   ├── components/    # UI components (BrandLogo, FriendCard, etc.)
│   │   ├── pages/         # Chat, Call, Home, Login, SignUp, etc.)
│   │   ├── lib/           # Axios instance & API caller functions
│   │   └── store/         # Zustand theme & state stores
│   ├── .env               # Frontend environment variables (create this)
│   └── package.json
└── package.json           # Root workspace configuration
```

---

## 3. Installation Steps

Open your terminal in the root folder of the project (`d:\STREAMIFY`):

### Step 1: Install Dependencies
Run the install commands for both backend and frontend:

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

---

## 4. Environment Variables Configuration

You need to create two `.env` files: one in `backend/` and one in `frontend/`.

### 4.1. Backend Configuration (`backend/.env`)
Create a file named `.env` inside the `backend` directory:

```env
# Server Port
PORT=5001

# Environment Mode
NODE_ENV=development

# MongoDB Connection String (Local or Cloud Atlas)
# For local: mongodb://localhost:27017/iochat_db
# For Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/iochat_db?retryWrites=true&w=majority
MONGO_URI=<your-mongodb-connection-string>

# JWT Secret (Any random 32+ character string for token signing)
JWT_SECRET_KEY=<your-random-jwt-secret-string>

# Stream Chat & Video Credentials (from getstream.io dashboard)
STREAM_API_KEY=<your-stream-api-key>
STREAM_API_SECRET=<your-stream-api-secret>

# Allowed Frontend URL for Local Development CORS
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173


### 4.2. Frontend Configuration (`frontend/.env`)
Create a file named `.env` inside the `frontend` directory:

```env
# Stream Public API Key (Must match STREAM_API_KEY from backend)
VITE_STREAM_API_KEY=<your-stream-api-key>

# Optional: In development, axios automatically defaults to http://localhost:5001/api.
# If you want to specify it explicitly:
VITE_API_URL=http://localhost:5001/api
```

---

## 5. Running the Application

For the best developer experience with hot reloading, open **two separate terminal windows**:

### Terminal 1: Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Start server in watch mode with nodemon
npm run dev
```

**Expected Terminal Output:**
```text
Server is running on port 5001 and bound to 0.0.0.0
MongoDB Connected: <your-cluster-or-localhost>
```

### Terminal 2: Start the Frontend Client

```bash
# Navigate to frontend directory
cd frontend

# Start Vite development server
npm run dev
```

**Expected Terminal Output:**
```text
  VITE v8.3.4  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 6. Verifying & Testing the Features Locally

### 1. Health Check
Open your browser or run:
```bash
curl http://localhost:5001/api/health
```
You should receive:
```json
{ "status": "ok", "message": "io.chat API is healthy" }
```

### 2. User Registration & Onboarding
1. Open `http://localhost:5173` in your browser.
2. Click **Create one** to sign up.
3. Enter your details and submit. An avatar is automatically generated.
4. Complete onboarding by choosing your **Native Language** (e.g. English) and **Learning Language** (e.g. Spanish).

### 3. Testing Real-Time Chat & Video (Two Users)
To test live messaging and video calling on one computer:
1. Open your primary browser window (`http://localhost:5173`) logged in as **User A**.
2. Open an **Incognito / Private window** (`http://localhost:5173`) and register a new account as **User B**.
3. In User A's dashboard, locate User B under **Your Community** and click **Connect**.
4. In User B's window, navigate to **Notifications**, accept the friend request.
5. In either window, click **Message** on the friend card to enter the chat room.
6. Test features:
   - **Real-Time Messages:** Type and send messages to verify instant delivery.
   - **Message Search:** Use the search bar inside the chat to test message jumping.
   - **Translation:** Click the translate icon on any received message.
   - **Grammar Check:** In the composer, type `she go to school yesterday` and click the sparkle icon. LanguageTool will suggest `she went to school yesterday`. Click **Apply**.
   - **Video Calling:** Click the camera icon in the chat header. A link will be posted into the chat. Click it in both windows to join the WebRTC call.

---

## 7. Troubleshooting Common Local Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`Error in connection to MongoDB`** | MongoDB service stopped or Atlas IP not allowed | - If using local MongoDB, ensure service is running (`mongod`).<br>- If using Atlas, go to **Network Access** and add your current IP address (or `0.0.0.0/0` for testing). |
| **`Stream API key or Secret is missing`** | Variables not defined in `backend/.env` | Check `backend/.env` and ensure `STREAM_API_KEY` and `STREAM_API_SECRET` are present with no extra spaces. |
| **`Port 5001 is already in use`** | Another process is holding port 5001 | On Windows: `netstat -ano \| findstr :5001` then `taskkill /PID <PID> /F`.<br>Or change `PORT=5002` in `backend/.env`. |
| **`CORS blocked for origin: http://localhost:5173`** | Origin mismatch | Ensure `CLIENT_URL=http://localhost:5173` is set in `backend/.env`. |
| **`Cannot connect to video call`** | Missing camera/mic permissions | Click the padlock icon in your browser address bar and allow Camera and Microphone permissions for `localhost`. |
