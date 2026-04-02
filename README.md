<div align="center">

# 🧠 NEXUS PANEL

*"Sometimes you gotta run before you can walk."*
— Tony Stark

**Ton centre de commandement personnel. Pense à J.A.R.V.I.S., mais c'est le tien.**

🇫🇷 *Interface entièrement en français*

</div>

---

## 🔍 What is this?

Nexus is a **private dashboard** built to give you full visibility and control over your digital ecosystem — Spotify, Discord, analytics and more — all in one sleek interface.

No bloat. No ads. No nonsense. Just your data, your way.

Think of it as your own **F.R.I.D.A.Y.** — always on, always watching, always ready.

---

## ⚡ Features

| Feature | Description |
|---|---|
| 🎵 **Spotify** | Suivi de ta musique en temps réel, stats d'écoute et historique |
| 🤖 **Discord Bot** | Gestion de serveur, commandes slash, sondages, giveaways |
| 🧠 **IA locale** | Assistant IA maison — construit de zéro, pas emprunté |
| 📊 **Analytics** | Métriques système et graphiques d'utilisation |
| 📋 **Logs** | Viewer complet des logs serveur |
| 🔐 **Auth** | Authentification sécurisée via Supabase |
| 🗄️ **Database** | Stockage SQLite local + panneau d'administration |
| 🎨 **Thèmes** | 18+ splash screens animés, 14 couleurs de logo, styles personnalisables |
| 🧩 **Widgets** | Horloge, calendrier, mini-player Spotify, stats système, citations |

---

## 🛠️ Tech Stack

- **Frontend** — React 19, Tailwind CSS 4, React Router 7, Recharts, Motion (Framer Motion)
- **Backend** — Node.js, Express, TypeScript (full-stack via tsx)
- **Auth** — Supabase (JWT-based)
- **Database** — SQLite via better-sqlite3
- **Discord** — discord.js 14, gateway persistant avec reconnexion automatique
- **IA** — Moteur maison, entraîné et servi en interne
- **Hosting** — Vercel

---

## 🔑 Variables d'environnement

Le panel attend les variables suivantes (à configurer dans le dashboard Vercel) :

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
JWT_SECRET=

# Spotify (OAuth)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# Discord
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=

# App
APP_URL=
```

Toutes les intégrations sont optionnelles — le panel démarre sans elles, les fonctionnalités correspondantes sont simplement désactivées.

---

## 📁 Project Structure

```
nexus/
├── server.ts               # Express + Vite entry point (port 5000)
├── server/
│   ├── routes/             # API routes (auth, spotify, discord, logs, analytics...)
│   ├── middleware/         # JWT auth middleware
│   ├── discord-gateway.ts  # Discord bot gateway persistant
│   ├── db.ts               # SQLite setup & migrations
│   └── lib/                # Supabase admin, utilitaires serveur
├── src/
│   ├── pages/              # React pages (Dashboard, Analytics, Spotify, Discord...)
│   ├── components/         # UI components (Sidebar, MobileNav, splash screens...)
│   ├── context/            # Auth & Spotify context providers
│   └── lib/                # Frontend utilities, theme, Supabase client
└── data/
    └── nexus.db            # Base SQLite locale
```

---

## 🎬 Splash Screens

18 écrans de démarrage animés au choix, dont :

- **Nexus** — grille de particules canvas
- **Matrix** — pluie matricielle + boot log terminal
- **Cyberpunk** — glitch RGB + brackets néon
- **Netflix** — convergence de faisceaux + sweep lumineux
- **Apple** — barre de progression style macOS
- **HUD** — radar rotatif + boot log animé
- **Fire** — automate cellulaire canvas + braises
- **Ice** — cristaux de glace + particules de givre
- **Neon** — révélation lettre par lettre avec reflet au sol
- *...et bien d'autres*

---

## 🤖 Discord Bot — Commandes slash

| Commande | Description |
|---|---|
| `/help` | Liste toutes les commandes disponibles |
| `/info` | Infos sur le serveur |
| `/userinfo` | Infos sur un membre |
| `/say` | Envoie un message dans un salon |
| `/poll` | Lance un sondage avec réactions |
| `/giveaway` | Organise un giveaway |
| `/emojis` | Liste les emojis personnalisés du serveur |
| `/stickers` | Liste les stickers du serveur |
| `/backup` | Génère un backup JSON complet du serveur (DM) |
| `/nick` | Change le pseudo d'un membre |
| `/embed` | Crée un embed personnalisé |
| `/announce` | Publie une annonce |
| *+ autres* | Modération, musique, utilitaires... |

---

<div align="center">

*"Jarvis, sometimes I think you've got more sense than I do."*
*"Then I suspect you've been paying attention, sir."*

Built with ❤️ — private, fast, yours.

</div>
