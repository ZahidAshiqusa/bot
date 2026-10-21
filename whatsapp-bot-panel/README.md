# ZAID ASHIQ STUDIO — WhatsApp Multi-Feature Bot & Web Control Panel

A production-ready, split-architecture WhatsApp automation suite and tactical web control console built with **Baileys**, **Node.js Express**, **Socket.io**, and **HTML5/TailwindCSS**.

---

## Project Structure

```
whatsapp-bot-panel/
├── README.md
├── backend/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── manifest.json
    └── vercel.json
```

---

## Key Features

1. **Google Authentication Gate**
   - Secure tactical entry screen with Google Identity session verification and local administrator access.
2. **Dual WhatsApp Device Linking**
   - **QR Code Stream**: Real-time Socket.io streaming of dynamic Baileys QR codes rendered as sharp DataURLs.
   - **8-Digit Pairing Code**: Direct WhatsApp pairing by phone number with country code (e.g., `9232999931199`) using `sock.requestPairingCode()`.
   - **Session Reset / Logout**: Instant reset of `./auth_info` credentials and fresh socket lifecycle reboot.
3. **ViewOnce Interceptor & 1-Click Downloader**
   - Intercepts all incoming 1-view media formats (`viewOnceMessage`, `viewOnceMessageV2`, `viewOnceMessageV2Extension`, and media flags).
   - Formats titles strictly: `<sender_phone> 1view picture`, `<sender_phone> 1view voice`, `<sender_phone> 1view video`.
   - In-memory ring buffer (up to 50 items) with immediate 1-click media download.
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

---

## Deployment Guide

### A. Deploy Backend to Railway

1. **Sign in to Railway**: Go to [Railway.app](https://railway.app/) and create a new project.
2. **Deploy from GitHub**:
   - Choose **Deploy from GitHub repo**.
   - Select your repository.
3. **Configure Root Directory**:
   - In your Railway Service Settings, set **Root Directory** to `/backend` (or deploy from root if using the unified server).
4. **Environment Variables**:
   - `PORT=3000` (Railway automatically sets `PORT`, which our server dynamically uses).
   - Optional: Attach a persistent disk mount at `/backend/auth_info` so WhatsApp sessions persist across service redeploys.
5. **Generate Public Domain**:
   - Under **Networking**, click **Generate Domain** to get your public backend URL (e.g. `https://your-bot-production.up.railway.app`).

---

### B. Deploy Frontend to Vercel

1. **Sign in to Vercel**: Go to [Vercel.com](https://vercel.com/) and click **Add New > Project**.
2. **Import Repository**: Select your GitHub repository.
3. **Configure Project Settings**:
   - **Root Directory**: Click edit and choose `frontend`.
   - **Framework Preset**: `Other`.
   - **Build Command**: Leave empty.
   - **Output Directory**: Leave empty (root of `frontend/`).
4. **Deploy**:
   - Click **Deploy**. Vercel will publish the PWA with `vercel.json` and `manifest.json`.
5. **Connect to Backend**:
   - Open your deployed Vercel site URL.
   - Sign in through the Google Gate.
   - In the top navigation bar, paste your Railway backend URL into the **Railway Backend URL** input and click **SYNC**.
   - The status badge will immediately turn to **CONNECTED** or **AWAITING SCAN**!

---

## Local Development

### 1. Run Unified Server (Serves Frontend & Backend Together)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Split Mode (Separate Ports)

**Terminal 1 (Backend):**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 (Frontend):**
Open `frontend/index.html` via any static file server (e.g., Live Server or `npx serve frontend`).

---

## API Documentation

- `GET /api/state` — Returns current WhatsApp connection status, bot JID, latest QR code, and recent ViewOnce & Status items.
- `POST /api/pair` — Body: `{ phone: "9232999931199" }`. Returns 8-digit WhatsApp pairing key.
- `POST /api/logout` — Clears `./auth_info` directory and re-initializes socket.
- `POST /api/send-buttons` — Body: `{ to, headerTitle, body, footer, buttons: ["Btn 1", "Btn 2"] }`.
- `POST /api/update-dp` — Body: `{ imageBase64: "data:image/jpeg;base64,...", bgColor: "#0f172a" }`.
- `GET /api/health` — System telemetry and uptime.
