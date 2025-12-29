# 🧠 Development Commands Guide

This monorepo setup allows you to run the **backend**, **web**, and **mobile (Expo)** apps locally — and build the mobile app using **EAS** when needed.

---

## ⚙️ Commands Overview

### 🧩 Root `package.json` commands

| Command                    | Description                                                                                                                                       |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run backend`        | Starts the **backend** server (runs `npm run dev` inside `backend`).                                                                     |
| `npm run web`            | Starts the **web** app (runs `npm run dev` inside `web`).                                                                              |
| `npm run mobile`         | Starts the **Expo** dev server (runs `npx expo start --dev-client` inside `app`). Requires a dev-client build already installed via EAS. |
| `npm run eas:dev`        | Builds a **development** Android dev-client via EAS.                                                                                         |
| `npm run eas:preview`    | Builds a **preview** Android build via EAS.                                                                                                  |
| `npm run eas:production` | Builds a **production** Android build via EAS.                                                                                               |

## 🧰 Requirements

Ensure you have the following installed globally:

- **Node.js 18+**
- **npm**
- **Cloudflared CLI** (for Cloudflare Tunnel)[→ Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
- **Ngrok CLI** (for Ngrok Tunnel)[→ Download Ngrok](https://ngrok.com/download)
- **Expo CLI** (for mobile app development)
  Install globally with:
  ```bash
  npm install -g expo-cli
  ```

## 🧾 Notes

- Each app has its own dependencies and `.env` files.
- The root `package.json` is used only for orchestration scripts.
- If your mobile app needs to call your **local backend**, you’ll need a local tunnel (e.g. **Cloudflare Tunnel** or **Ngrok**) so the phone can reach your machine from outside your LAN.

Author [@TheDevPiyush](https://github.com/thedevpiyush)
