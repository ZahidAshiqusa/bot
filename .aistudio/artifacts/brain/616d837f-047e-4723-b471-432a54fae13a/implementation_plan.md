# Deleted Messages Vault (Anti-Delete Audit) with Live Media Previews

Capture and log WhatsApp messages deleted by senders ("Delete for Everyone") in direct private conversations, displaying the sender number, sent time, deleted time, text content, and interactive previews for photos, videos, and voice notes on the web control panel.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product requirements were confirmed during Phase 1 clarification:
> - **Delivery & Viewing Mode**: Displayed in a real-time, interactive **Web Panel Live Audit Vault** with inline media previews (image lightbox, HTML5 video player, audio player) and 1-click download actions.
> - **Media Storage & Hosting**: Downloaded media is stored locally in `data/deleted_media/` and served via `/api/deleted-media/:filename`, with automatic optional Cloudinary CDN hosting when `CLOUDINARY_URL` is configured.
> - **Monitoring Scope**: Strictly captures **Direct Private Messages** (individual contacts), filtering out noisy public group deletions.
> - **Log Retention**: Stored in persistent JSON records on the backend (`data/deleted_messages.json`) with auto-rotation (capping at 250 records) and automated cleanup of older media files to manage disk usage.

---

## 1. Overview & Core Concept

- **The Problem**: When a contact deletes a message ("Delete for Everyone"), WhatsApp wipes the message from standard chat interfaces, leaving operators without the audit trail or media context.
- **The Solution**:
  - The Baileys engine intercepts and buffers incoming direct messages (text, photos, circular/regular videos, and voice notes).
  - When a `protocolMessage` with `type: 0` (REVOKE) is received, the backend intercepts the revocation, matches the deleted message ID against its buffer, and captures the original payload.
  - Automatically extracts sender number (e.g., `9232999931199`), sent time, deletion time, text content, and media binary.
  - Broadcasts the recovered message via WebSocket (`deleted_message_captured`) and persists it to `data/deleted_messages.json`.
  - The web panel immediately renders the deleted item into the "Deleted Messages Vault" with full media playback capabilities.

---

## 2. User Experience & Visual Design

- **Vault Control Deck in Web Panel**:
  - Located directly in the main panel grid with cybernetic aesthetics (Orbitron headers, Rajdhani body, monospace tabular figures).
  - **Header Bar**:
    - Title: `DELETED MESSAGES VAULT (ANTI-DELETE AUDIT)`
    - Total Deleted Counter Badge (e.g., `12 DELETED MSGS`)
    - Media breakdown chips: `Photos (4)`, `Videos (2)`, `Voice Notes (3)`, `Text (3)`
    - Quick actions: `[ EXPORT AUDIT LOG ]`, `[ CLEAR VAULT ]`
  - **Filter & Search Bar**:
    - Instant sender phone filter: `Filter by sender number (+92...)...`
    - Segmented media filter tabs: `[ All ]`, `[ Text ]`, `[ Photos ]`, `[ Videos ]`, `[ Voice ]`
  - **Captured Deleted Message Cards**:
    - **Header**:
      - Sender phone in bold monospace: `+9232999931199`
      - Sent timestamp: `Sent: 05:18 am`
      - Revocation timestamp: `Deleted: 05:22 am` (Active for: `4m 00s`)
      - Media Type Badge (Emerald for `PHOTO`, Sky for `VIDEO`, Amber for `VOICE NOTE`, Slate for `TEXT`)
    - **Body**:
      - **Text Message**: Formatted blockquote with monospace quotation marks.
      - **Photo**: High-resolution thumbnail with zoom modal and `[ DOWNLOAD PHOTO ]` button.
      - **Video**: Responsive circular/rectangular HTML5 video player with playback controls and `[ DOWNLOAD VIDEO ]` button.
      - **Voice Note**: HTML5 audio player with time scrubber, playback speed toggle, and `[ DOWNLOAD AUDIO ]` button.
    - **Footer**:
      - Cloud CDN status (shows `Cloudinary CDN Hosted` link when cloud upload is active).
      - Message ID audit reference.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Messages Only vs Group Chats**:
  - *Chosen Approach*: Specifically filter for `!remoteJid.endsWith('@g.us')`.
  - *Why*: User confirmed preference; prevents hundreds of spammy group revocations from filling the operator vault and exhausting server storage.
- **Decision 2: Local File Storage + Optional Cloudinary Offload**:
  - *Chosen Approach*: Stream media to `data/deleted_media/<msgId>.<ext>`, serve via Express `/api/deleted-media/:filename`, and optionally upload to Cloudinary in the background if configured.
  - *Why*: Ensures 100% offline and local reliability without requiring Cloudinary, while providing cloud persistence when production credentials are set.
- **Decision 3: Two-Phase Revocation Matching**:
  - *Chosen Approach*: Buffer incoming messages in an indexed memory LRU ring buffer (last 1,000 direct messages). When `protocolMessage.key.id` arrives, resolve immediately from memory, then write to `data/deleted_messages.json`.
  - *Why*: Eliminates expensive disk scans during high-traffic bursts and provides millisecond revocation matching.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WhatsApp Incoming Socket                        │
│                                   │                                    │
│                    sock.ev.on('messages.upsert')                       │
│                                   │                                    │
│       ┌───────────────────────────┴───────────────────────────┐        │
│       ▼                                                       ▼        │
│  Normal Chat Message                                   Revocation Message      │
│  (Text, Image, Video, Audio)                           (protocolMessage type 0)│
│       │                                                       │        │
│  Is Direct Message?                                           │        │
│  (!remoteJid.endsWith('@g.us'))                               │        │
│       │                                                       │        │
│       ▼                                                       ▼        │
│  ┌─────────────────────────┐                         ┌─────────────────┴────┐
│  │ DeletedMessagesManager  │                         │ Match Revoked msgId  │
│  │ - Buffer in memory ring │                         │ in Message Buffer    │
│  │ - Download media buffer │                         └──────────┬───────────┘
│  │ - Save to deleted_media/│                                    │ Found
│  └─────────────────────────┘                                    ▼
│                                                      ┌──────────────────────┐
│                                                      │ Construct Audit Log: │
│                                                      │ - Sender Phone       │
│                                                      │ - Sent / Deleted Time│
│                                                      │ - Text or Media URL  │
│                                                      └──────────┬───────────┘
│                                                                 │
│                 ┌───────────────────────────────────────────────┴───────────────┐
│                 ▼                                                               ▼
│  ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
│  │ Store in Persistent JSON    │                                 │ Broadcast via Socket.io:    │
│  │ (data/deleted_messages.json)│                                 │ 'deleted_message_captured'  │
│  └─────────────────────────────┘                                 └──────────────┬──────────────┘
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┼───────────────┘
                                                                                  │
                                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Web Control Panel Dashboard                                     │
│                                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     DELETED MESSAGES VAULT (ANTI-DELETE AUDIT)                            │  │
│  │  - Sender Filter (+9232999931199)   - Media Filters [ All | Photos | Videos | Voice ]     │  │
│  │  - Interactive Image Lightbox       - HTML5 Video Player    - Voice Note Audio Player     │  │
│  │  - 1-Click Media Download           - Export Audit Log      - Cloudinary CDN Links        │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Schema (`data/deleted_messages.json`)

```json
{
  "logs": [
    {
      "id": "del_3EB07A1B8C_1729519320000",
      "messageId": "3EB07A1B8C9F10",
      "sender": "9232999931199",
      "senderJid": "9232999931199@s.whatsapp.net",
      "senderName": "+9232999931199",
      "type": "image",
      "text": "Check this secret screenshot",
      "mediaFilename": "3EB07A1B8C9F10.jpg",
      "mediaUrl": "/api/deleted-media/3EB07A1B8C9F10.jpg",
      "cloudinaryUrl": "https://res.cloudinary.com/.../3EB07A1B8C9F10.jpg",
      "sentAt": 1729519080000,
      "deletedAt": 1729519320000,
      "sentTimeFormatted": "05:18 am",
      "deletedTimeFormatted": "05:22 am",
      "durationActive": "4m 00s"
    }
  ]
}
```

### Interactive State Transitions

1. **Incoming Message Capture**:
   - Operator receives a direct WhatsApp photo or voice note from `+9232999931199`.
   - Backend buffers message content and writes media to `data/deleted_media/`.
2. **Sender Revokes ("Delete for Everyone")**:
   - WhatsApp delivers `protocolMessage.type = 0`.
   - Backend retrieves buffered item, records `sentTimeFormatted` (`05:18 am`) and `deletedTimeFormatted` (`05:22 am`).
   - Dispatches Socket event `deleted_message_captured`.
3. **Web Panel Display**:
   - The "Deleted Messages Vault" prepends the recovered message card immediately.
   - Operator can play the voice note, watch the video, or open the photo directly in the browser even though it was deleted from WhatsApp.
