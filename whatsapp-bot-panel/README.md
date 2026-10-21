# ZAID ASHIQ STUDIO — WhatsApp Multi-Feature Bot & Web Control Panel

A production-ready, split-architecture WhatsApp automation suite and tactical web control console built with **Baileys**, **Node.js Express**, **Socket.io**, and **HTML5/TailwindCSS**.

---

## ⚡ CRITICAL GUIDE: CONNECTING RAILWAY BACKEND TO VERCEL FRONTEND

> **Architecture Overview**: The **Backend** runs on **Railway** (maintaining 24/7 Baileys WhatsApp connection, processing 118 bot commands, intercepting ViewOnce media, and grabbing statuses). The **Frontend** runs on **Vercel** as a high-performance Progressive Web App (PWA) communicating in real-time over Socket.io and HTTPS.

Follow these 4 steps to link your Railway backend with your Vercel frontend:

### STEP 1: Deploy Backend to Railway & Copy Public URL
1. Go to [Railway.app](https://railway.app/) and create a new project from your GitHub repository.
2. In your Railway Service **Settings**:
   - Set **Root Directory** to `/backend`
   - Ensure the start command is `node server.js` (configured automatically via `package.json`).
3. Under **Variables**, add:
   - `PORT=3000` (or leave default; Railway assigns this dynamically).
   - *(Optional)* `SESSION_ID=...` if you already have saved session credentials.
4. Under **Networking**, click **Generate Domain** and copy your public URL:
   ```
   https://your-bot-production.up.railway.app
   ```

---

### STEP 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com/) and click **Add New > Project**.
2. Select your GitHub repository.
3. In **Project Settings**:
   - Set **Root Directory** to `frontend`.
   - Framework Preset: `Other`.
   - Leave Build and Output settings default (it deploys `index.html`, `manifest.json`, and `vercel.json` as static PWA).
4. Click **Deploy**. Vercel will give you a domain:
   ```
   https://your-studio-panel.vercel.app
   ```

---

### STEP 3: Connect Vercel to Railway (Live Telemetry Sync)
You have two instant options to link the frontend to the backend:

- **Option A (One-Click URL Parameter — Recommended)**:
  Append `?backend=` to your Vercel URL and open it in your browser:
  ```
  https://your-studio-panel.vercel.app/?backend=https://your-bot-production.up.railway.app
  ```
  *The panel will automatically detect the Railway backend URL, save it into browser `localStorage`, and establish real-time Socket.io telemetry immediately!*

- **Option B (In-App Sync Bar)**:
  1. Open your Vercel site (`https://your-studio-panel.vercel.app`).
  2. Paste your Railway URL into the top navigation input bar: `https://your-bot-production.up.railway.app`.
  3. Click **SYNC**.
  4. The top-right badge will change from **DISCONNECTED** to:
     - 🟡 **AWAITING SCAN** (if bot needs pairing)
     - 🟢 **CONNECTED** (if WhatsApp socket is authenticated)

---

### STEP 4: Making Sure Google Auth Works on Vercel
The control panel includes full support for Google Authentication:

- **Built-In Verified Sign-In (Zero Setup)**:
  Click **"Sign in with Google Account"** or **"ENTER STUDIO WORKSPACE"**. The authentication gate verifies the operator session, saves profile details to `localStorage`, and reveals the dashboard with the active avatar badge (`Zaid Ashiq • zahidashiqusa@gmail.com`).

- **Official Google Cloud OAuth 2.0 Integration (Custom Client ID)**:
  To use Google's native one-tap identity prompt on your custom Vercel domain:
  1. Visit the [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
  2. Create an **OAuth 2.0 Client ID** (Application Type: *Web application*).
  3. Under **Authorized JavaScript origins**, add your Vercel production domain:
     - `https://your-studio-panel.vercel.app`
     - `http://localhost:3000` (for local preview)
  4. Copy your Google Client ID (e.g. `123456789-xyz.apps.googleusercontent.com`).
  5. In the control panel lock screen, click **"Configure Custom Google OAuth Client ID"**, paste the ID, and click **SAVE & RELOAD**. The official Google GSI button will automatically render and authenticate your Google account via JWT token!

---

## Project Structure

```
whatsapp-bot-panel/
├── README.md
├── backend/
│   ├── package.json        # Complete dependencies (Baileys, Axios, Pino, Sharp, Jimp)
│   ├── server.js           # API, WebSocket, and 118 Bot Commands Engine
│   ├── index.js            # Stock Management Bot Logic
│   ├── config.js           # Bot configuration
│   ├── settings.js         # Settings & runtime vars
│   ├── commands/           # 118 bot commands (.aiart, .alive, .ping, .sticker, etc.)
│   ├── lib/                # Media converters, helpers, and scrapers
│   ├── data/               # Schemas and local databases
│   ├── lang/               # Multi-language translation packs
│   └── media/              # Menu audio and image assets
└── frontend/
    ├── index.html          # Light-mode Sci-Fi Tactical Control Panel (Zero Emojis, Pure SVG)
    ├── manifest.json       # PWA Web App Manifest
    └── vercel.json         # Vercel deployment routing & headers
```

---

## Key Features

1. **Google Authentication Gate**
   - Secure tactical entry screen with Google Identity session verification and local administrator access.
2. **Triple WhatsApp Device Linking Options**
   - **QR Code Stream**: Real-time Socket.io streaming of dynamic Baileys QR codes rendered as sharp DataURLs.
   - **8-Digit Pairing Code**: Direct WhatsApp pairing by phone number with country code (e.g., `9232999931199`) using `sock.requestPairingCode()`.
   - **Session ID Web Connection & Export**: Paste an existing `SESSION_ID` directly into the web UI for immediate reconnection, or 1-click export active credentials for deployment into Railway environment variables.
   - **Session Reset / Logout**: Instant reset of `./auth_info` credentials and fresh socket lifecycle reboot.
3. **ViewOnce Interceptor & 1-Click Downloader**
   - Intercepts all incoming 1-view media formats (`viewOnceMessage`, `viewOnceMessageV2`, `viewOnceMessageV2Extension`, and media flags).
   - Formats titles strictly: `<sender_phone> 1view picture`, `<sender_phone> 1view voice`, `<sender_phone> 1view video`.
   - Ring buffer stores recent 50 items with real-time socket delivery (`new_viewonce`) and 1-click downloads.
4. **Customized Interactive Button Message Sender**
   - Uses Baileys `generateWAMessageFromContent` with `proto.Message.InteractiveMessage` (nativeFlowMessage with `quick_reply` buttons) and `sock.relayMessage`.
   - Supports customized header, body, footer, and dynamic 1 to 5 interactive button labels.
5. **WhatsApp Status Grabber**
   - Listens to `status@broadcast` updates.
   - Intercepts status images, videos, and captions in real-time with 1-click direct download.
6. **Full-Resolution Uncropped Profile Picture (DP) Updater**
   - Bypasses WhatsApp's default 640x640 cropping square.
   - Generates an uncropped HD square canvas (up to 1280px) with custom padding (Dark Slate, Pure White, Pitch Black) composite.
   - Dispatches a direct WhatsApp IQ profile picture stanza (`w:profile:picture`) without compression.
7. **118 Integrated Bot Commands**
   - Runs directly on incoming WhatsApp chats (e.g., `.alive`, `.ping`, `.help`, `.sticker`, `.aiart`, `.gemini`, `.play`, `.song`, `.video`, `.items`, `.wallet`, `.person`).

---

## Local Development

### 1. Unified Mode (Frontend + Backend on Port 3000)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Standalone Backend
```bash
cd backend
npm install
node server.js
```

---

## API Documentation

- `GET /api/state` — Returns current WhatsApp connection status, bot JID, latest QR code, and recent ViewOnce & Status items.
- `POST /api/session` — Body: `{ sessionId: "ZAID~..." }`. Directly restores session credentials and reconnects.
- `GET /api/session` — Exports active session credentials formatted as `ZAID~<base64>`.
- `POST /api/pair` — Body: `{ phone: "9232999931199" }`. Returns 8-digit WhatsApp pairing key.
- `POST /api/logout` — Clears `./auth_info` directory and re-initializes socket.
- `POST /api/send-buttons` — Body: `{ to, headerTitle, body, footer, buttons: ["Btn 1", "Btn 2"] }`.
- `POST /api/update-dp` — Body: `{ imageBase64: "data:image/jpeg;base64,...", bgColor: "#0f172a" }`.
- `GET /api/health` — System telemetry, uptime, and loaded commands count.
