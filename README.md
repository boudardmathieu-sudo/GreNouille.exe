<div align="center">

# 🧠 NEXUS PANEL — v1.4.0

*"Sometimes you gotta run before you can walk."*
— Tony Stark

**Ton centre de commandement personnel. Pense à J.A.R.V.I.S., mais c'est le tien.**

🇫🇷 *Interface entièrement en français* · 🤖 Bot : **GreNouille.exe**

</div>

---

## 🔍 C'est quoi ?

Nexus est un **dashboard privé** conçu pour te donner une visibilité et un contrôle complet sur ton écosystème numérique — Spotify, Discord, IA, analytics et plus — dans une interface unique et soignée.

Pas de bloat. Pas de pub. Juste tes données, à ta façon.

Pense à ta propre **F.R.I.D.A.Y.** — toujours active, toujours prête.

---

## ⚡ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🎵 **Spotify** | Suivi en temps réel, stats d'écoute, historique et contrôle du player |
| 🤖 **Discord Bot** | Gestion de serveur complète, 40+ commandes slash, modération, IA |
| ✨ **IA Nexus** | Assistant IA maison (Pollinations AI, modèle `openai`) — sans clé API |
| 📊 **Analytics** | Métriques système et graphiques d'utilisation |
| 📋 **Logs** | Viewer complet des logs serveur en temps réel |
| 🔐 **Auth** | Authentification sécurisée via Supabase (JWT) |
| 🗄️ **Database** | SQLite local + panneau d'administration intégré |
| 🎨 **Thèmes** | 18+ splash screens animés, 14 couleurs de logo, thèmes personnalisables |
| 🧩 **Widgets** | Horloge, calendrier, mini-player Spotify, stats système, citations |
| 🌍 **Message de bienvenue** | Message automatique lors de l'arrivée d'un nouveau membre |

---

## 🛠️ Stack technique

- **Frontend** — React 19, Tailwind CSS 4, React Router 7, Recharts, Motion (Framer Motion)
- **Backend** — Node.js, Express, TypeScript (full-stack via `tsx`)
- **Auth** — Supabase (JWT)
- **Database** — SQLite via `better-sqlite3`
- **Discord** — discord.js 14, gateway WebSocket persistant avec reconnexion automatique
- **IA** — Pollinations AI (`openai` model) — aucune clé requise
- **Hosting** — Render (Node.js persistant, keepalive intégré)

---

## 🔑 Variables d'environnement

À configurer dans le dashboard Render (ou `.env` en local) :

```env
# Discord
DISCORD_BOT_TOKEN=          # Token du bot (Developer Portal → Bot → Token)
DISCORD_GUILD_ID=           # ID du serveur (optionnel — slash commands guild-scoped)
DISCORD_CHANNEL_ID=         # Salon par défaut pour les messages du panel
DISCORD_WELCOME_CHANNEL_ID= # Salon de bienvenue (défaut: 1489717640501919764)

# Spotify (OAuth)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=          # Même URL, exposée au client React
VITE_SUPABASE_ANON_KEY=     # Même clé anon, exposée au client React

# App
NODE_ENV=production
PUBLIC_URL=                 # URL publique Render (ex: https://ton-app.onrender.com)
PORT=                       # Injecté automatiquement par Render, ne pas toucher
```

Toutes les intégrations sont optionnelles — le panel démarre sans elles, les fonctionnalités correspondantes sont simplement désactivées.

> ⚠️ Le message de bienvenue Discord nécessite l'intent **Server Members Intent** activé dans le Developer Portal du bot.

---

## 📁 Structure du projet

```
nexus/
├── server.ts                   # Point d'entrée Express + Vite (port dynamique)
├── server/
│   ├── routes/                 # Routes API (auth, spotify, discord, logs, ai...)
│   ├── middleware/             # JWT auth middleware
│   ├── discord-gateway.ts      # Gateway Discord WebSocket persistant
│   ├── db.ts                   # Setup SQLite & migrations
│   └── lib/                    # Supabase admin, utilitaires serveur
├── src/
│   ├── pages/                  # Pages React (Dashboard, Spotify, Discord, IA...)
│   ├── components/             # Composants UI (Sidebar, MobileNav, splash screens...)
│   ├── context/                # Auth & Spotify context providers
│   └── lib/                    # Utilitaires frontend, thèmes, client Supabase
└── data/
    └── nexus.db                # Base SQLite locale
```

---

## 🤖 Discord Bot — Commandes slash

### 🔧 Utilitaires
| Commande | Description |
|---|---|
| `/ping` | Latence bot & API |
| `/help` | Liste toutes les commandes |
| `/botinfo` | Infos sur le bot |
| `/serverinfo` | Infos sur le serveur |
| `/userinfo` | Infos sur un membre |
| `/avatar` | Avatar d'un membre |
| `/stats` | Stats de GreNouille.exe |
| `/panelstats` | Stats du Nexus Panel |

### 🛡️ Modération
| Commande | Description |
|---|---|
| `/ban` | Bannir un membre |
| `/kick` | Expulser un membre |
| `/mute` | Mettre en sourdine |
| `/unmute` | Retirer la sourdine |
| `/warn` | Avertir un membre |
| `/clear` | Supprimer des messages |
| `/timeout` | Mettre en timeout |
| `/nick` | Changer le pseudo d'un membre |
| `/setslowmode` | Définir le slowmode d'un salon |

### 👑 Owner
| Commande | Description |
|---|---|
| `/nuke` | Vider un salon entièrement |
| `/lockdown` | Verrouiller / déverrouiller un salon |
| `/massrole` | Donner un rôle à tous les membres |
| `/addrole` | Ajouter un rôle à un membre |
| `/removerole` | Retirer un rôle à un membre |
| `/dm` | Envoyer un DM à un membre |
| `/ghostping` | Ghost ping un membre |
| `/status` | Changer le statut du bot |

### 📣 Communication
| Commande | Description |
|---|---|
| `/say` | Envoyer un message dans un salon |
| `/embed` | Créer un embed personnalisé |
| `/announce` | Publier une annonce |
| `/poll` | Lancer un sondage |
| `/giveaway` | Organiser un giveaway |
| `/emojis` | Lister les emojis personnalisés |
| `/stickers` | Lister les stickers du serveur |

### 🎉 Fun & Social
| Commande | Description |
|---|---|
| `/8ball` | Boule magique |
| `/coinflip` | Pile ou face |
| `/roll` | Lancer un dé |
| `/rps` | Pierre-feuille-ciseaux |
| `/meme` | Mème aléatoire |
| `/gif` | GIF aléatoire |
| `/blague` | Blague aléatoire |

### ✨ IA Nexus
| Commande | Description |
|---|---|
| `/ask` | Poser une question à l'IA |
| `/code` | Générer du code |
| `/traduction` | Traduire un texte |
| `/resume` | Résumer un texte |
| `/meteo` | Météo d'une ville |
| `/roast` | Se faire roaster |
| `/compliment` | Recevoir un compliment |
| `/histoire` | Générer une histoire |

---

## 🎬 Splash Screens

18 écrans de démarrage animés au choix :

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

## 📦 Déploiement (Render)

**Build Command** : `npm install && npm run build`
**Start Command** : `npm run start`
**Auto-Deploy** : On Commit ✅

Le keepalive intégré ping automatiquement `/api/health` toutes les 2 minutes via `PUBLIC_URL` pour maintenir le processus actif et le bot Discord connecté en permanence.

---

## 📜 Changelog

### v1.4.0 — *Update version with AI*
- ✨ Catégorie **IA Nexus** : 8 nouvelles commandes slash IA (`/ask`, `/code`, `/traduction`, `/resume`, `/meteo`, `/roast`, `/compliment`, `/histoire`)
- 🌍 Message de bienvenue automatique lors de l'arrivée d'un nouveau membre
- 🔧 Correction des commandes slash dupliquées (`/say`, `/poll`) qui bloquaient l'enregistrement
- 🔄 Refonte de la stabilité du gateway : timeout 90s anti-stuck, reconnexion intelligente selon les codes d'erreur Discord
- 🗑️ Suppression du comportement autonome IA à 10% (bot répond uniquement en @mention)
- 📋 Panel mis à jour : toutes les catégories de commandes complètes, dont owner + communication
- 🚀 Compatibilité multi-hébergeur : port dynamique via `process.env.PORT`
- 📦 Migration de Vercel → Render pour un hosting Node.js persistant

### v1.3.x — *Gateway & Stability*
- Gateway Discord persistant avec reconnexion automatique
- Health check et keepalive intégrés
- Séparation bot / IA dans l'interface panel

### v1.2.x — *Initial Build*
- Dashboard complet : Spotify, Discord, Analytics, Logs, Auth, Database
- 18+ splash screens animés
- Authentification Supabase

---

<div align="center">

*"Jarvis, sometimes I think you've got more sense than I do."*
*"Then I suspect you've been paying attention, sir."*

Built with ❤️ — private, fast, yours.

**GreNouille.exe** · Nexus Panel v1.4.0

</div>
