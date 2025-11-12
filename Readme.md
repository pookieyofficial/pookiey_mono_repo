
# 🧠 Development Commands Guide

This project setup allows you to run the **backend**, **web**, and **mobile (Expo)** apps together — along with a local tunnel (either **Cloudflare Tunnel** or **Ngrok**) to expose your local environment to the internet for testing or integration.

---

## ⚙️ Commands Overview

### 🧩 Individual Commands

| Command                       | Description                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev:backend`       | Starts the**backend** server. Runs `npm run dev` inside the `backend` folder.                                                   |
| `npm run dev:web`           | Starts the**web** app. Runs `npm run dev` inside the `web` folder.                                                              |
| `npm run dev:mobile`        | Starts the**mobile (Expo)** app. Runs `npx expo start --go` inside the `app` folder. This opens the Expo Go development server. |
| `npm run cloudflare:tunnel` | Starts a**Cloudflare Tunnel** named `localhosts` to make your local environment publicly accessible.                              |
| `npm run ngrok:tunnel`      | Starts an**Ngrok Tunnel** to expose your local environment using a fixed Ngrok URL (see note below).                                |

---

## 🌍 Combined Commands (Run Everything Together)

You can use one of the following commands to start all apps and a tunnel in parallel.

### ▶️ 1. Using Cloudflare Tunnel

```bash
npm run dev:all_cf
```

This runs:

- Backend (`npm run dev:backend`)
- Web app (`npm run dev:web`)
- Mobile app (`npm run dev:mobile`)
- Cloudflare Tunnel (`cloudflared tunnel run localhosts`)

👉 Use this command if you have Cloudflare Tunnel configured and authenticated on your system.

---

### ▶️ 2. Using Ngrok Tunnel

```bash
npm run dev:all_ng
```

This runs:

- Backend
- Web app
- Mobile app
- Ngrok tunnel

⚠️ **Important:**
Before using this command, replace the placeholder URL in the `package.json` with your actual Ngrok tunnel URL.

Example:

```json
"ngrok:tunnel": "ngrok http --url=https://YOUR-NGROK-URL-HERE"
```

You can get your Ngrok URL from the [Ngrok dashboard](https://dashboard.ngrok.com/) or CLI after running:

```bash
ngrok http 8080
```

(or the port your backend/web app runs on)

---

## 🔑 Important Notes

1. **Use only one tunnel** — choose either **Cloudflare** or **Ngrok**, not both simultaneously.
2. The combined commands (`dev:all_cf` and `dev:all_ng`) run all services **in parallel** using `npm-run-all`.
3. The Expo command uses `--go`, so it launches directly in **Expo Go mode** without waiting for manual input.
4. If you need to interact with the Expo CLI (e.g., pressing `r`, `s`, or `Ctrl+C`), run it separately with:
   ```bash
   npm run dev:mobile
   ```
5. Stop all running processes by pressing **Ctrl + C** in the terminal.

---

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

---

## ✅ Summary

| Task                           | Command                 |
| ------------------------------ | ----------------------- |
| Start backend only             | `npm run dev:backend` |
| Start web only                 | `npm run dev:web`     |
| Start mobile (Expo Go) only    | `npm run dev:mobile`  |
| Run all with Cloudflare tunnel | `npm run dev:all_cf`  |
| Run all with Ngrok tunnel      | `npm run dev:all_ng`  |

> 💡 **Tip:** You only need one tunnel service (Cloudflare or Ngrok).
>
> - Cloudflare Tunnel is stable and doesn’t expire.
> - Ngrok is quick and convenient for temporary sharing or testing.

---

## 🧾 Notes

- Each app has its own dependencies and `.env` files.
- The root `package.json` is used only for orchestration scripts.
- If you experience freezing or unresponsive keyboard input when running all together, run Expo (`npm run dev:mobile`) in a separate terminal.
