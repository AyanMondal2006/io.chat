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
    <a href="#system-architecture">Architecture</a> ·
    <a href="#installation">Install</a> ·
    <a href="#configuration">Configuration</a> ·
    <a href="#security">Security</a>
  </p>

</div>

---

> **Security & Privacy Notice:** This documentation contains zero private secrets, API keys, database credentials, or sensitive user records. All configurations use generic placeholders (e.g., `<your-secret-key>`).

---

<a id="quick-start"></a>
## 1. Quick Start & Executive Summary

**io.chat** is a real-time language learning and cross-border communication platform. It bridges language barriers by pairing learners worldwide for synchronous conversation while augmenting communication through integrated AI translation, real-time grammar assistance, and high-definition WebRTC video calling.

---

<a id="system-architecture"></a>
## 2. System Architecture

The application is engineered as a decoupled modern web stack comprising a Single Page Application (SPA) frontend, an asynchronous Node.js/Express backend API, and third-party cloud infrastructure for real-time WebRTC and chat synchronization.

```mermaid
flowchart TD
    Client["User Browser (Desktop / Mobile)"]

    subgraph ClientLayer ["Frontend Client (Vercel)"]
        ViteApp["io.chat React 19 SPA"]
        Router["React Router v7 Client Routing"]
        QueryClient["TanStack React Query Cache"]
        AxiosClient["Axios HTTP Client (HttpOnly + Bearer)"]
        StreamChatUI["Stream Chat React SDK"]
        StreamVideoUI["Stream Video React SDK"]
    end

    subgraph APILayer ["Backend API (Render Web Service)"]
        ExpressApp["Express.js Server (0.0.0.0:PORT)"]
        CORSMiddleware["Dynamic CORS & Origin Guard"]
        AuthGuard["JWT Authentication Middleware"]
        AuthCtrl["Auth Controller"]
        UserCtrl["User & Social Graph Controller"]
        ChatCtrl["Stream Token Controller"]
        TranslateCtrl["LibreTranslate Proxy Controller"]
        CorrectCtrl["LanguageTool Proxy Controller"]
    end

    subgraph PersistenceLayer ["Database & Cloud Services"]
        MongoDB[("MongoDB Atlas (Database Cluster)")]
        StreamNetwork["Stream Cloud (Chat WebSockets & Video SFU)"]
        LibreTranslateAPI["LibreTranslate Engine"]
        LanguageToolAPI["LanguageTool Grammar Engine"]
        AvatarMicroservice["Avatar Generation Service"]
    end

    Client --> ViteApp
    ViteApp --> Router
    Router --> QueryClient
    QueryClient --> AxiosClient
    ViteApp --> StreamChatUI
    ViteApp --> StreamVideoUI

    AxiosClient -->|"HTTPS REST Requests"| ExpressApp
    ExpressApp --> CORSMiddleware
    CORSMiddleware --> AuthGuard
    AuthGuard --> AuthCtrl
    AuthGuard --> UserCtrl
    AuthGuard --> ChatCtrl
    AuthGuard --> TranslateCtrl
    AuthGuard --> CorrectCtrl

    AuthCtrl -->|"Mongoose ODM"| MongoDB
    UserCtrl -->|"Mongoose ODM"| MongoDB
    ChatCtrl -->|"Stream Server SDK"| StreamNetwork
    TranslateCtrl -->|"REST POST /translate"| LibreTranslateAPI
    CorrectCtrl -->|"REST POST /check"| LanguageToolAPI
    AuthCtrl -->|"Fetch Initial Avatar"| AvatarMicroservice

    StreamChatUI <-->|"Persistent WSS Connection"| StreamNetwork
    StreamVideoUI <-->|"WebRTC Media Transport"| StreamNetwork
```

---

<a id="how-it-works"></a>
## 3. How It Works: End-to-End System Workflows

### 3.1. User Registration & Authentication Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as New User
    participant UI as Frontend (LoginPage / SignUpPage)
    participant API as Backend (/api/auth)
    participant Avatar as Avatar Microservice
    participant DB as MongoDB Atlas
    participant Stream as Stream Cloud

    User->>UI: Enter fullName, email, password
    UI->>API: POST /api/auth/signup
    API->>DB: Check if email already exists
    alt Email exists
        DB-->>API: User found
        API-->>UI: 400 Bad Request ("Email already exists")
    else Email available
        API->>Avatar: Request random avatar image URL
        Avatar-->>API: Return generated image URL
        API->>DB: Create User record (Password bcrypt-hashed via pre-save hook)
        DB-->>API: User record created with ObjectId
        API->>Stream: upsertUser(id, name, image)
        Stream-->>API: User provisioned on Stream network
        API->>API: Sign JWT with userId & 7-day expiration
        API-->>UI: 201 Created + HttpOnly Cookie (sameSite: None, secure: true) + { user, token }
        UI->>UI: Store token in localStorage (fallback) & redirect to /onboarding
    end
```

### 3.2. Social Discovery & Mutual Friendship Workflow

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Learner A
    actor UserB as Learner B
    participant Frontend as io.chat Frontend
    participant Backend as Express Backend
    participant DB as MongoDB

    UserA->>Frontend: Open Home Dashboard
    Frontend->>Backend: GET /api/users (Recommended Partners)
    Backend->>DB: Query users where isOnboarded=true, _id != UserA, _id not in UserA.friends
    DB-->>Backend: Return list of matching learners
    Backend-->>Frontend: Render Friend Cards with native & learning language flags
    UserA->>Frontend: Click "Connect / Send Request" on Learner B
    Frontend->>Backend: POST /api/users/friend-request/:userBId
    Backend->>DB: Create FriendRequest (sender: A, recipient: B, status: "pending")
    DB-->>Backend: FriendRequest saved
    Backend-->>Frontend: 201 Created

    UserB->>Frontend: Open Notifications Page
    Frontend->>Backend: GET /api/users/friend-requests
    Backend->>DB: Find FriendRequests where recipient=B, status="pending"
    DB-->>Backend: Return pending requests
    Backend-->>Frontend: Display incoming request from User A
    UserB->>Frontend: Click "Accept Request"
    Frontend->>Backend: PUT /api/users/friend-request/:requestId/accept
    Backend->>DB: Update FriendRequest status to "accepted"
    Backend->>DB: $addToSet UserA to UserB.friends & UserB to UserA.friends
    DB-->>Backend: Mutual friendship confirmed
    Backend-->>Frontend: 200 OK ("Friend request accepted")
```

### 3.3. Real-Time Chat & Search Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant ChatPage as ChatPage Component
    participant Backend as Backend API
    participant Stream as Stream Network

    User->>ChatPage: Open /chat/:partnerId
    ChatPage->>Backend: GET /api/chat/token
    Backend->>Stream: generateStreamToken(user._id)
    Stream-->>Backend: Signed Stream Token
    Backend-->>ChatPage: { token }
    ChatPage->>Stream: StreamChat.getInstance().connectUser(user, token)
    Stream-->>ChatPage: Connection established
    ChatPage->>ChatPage: Generate channel ID: [user._id, partner._id].sort().join("-")
    ChatPage->>Stream: client.channel("messaging", channelId).watch()
    Stream-->>ChatPage: Synchronize messages, reactions, typing state, read receipts

    User->>ChatPage: Type query in conversation search bar
    ChatPage->>Stream: channel.search({ text: { $autocomplete: query } })
    Stream-->>ChatPage: Matching message hits with IDs & timestamps
    User->>ChatPage: Click on search result
    ChatPage->>Stream: jumpToMessage(messageId)
    Stream-->>ChatPage: Scroll and highlight target message in viewport
```

### 3.4. In-Chat Translation & AI Grammar Correction Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Chat Participant
    participant Composer as GrammarCorrectionComposer / TranslatableMessage
    participant Backend as Express API
    participant Engine as LanguageTool / LibreTranslate

    alt Translation Flow
        User->>Composer: Click Translate Icon on message bubble
        Composer->>Backend: POST /api/chat/translate { text, target: "hi" }
        Backend->>Engine: POST LibreTranslate /translate { q, source: "auto", target: "hi" }
        Engine-->>Backend: { translatedText: "..." }
        Backend-->>Composer: 200 OK { originalText, translatedText, target }
        Composer->>Composer: Expand inline translation container under bubble
    else Grammar Correction Flow
        User->>Composer: Write draft text & click "Check Grammar" (Sparkle Icon)
        Composer->>Backend: POST /api/chat/correct { text }
        Backend->>Engine: POST LanguageTool /v2/check { text, language: "en-US" }
        Engine-->>Backend: Matches array with offsets, lengths, and replacement suggestions
        Backend->>Backend: Sort matches right-to-left and compute corrected text
        Backend-->>Composer: 200 OK { originalText, correctedText, issues, hasCorrections }
        Composer->>Composer: Render review panel with explanation cards & "Apply" action
        User->>Composer: Click "Apply"
        Composer->>Composer: Replace draft in Stream MessageComposer
    end
```

### 3.5. WebRTC Video Calling Workflow

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Caller
    actor UserB as Receiver
    participant CallButton as CallButton Component
    participant StreamChannel as Stream Chat Channel
    participant CallPage as CallPage (/call/:channelId)
    participant VideoSDK as Stream Video Client

    UserA->>CallButton: Click Video Call Button in Chat Header
    CallButton->>StreamChannel: Send message: "I've started a video call. Join me here: [Call URL]"
    StreamChannel-->>UserB: Real-time message notification with link
    UserA->>CallPage: Navigate to /call/:channelId
    CallPage->>VideoSDK: StreamVideoClient.call("default", channelId)
    VideoSDK->>VideoSDK: call.join({ create: true })
    VideoSDK-->>UserA: Render Camera & Microphone stream with CallControls

    UserB->>StreamChannel: Click call invitation link
    UserB->>CallPage: Navigate to /call/:channelId
    CallPage->>VideoSDK: StreamVideoClient.call("default", channelId)
    VideoSDK->>VideoSDK: call.join({ create: true })
    VideoSDK-->>UserB: Render Peer Video in SpeakerLayout
    Note over UserA,UserB: Two-way WebRTC audio/video stream active via Stream SFU
```

---

<a id="features"></a>
## 4. Features & Capabilities Matrix

| Category | Feature | Description | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Auth & Security** | JWT Authentication | Dual-transport session authorization | HttpOnly cookies (`sameSite: "none"`, `secure: true`) + `Authorization: Bearer` fallback |
| | Password Protection | Salted password hashing | `bcryptjs` with salt round 10 via Mongoose pre-save hook |
| | Dynamic CORS Guard | Zero-leak cross-origin security | Restricts access to configured origins and dynamic `*.vercel.app` domains |
| | Automated Avatars | Instant visual user profile setup | Generates unique avatars on signup via external microservice |
| **Social Graph** | Smart Matching | Language exchange partner finder | Filters by onboarding completion and excludes existing connections |
| | Mutual Friendship | Two-way handshake connection | Mongoose `$addToSet` prevents duplicate links; tracks pending states |
| | Request Management | Incoming/outgoing notification tray | Real-time pending counters and accept/decline triggers |
| **Messaging** | Real-Time Sync | Sub-second message delivery | Stream Chat WebSockets with typing indicators, reactions, and read status |
| | In-Chat Search | Instant message lookup and scroll | Full-text search with `jumpToMessage` automatic scroll centering |
| | File Attachments | Multimedia message support | Upload images, videos, and documents with auto-resizing CSS rules |
| **AI & Linguistics** | Live Translation | Multi-language message translation | Backend proxy to LibreTranslate with URL sanitation and timeout aborts |
| | Grammar Assistant | In-composer spelling & syntax polish | LanguageTool API integration with right-to-left character offset replacement |
| **Video Calling** | WebRTC Video | HD video meetings directly in browser | `@stream-io/video-react-sdk` with camera, mic, and speaker layout toggles |
| | Instant Invites | One-click meeting access | Automated invite link generation broadcasted directly to active chat |
| **Personalization**| 32 UI Themes | Instant aesthetic customization | DaisyUI theme engine persisted via Zustand store in `localStorage` |
| | Brand Identity | Distinctive visual language | Custom SVG squircle badge with geometric `io` nodes inside speech silhouette |

---

## 5. Database Schema & Data Models

### 5.1. User Model (`backend/src/models/User.js`)

Represents registered accounts, language profiles, and social relationships.

| Field | Type | Validation / Defaults | Purpose |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated | Unique record identifier |
| `fullName` | `String` | `required: true` | User's public display name |
| `email` | `String` | `required: true`, `unique: true` | Account login and identification |
| `password` | `String` | `required: true`, `minlength: 6` | Bcrypt-hashed password digest |
| `profilePic` | `String` | `default: ""` | Image URL for avatar display |
| `bio` | `String` | `default: ""` | Self-written user introduction |
| `nativeLanguage` | `String` | `default: ""` | Language the user is fluent in |
| `learningLanguage` | `String` | `default: ""` | Language the user wants to practice |
| `location` | `String` | `default: ""` | Country / City of residence |
| `isOnboarded` | `Boolean` | `default: false` | Gates access to dashboard until profile setup |
| `friends` | `[ObjectId]` | `ref: "User"` | Array of mutually connected partner user IDs |
| `createdAt` | `Date` | Managed by Mongoose | Account creation timestamp |
| `updatedAt` | `Date` | Managed by Mongoose | Last profile update timestamp |

### 5.2. FriendRequest Model (`backend/src/models/FriendRequest.js`)

Tracks invitation states between learners.

| Field | Type | Validation / Defaults | Purpose |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated | Unique request identifier |
| `sender` | `ObjectId` | `required: true`, `ref: "User"` | User who initiated the connection |
| `recipient` | `ObjectId` | `required: true`, `ref: "User"` | Target user receiving the request |
| `status` | `String` | `enum: ["pending", "accepted"]`, `default: "pending"` | Connection lifecycle state |
| `createdAt` | `Date` | Managed by Mongoose | Request timestamp |
| `updatedAt` | `Date` | Managed by Mongoose | Request resolution timestamp |

---

## 6. API Endpoint Matrix

> **Dual Route Mounting:** All routes respond equally to `/api/<route>` and `/<route>` (e.g., both `/api/auth/login` and `/auth/login` are valid), preventing 404 errors regardless of frontend base URL configuration.

### 6.1. Authentication Routes
- `POST /api/auth/signup` — Registers new account, generates avatar, provisions Stream user, issues JWT.
- `POST /api/auth/login` — Authenticates credentials, issues JWT cookie and body token.
- `POST /api/auth/logout` — Invalidates session cookie with matching cross-site options.
- `POST /api/auth/onboarding` — Updates language targets, bio, and sets `isOnboarded: true`.
- `GET /api/auth/me` — Returns current authenticated user record (`protectRoute` required).

### 6.2. User & Friendship Routes
- `GET /api/users` — Returns recommended partners matching language exchange criteria.
- `GET /api/users/friends` — Returns populated array of confirmed friends.
- `POST /api/users/friend-request/:id` — Sends connection request to recipient ID.
- `PUT /api/users/friend-request/:id/accept` — Confirms request, links users mutually.
- `GET /api/users/friend-requests` — Returns incoming pending requests and recent accepted requests.
- `GET /api/users/outgoing-friend-requests` — Returns pending requests sent by user.

### 6.3. Chat, Video & AI Services Routes
- `GET /api/chat/token` — Generates a cryptographically signed user token for Stream Chat & Video.
- `POST /api/chat/translate` — Proxies text to translation microservice.
- `POST /api/chat/correct` — Analyzes English text via LanguageTool API, returns suggestions.
- `GET /api/health` — Returns `{ status: "ok" }` for Render and external uptime probes.

---

<a id="security"></a>
## 7. Security, Privacy & Error Handling Protocols

1. **Zero Secret Leakage:**
   - Production secrets (`JWT_SECRET_KEY`, `STREAM_API_SECRET`, `MONGO_URI`) are strictly loaded via environment variables and never logged or serialized to client responses.
2. **Cross-Site Cookie Protection:**
   - In production, JWT cookies specify `sameSite: "none"` and `secure: true`.
   - In local development, cookies automatically downgrade to `sameSite: "lax"` and `secure: false`.
3. **CORS Whitelisting:**
   - Dynamic regex validation ensures only sanctioned local hosts, explicit `CLIENT_URL`/`FRONTEND_URL` targets, and legitimate `*.vercel.app` domains can initiate cross-origin requests.
4. **Input Boundaries:**
   - Translation and grammar correction controllers enforce a strict 5,000-character ceiling to prevent buffer exhaustion and third-party rate-limit penalties.
5. **Database Safety:**
   - Mongoose schemas sanitize inputs and enforce strict type checking and enumeration guards.

---

<a id="installation"></a>
<a id="configuration"></a>
## 8. Deployment & Environment Specifications (Vercel & Render)

### 8.1. Backend Service Configuration (Render)
- **Environment:** Node.js
- **Root Directory:** `backend` (or repository root)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port Binding:** Code binds explicitly to `0.0.0.0` and listens to `process.env.PORT`.
- **Environment Variables Required:**
  ```env
  NODE_ENV=production
  MONGO_URI=<your-mongodb-atlas-connection-string>
  JWT_SECRET_KEY=<your-cryptographic-jwt-secret>
  STREAM_API_KEY=<your-stream-public-key>
  STREAM_API_SECRET=<your-stream-private-secret>
  CLIENT_URL=<your-vercel-domain-without-trailing-slash>
  FRONTEND_URL=<your-vercel-domain-without-trailing-slash>
  LIBRETRANSLATE_URL=https://streamify-libretranslate-2.onrender.com
  ```

### 8.2. Frontend Application Configuration (Vercel)
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Client Routing Rewrites (`vercel.json`):**
  ```json
  {
    "rewrites": [
      {
        "source": "/((?!api/).*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Environment Variables Required:**
  ```env
  VITE_API_URL=https://<your-render-service-name>.onrender.com/api
  VITE_STREAM_API_KEY=<your-stream-public-key>
  ```
