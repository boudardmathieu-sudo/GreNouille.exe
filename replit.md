# Nexus - React + Express Full-Stack App

## Overview
A full-stack web application built with React (Vite) on the frontend and Express on the backend. The server uses Vite middleware in development mode to serve the SPA. Features include authentication, Spotify integration, Discord integration, analytics, and database management.

## Architecture

### Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite 6
- **Backend:** Express 4, TypeScript (via tsx), better-sqlite3
- **Auth:** JWT (jsonwebtoken), bcrypt, cookie-parser
- **Other:** Google Gemini AI SDK, nodemailer, axios, recharts, lucide-react, framer motion

### Project Structure
```
/
├── server.ts           # Entry point - Express + Vite dev server on port 5000
├── server/
│   ├── db.ts           # SQLite database setup (better-sqlite3)
│   ├── middleware/
│   │   └── auth.ts     # JWT authenticateToken middleware
│   └── routes/
│       ├── auth.ts     # Auth routes (signup, login, 2FA, sessions)
│       ├── spotify.ts  # Spotify API proxy routes
│       ├── discord.ts  # Discord bot routes
│       ├── database.ts # Database stats/query routes
│       ├── logs.ts     # System logs routes
│       └── analytics.ts # Analytics routes
├── src/
│   ├── App.tsx         # Main React app + routes (incl. /agenda)
│   ├── main.tsx        # React entry point
│   ├── components/     # Shared UI components
│   ├── context/        # React context providers
│   ├── lib/            # Utilities
│   └── pages/          # Page components
├── vite.config.ts      # Vite config - allowedHosts: true, host: 0.0.0.0
└── package.json        # npm scripts
```

## Development
- **Start:** `npm run dev` (runs via `tsx server.ts`)
- **Port:** 5000 (both frontend and backend on same port via Vite middleware)
- **Build:** `npm run build` (Vite production build to `dist/`)

## Environment Variables
See `.env.example` for required variables:
- `GEMINI_API_KEY` - Google Gemini AI API key
- `APP_URL` - The hosted app URL
- `JWT_SECRET` - Secret for JWT signing
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` - Spotify OAuth credentials
- `DISCORD_BOT_TOKEN` / `DISCORD_CHANNEL_ID` - Discord bot credentials

## Environment Variables (Supabase)
The app also uses Supabase for authentication:
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase admin client
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` - Client-side Supabase client

Both Supabase clients are lazily initialized — the app starts without them, but auth features require them to be configured via Replit Secrets.

## Version 1.2.0 Changes
- **Logo styles:** Added font (system, serif, mono, impact, italic, display), visual effect (glow, neon, gradient, outline, hologram, plain), and shape (rounded, square, circle) customization. Stored in `localStorage` under `nexus-logo-style`. Exposed via `useLogoStyle()` hook.
- **14 logo colors:** Extended from 7 to 14 colors (added pink, orange, lime, teal, gold, red, sky).
- **New nav categories:** Added **Thèmes** (`/themes`) and **Widgets** (`/widgets`) pages.
- **Themes page** (`src/pages/Themes.tsx`): Consolidates logo customization (color + style), startup animations, and appearance settings (moved from Settings).
- **Widgets page** (`src/pages/Widgets.tsx`): Live clock, calendar, Spotify mini-player, system stats, and quote widgets. Widget visibility stored in `localStorage`.
- **Settings page** simplified: Removed animation/appearance sections (now in Themes). Added a link to the Themes page.

## Version 1.3.0 Changes
- **SplashFire complete rework** (`src/components/splashscreens/SplashFire.tsx`):
  - No more canvas — entirely CSS/Motion layered approach
  - 7 overlapping flame blobs (radial-gradient + blur + mix-blend-mode: screen)
  - Sharp white-hot inner flame core
  - Heat distortion overlay, 4 smoke wisps, 50 color-varied ember particles
  - 3-phase reveal: ignite → burn → NEXUS text (gradient: white→yellow→orange→red→deep red with pulsing glow)
- **SplashNetflix / SplashApple reworks** (cinematic redesign / SVG N path fix)
- **New page: Agenda** (`src/pages/Agenda.tsx`, route `/agenda`):
  - Monthly calendar with prev/next navigation, today highlight, per-day task dot
  - Task creation: text, priority (Faible/Moyen/Urgent), time picker, tags (Perso/Travail/Sport/Santé/Étude/Projet)
  - Tag filter pills, priority sort, progress bar, mini stats (today / pending)
  - localStorage persistence under `nexus-agenda-tasks`
  - Split layout: calendar panel (left) + task panel (right) with glassmorphism
- **Sidebar new categories** (`src/components/Sidebar.tsx`):
  - 5 semantic groups: **Accueil** (Dashboard, AI) / **Productivité** (Agenda, Notes, Tâches, Widgets) / **Médias & Social** (Spotify, Discord) / **Outils** (Favoris, Sécurité) / **Compte** (Thèmes, Profil, Paramètres)
  - Agenda entry uses CalendarDays icon
- **Widgets page redesign** (`src/pages/Widgets.tsx`):
  - Hero header: gradient + ambient orbs + glow icon + active/hidden count pills
  - "Gérer" collapsible drawer (slides below header) replaces old flat pill toggles
  - Cards: rounded-3xl, gradient bg, icon badge in header, X button on hover, layout animation
  - Empty state with illustration + CTA
  - 10 widgets: Horloge, Calendrier, Spotify, Système, Citation, Pomodoro, Objectifs, Batterie, Météo, Compte à rebours
- **MobileNav updated**: Agenda + Widgets added, labels updated
- **Discord gateway fixes**: Removed duplicate `/nick`, invalid disconnect event; added `/say`, `/poll`, `/giveaway`, `/emojis`, `/stickers`; reconnect cap 10 → 25

## Key Notes
- The `authenticateToken` middleware lives in `server/middleware/auth.ts` (extracted to avoid circular dependency between `auth.ts` routes and `logs.ts`)
- SQLite database is used via `better-sqlite3`
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility
- `server/lib/supabaseAdmin.ts` uses lazy initialization to avoid crashing on startup when env vars are not set
- `src/lib/supabase.ts` uses placeholder credentials to avoid crashing when Supabase env vars are not set
- Pre-existing TypeScript warnings (non-blocking): React `key` prop on JSX components in Sidebar/Themes/Agenda (React runtime handles these correctly), `React.RefObject` resolved via named import, `import.meta.env` in supabase.ts
