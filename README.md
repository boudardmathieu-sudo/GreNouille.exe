<div align="center">

# 🧠 NEXUS PANEL

*"Sometimes you gotta run before you can walk."*
— Tony Stark

**Ton centre de commandement personnel. Pense à J.A.R.V.I.S., mais c'est le tien.**

🇫🇷 *Interface entièrement en français*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

</div>

---

## 🔍 What is this?

Nexus is a **private dashboard** built to give you full visibility and control over your digital ecosystem — Spotify, Discord, system analytics and more — all in one sleek interface.

No bloat. No ads. No nonsense. Just your data, your way.

Think of it as your own **F.R.I.D.A.Y.** — always on, always watching, always ready.

---

## ⚡ Features

| Feature | Description |
|---|---|
| 🎵 **Spotify** | Track your listening activity and stats |
| 🎮 **Discord** | Monitor your server and activity |
| 📊 **Analytics** | System metrics and usage graphs |
| 📋 **Logs** | Full system log viewer |
| 🔐 **Auth** | Secure login via Supabase |
| 🗄️ **Database** | Local SQLite storage + admin panel |

---

## 🛠️ Tech Stack

- **Frontend** — React 19, Tailwind CSS 4, React Router 7, Recharts, Motion
- **Backend** — Node.js, Express
- **Auth** — Supabase (JWT-based)
- **Database** — SQLite via better-sqlite3
- **Hosting** — Vercel
- **Language** — TypeScript (full-stack)

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

### 1. Clone & install

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file at the root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret

# Optional integrations
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
DISCORD_TOKEN=...
```

### 3. Start the dev server

```bash
npm run dev
```

The panel will be live at → [http://localhost:5000](http://localhost:5000)

---

## ☁️ Deploy to Vercel

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy — Vercel handles the rest

The `vercel.json` at the root is already configured. No extra setup needed.

---

## 📁 Project Structure

```
nexus/
├── server.ts           # Express + Vite entry point
├── server/
│   ├── routes/         # API routes (auth, spotify, discord, logs...)
│   ├── middleware/     # JWT auth middleware
│   ├── db.ts           # SQLite setup & migrations
│   └── lib/            # Server utilities (Supabase admin)
├── src/
│   ├── pages/          # React pages (Dashboard, Analytics, Spotify...)
│   ├── components/     # Reusable UI components
│   ├── context/        # Auth context
│   └── lib/            # Frontend utilities & Supabase client
└── data/
    └── nexus.db        # Local SQLite database
```

---

<div align="center">

*"Jarvis, sometimes I think you've got more sense than I do."*
*"Then I suspect you've been paying attention, sir."*

Built with ❤️ — private, fast, yours.

</div>
