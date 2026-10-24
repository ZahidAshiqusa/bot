# ZAID ASHIQ STUDIO — WhatsApp Multi-Feature Bot & Web Control Panel

A production-ready, split-architecture WhatsApp automation suite and tactical web control console built with **Baileys**, **Node.js Express**, **Socket.io**, and **HTML5/TailwindCSS**.

---

## ⚡ MULTI-CLOUD PRODUCTION SETUP GUIDE

> **Architecture Overview**: The **Backend** runs 24/7 on **Render** (or **Railway**) maintaining Baileys WhatsApp sockets, subscribing to presence updates, processing bot commands, intercepting ViewOnce media, and syncing backups to GitHub and Cloudinary. The **Frontend** runs on **Vercel** as a high-performance Progressive Web App (PWA) reading environment variables dynamically via a serverless function (`/api/env`) and communicating in real-time over Socket.io and HTTPS.

Follow these steps to configure production connectivity across **Render**, **Vercel**, **Railway**, **GitHub**, **Cloudinary**, and **Google Auth**:

---

### STEP 1: Deploy Backend to Render (Recommended)

#### Option A: One-Click Render Blueprint (Using `render.yaml`)
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), click **New + > Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `zaid-whatsapp-bot-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
4. Fill in any required environment secrets (or add them in the dashboard after creation) and click **Apply**.

#### Option B: Manual Web Service on Render
1. In [Render Dashboard](https://dashboard.render.com/), click **New + > Web Service**.
2. Select your repository.
3. Configure the service settings:
   - **Name**: `zaid-whatsapp-bot-backend`
   - **Root Directory**: `backend` (or leave empty if deploying repository root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free or Starter
4. Under **Advanced Settings**:
   - **Health Check Path**: `/api/health` (returns HTTP 200 `{ status: "ok" }`)
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `SESSION_ID` = `...` (optional; if you already have saved session credentials)
   - `GOOGLE_CLIENT_ID` = `...` (for strict identity check)
   - `CLOUDINARY_URL` = `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (enables Cloud CDN media hosting for voice notes, video notes, and uncropped profile photos)
   - `GITHUB_TOKEN` = `ghp_...` (Personal Access Token with `gist` scope; auto-backs up session credentials to a private secret Gist to prevent data loss on container restarts)
   - `GITHUB_GIST_ID` = `...` (optional; if restoring an existing backup Gist)
   - `ADMIN_NUMBER` = `9232999931199`
6. Click **Create Web Service**. Once deployed, copy your Render URL:
   ```
   https://your-bot-backend.onrender.com
   ```

---

### STEP 1 (Alternative): Deploy Backend to Railway
1. In [Railway.app](https://railway.app/), create a **New Project > Deploy from GitHub repo**.
2. In your Railway Service **Settings**:
   - Set **Root Directory** to `/backend` (or leave as root `/` if deploying full project).
   - Build/Start command: `node server.js`.
3. In Railway **Variables**, add your production secrets (`SESSION_ID`, `GOOGLE_CLIENT_ID`, `CLOUDINARY_URL`, `GITHUB_TOKEN`, `ADMIN_NUMBER`).
4. In Railway **Networking**, click **Generate Domain** and copy your public URL:
   ```
   https://your-bot-production.up.railway.app
   ```

---

### STEP 2: Deploy Frontend to Vercel (Zero-Config Connection)
1. In [Vercel.com](https://vercel.com/), click **Add New > Project** and select your GitHub repository.
2. In **Project Settings**:
   - Set **Root Directory** to `frontend`.
   - Framework Preset: `Other`.
   - Keep default build and output settings (Vercel automatically serves `index.html`, `manifest.json`, `vercel.json`, and the `/api/env.js` serverless function).
3. Under **Environment Variables**, add:
   - `RENDER_BACKEND_URL` = `https://your-bot-backend.onrender.com` (for Render backend)
   - `RAILWAY_BACKEND_URL` = `https://your-bot-production.up.railway.app` (backward-compatible fallback)
   - `GOOGLE_CLIENT_ID` = `your-google-client-id.apps.googleusercontent.com`
   - *(Optional)* `CLOUDINARY_URL` = `cloudinary://...` (if configuring cloud media flags on frontend)
4. Click **Deploy**. Vercel will generate your live production frontend URL:
   ```
   https://your-studio-panel.vercel.app
   ```
   *Your Vercel site will automatically query `/api/env` on load, discover the Render backend, initialize Google Sign-In, and connect with zero manual operator intervention!*

---

### STEP 3: Configure Google OAuth 2.0 Web Client
1. Visit [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials > OAuth client ID** (Application Type: *Web application*).
3. Under **Authorized JavaScript origins**, add your domains:
   - `https://your-studio-panel.vercel.app` (your production Vercel frontend)
   - `https://your-bot-backend.onrender.com` (your Render backend)
   - `https://your-bot-production.up.railway.app` (your Railway backend)
   - `http://localhost:3000` (for local development)
4. Copy the Client ID and paste it into Vercel, Render, and Railway environment variables as `GOOGLE_CLIENT_ID`.
5. When `GOOGLE_CLIENT_ID` is present, the control panel enforces strict Google Authentication and locks session editing on a 1-time per-Google-account basis.

---

### STEP 4: Cloudinary Media CDN & GitHub Backup Setup
- **Cloudinary CDN Hosting**:
  - Sign up for a free account at [Cloudinary.com](https://cloudinary.com/).
  - Copy your `CLOUDINARY_URL` from the Cloudinary dashboard:
    `CLOUDINARY_URL=cloudinary://1234567890:abcdefghijk@mycloudname`
  - When set on Render / Railway, voice notes, video notes, uncropped profile photos, and grabbed status media are hosted on Cloudinary's global CDN.
- **GitHub Automated Session Backup**:
  - Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens).
  - Generate a new token with the `gist` scope checked.
  - Set `GITHUB_TOKEN=ghp_...` in Render / Railway environment variables.
  - The bot automatically serializes `creds.json` and session bindings into an encrypted private secret Gist whenever linked, and restores them on container restarts.

---

## 🎯 Production Environment Variables Reference

| Variable Name | Required | Deployment Target | Description |
| :--- | :--- | :--- | :--- |
| `RENDER_BACKEND_URL` | **Yes (if Render)** | Vercel | Public HTTPS address of your Render backend (e.g. `https://your-bot.onrender.com`) |
| `RAILWAY_BACKEND_URL` | **Yes (if Railway)**| Vercel | Public HTTPS address of your Railway backend service (backward compatible fallback) |
| `GOOGLE_CLIENT_ID` | **Yes** | Vercel & Render / Railway | Google OAuth 2.0 Web Client ID for strict login authentication |
| `PORT` | Optional | Render / Railway / Local | Server port (Render automatically assigns; defaults to 3000) |
| `SESSION_ID` | Optional | Render / Railway | Pre-existing WhatsApp Baileys session string |
| `CLOUDINARY_URL` | Optional | Render / Railway / Vercel | Cloudinary connection string for media CDN hosting |
| `CLOUDINARY_CLOUD_NAME` | Optional | Render / Railway | Cloudinary cloud name (if not using `CLOUDINARY_URL`) |
| `CLOUDINARY_API_KEY` | Optional | Render / Railway | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Optional | Render / Railway | Cloudinary API Secret |
| `GITHUB_TOKEN` | Optional | Render / Railway | Personal Access Token (`gist` scope) for session backups |
| `GITHUB_GIST_ID` | Optional | Render / Railway | Target private Gist ID (auto-created on initial backup) |
| `ADMIN_NUMBER` | Optional | Render / Railway | Bot admin phone number(s) (comma-separated, without +) |

---

## 🚀 Key Features

1. **WhatsApp Online Tracer (Live Presence Telemetry)**
   - Subscribes to contact presence via WhatsApp IQ stanzas (`sock.presenceSubscribe`).
   - Tracks transitions: `online` (`available`), `offline` (`unavailable`), `typing...` (`composing`), and `recording audio...` (`recording`).
   - Displays real-time timeline logs: `9232999931199 online at 05:13am · offline 05:19am (Duration: 6m 00s)`.
   - Live Socket.io push stream, instant number filtering, persistent auto-rotating JSON storage (`data/online_tracer.json`), and 1-click JSON log export.
2. **Cloud & Production Drawer / Modal**
   - Live health monitors for Railway, Google Auth, Cloudinary CDN, and GitHub backup.
   - 1-click `[ BACKUP SESSION NOW ]` button triggering instant encrypted Gist synchronization.
3. **Google Authentication Gate & 1-Time Session Lock**
   - Official Google Identity Services integration.
   - Every verified Google account can link/bind WhatsApp session credentials once, preventing unauthorized hijacking.
4. **WhatsApp Voice Note Transmitter (PTT Waveform)**
   - Live microphone recording with audio waveform timer or audio file upload (MP3, OGG, WAV, M4A).
   - Sends authentic green microphone Push-To-Talk (PTT) messages with optional Cloudinary hosting.
5. **WhatsApp Video Note Transmitter (Circular PTV Note)**
   - Live camera recording with circular viewfinder or MP4/MOV file upload.
   - Dispatches authentic circular instant video notes (`ptv: true`) with optional Cloudinary CDN offload.
6. **Triple Device Linking**
   - Dynamic QR Code stream, 8-Digit Pairing Code by phone number, or direct Session ID input.
7. **ViewOnce Interceptor & 1-Click Downloader**
   - Captures all incoming 1-view pictures, voice messages, and videos into a real-time download feed.
8. **WhatsApp Status Grabber**
   - Intercepts stories from `status@broadcast` with 1-click HD downloads.
9. **Full-Resolution Uncropped Profile Picture (DP) Studio**
   - High-resolution uncropped DP canvas generation (up to 1280px) with custom padding and direct WhatsApp IQ upload.
10. **118 Integrated Bot Commands**
    - Commands run on incoming chats (`.alive`, `.ping`, `.aiart`, `.gemini`, `.sticker`, `.play`, `.song`, `.video`, etc.).
11. **Deleted Messages Vault (Anti-Delete Audit with Media Previews)**
    - Automatically intercepts and preserves messages deleted by senders ("Delete for Everyone") in direct private conversations.
    - Captures sender phone number, sent time, deleted time, active duration, and text content.
    - Previews and downloads deleted media: photos (with zoom lightbox), circular/regular videos (with HTML5 player), and voice notes (with audio player).
    - Stores locally in `data/deleted_media/` with optional Cloudinary CDN hosting and JSON audit log export.

---

## 🛠️ Local Development & Testing

### 1. Run Everything Locally on Port 3000
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

## 📡 REST API Documentation

- `GET /api/env` — Returns runtime backend URL, Google Client ID, and Cloudinary/GitHub status.
- `GET /api/cloud-status` — Returns multi-cloud health (Railway, Google, Cloudinary, GitHub).
- `POST /api/backup/github` — Triggers immediate session backup to a private GitHub Gist.
- `GET /api/online-tracer` — Returns monitored targets and recent presence timeline logs.
- `POST /api/online-tracer/track` — Body: `{ number: "9232999931199", name: "Target 1" }`. Subscribes to contact presence.
- `DELETE /api/online-tracer/target/:idOrNumber` — Stops tracking target number.
- `POST /api/online-tracer/clear-logs` — Clears presence log history.
- `POST /api/send-voice-note` — Body: `{ to, audioBase64, mime, useCloudinary }`. Sends PTT voice note.
- `POST /api/send-video-note` — Body: `{ to, videoBase64, mime, useCloudinary }`. Sends circular PTV video note.
- `POST /api/send-buttons` — Body: `{ to, headerTitle, body, footer, buttons: [...] }`. Sends interactive buttons.
- `POST /api/update-dp` — Body: `{ imageBase64, bgColor }`. Updates uncropped WhatsApp profile picture.
- `GET /api/deleted-messages` — Returns captured deleted messages list and media breakdown counts.
- `GET /api/deleted-media/:filename` — Serves recovered photos, videos, and voice notes with proper content-type headers.
- `POST /api/deleted-messages/clear` — Clears the deleted messages audit vault.
- `GET /api/state` — Returns connection status, QR code, pairing code, and grabbed items.
- `POST /api/session` — Imports and binds WhatsApp session credentials.
- `GET /api/session` — Exports active session credentials.
- `POST /api/logout` — Resets session and restarts socket.
