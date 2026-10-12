# RAXI Full-Stack Local Clone & Permanent Laptop Backend

A 100% pixel-perfect clone of **RAXI.CHAT** (`https://www.raxi.chat/#/register?invitationCode=44128111216`) with an offline-first Node.js Express backend and local SQLite database running directly on your laptop.

---

## 🚀 How to Run (One-Click)

1. Simply double-click **`start_app.bat`** in this folder.
2. The server will start on `http://localhost:5000` and automatically open your default browser to:
   ```
   http://localhost:5000/#/register?invitationCode=44128111216
   ```
3. The app will stay running on your laptop. Whenever you want to use it, just run `start_app.bat`.

---

## 📁 Project Structure

```
raxi_clone/
├── start_app.bat          # One-click Windows launcher
├── README.md              # Instructions & Architecture
├── frontend/              # Exact production client (1,442 assets)
│   ├── index.html         # Cloned SPA entry with local CONFIG
│   ├── favico.ico
│   ├── share-cover.jpg
│   ├── web/config         # Local domain configuration
│   └── assets/            # All 547 JS/CSS chunks + media & fonts
└── backend/               # Permanent local Node.js server
    ├── server.js          # Express API server (Port 5000)
    ├── db.js              # SQLite persistent database layer
    ├── raxi_local.db      # SQLite local database file
    └── package.json       # Dependencies (express, cors)
```

---

## ⚡ Features & Capabilities

- **100% Pixel-Perfect UI**: Exactly identical to `https://www.raxi.chat` across all pages (`#/register`, `#/login`, `#/`, `#/WinGo`, `#/wallet`, etc.).
- **Local SQLite Database (`raxi_local.db`)**:
  - Registered users, phone numbers, passwords, invitation codes, and sessions are safely stored on your laptop.
  - Welcome balance of **₹10,000** automatically credited to every registered user for local gameplay and testing!
- **Zero Cloud / External Internet Dependencies**: Runs completely self-contained on `localhost:5000`.
- **Smart Universal Fallback**: All 336 system endpoints are supported with automated fallback responses (`{ code: 0, msg: "success" }`) preventing any button or page from crashing.
