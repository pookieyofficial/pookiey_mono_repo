# 🌹 Pookiey - Dating App - Development Guide 🌹

> This monorepo setup allows devs to run the **backend**, **web**, and **mobile (Expo)** app locally for Pookiey developement — and builds the mobile app using **EAS** when needed.

---

## ⚙️ Commands Overview

### 🧩 Root `package.json` commands

| Command                    | Description                                                                                                                                       |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run backend`       | Starts the **backend** dev server (`npm run dev`).                                                                     |
| `npm run web`            | Starts the **web** dev app (`npm run dev`).                                                                                |
| `npm run mobile`         | Starts the **Expo** dev server (`npx expo start --dev-client`). *Requires a dev-client build via EAS*. |
| `npm run eas:dev`        | Builds a **development** Android dev-client via EAS.                                                                                         |
| `npm run eas:preview`    | Builds a **preview** Android build via EAS.                                                                                                  |
| `npm run eas:production` | Builds a **production** Android build via EAS.                                                                                               |

## 🗂️ Project Structure (Monorepo)

```text
pookiey.com/
├─ app/                         # Expo (React Native) mobile app
│  ├─ app/                      # Expo Router screens (auth/home/onboarding, etc.)
│  ├─ components/               # UI components (VoiceCallUI, LanguageSelector, SwipeDeck, etc.)
│  ├─ hooks/                    # App hooks (auth, socket, twilio, etc.)
│  ├─ locales/                  # i18n JSON files
│  ├─ assets/                   # Fonts, images
│  ├─ app.config.js             # Expo config
│  └─ eas.json                  # EAS build profiles
├─ backend/                     # Node.js + TypeScript API server
│  ├─ src/                      # Routes, controllers, models, socket, services
│  ├─ Dockerfile
│  └─ docker-compose*.yml
├─ web/                         # Next.js web app (admin/dashboard)
│  ├─ app/                      # Next.js App Router pages
│  ├─ Dockerfile
│  └─ docker-compose.prod.yml
├─ .github/workflows/           # CI/CD (build + push + deploy)
├─ package.json                 # Root orchestration scripts
└─ Readme.md
```

## 🧰 Requirements

Ensure you have the following installed globally:

- **Node.js 18+**
- **npm**
- **Cloudflared CLI** (for Cloudflare Tunnel)[→ Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) OR **Ngrok CLI** (for Ngrok Tunnel)[→ Download Ngrok](https://ngrok.com/download)
- **Expo CLI** (for mobile app development)
  Install globally with:
  ```bash
  npm install -g expo-cli
  ```

## 🚀 Quickstart (dev servers)

### 📱 Mobile app (Expo)
1. Install Expo CLI if missing: `npm install -g expo-cli`
2. `cd App`
3. Install deps: `npm install`
4. inspect `.env.example`, create & set up `.env`
5. Return to repo root: `cd ..`
6. Start mobile dev server: `npm run mobile`

### 🖥️ Web app (Next.js)
1. `cd web`
2. Install deps: `npm install`
3. inspect `.env.example`, create & set up `.env.local`
4. Return to repo root: `cd ..`
5. Start web dev server: `npm run web`

### 🔧 Backend (API)
1. `cd backend`
2. Install deps: `npm install`
3. 4. inspect `.env.example`, create & set up `.env`
4. Return to repo root: `cd ..`
5. Start API dev server: `npm run backend`

## 🧾 Notes

- Each app has its own dependencies and `.env` files.
- The root `package.json` is used only for orchestration scripts.
- You might need a local tunnel (e.g. **Cloudflare Tunnel** or **Ngrok**), so that your phone can reach your **local backend**.

## 🛠️ How to get started with developement

Author - [**@TheDevPiyush**](https://github.com/thedevpiyush)
