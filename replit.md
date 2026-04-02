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
│   ├── App.tsx         # Main React app
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
- **15 splash screen rewrites** (all except TikTok, Gold, Minimal):
  - SplashNexus: Canvas particle grid + animated progress shimmer bar
  - SplashMatrix: Full canvas matrix rain + terminal boot log
  - SplashCyberpunk: Dual-phase glitch with neon corner brackets + RGB split N
  - SplashNetflix: Beam convergence + SVG N logo + shine sweep
  - SplashiOS: iOS-style springy app icon with SF Pro typeface feel
  - SplashWindows: Windows 11 colored tiles + 5-dot loader
  - SplashApple: Path-drawn N + Apple progress bar
  - SplashHUD: Enhanced radar (3 blips, sweep gradient) + 8-line boot log
  - SplashGlitch: Noise texture + intense RGB split → clean settle
  - SplashAurora: 6 dynamic orbs + aurora band + 55-star field
  - SplashRetro: 9-step CRT boot with vignette
  - SplashVaporwave: Denser star field, 7-stripe sun, larger perspective grid
  - SplashFire: Canvas cellular automaton fire + 28 particle embers
  - SplashIce: 9 ice crystal shards + 38 frost particles + glowing N logo
  - SplashNeon: Letter-by-letter reveal + border flicker + floor reflection
- **New Sidebar** (`src/components/Sidebar.tsx`):
  - Active nav item color now follows `logoColor` (no more hardcoded indigo)
  - `motion.div` animated width transition (no CSS transition hack)
  - Smooth active indicator using `layoutId` for background + dot
  - Section groupings: Principal / Outils / Compte with label/divider
  - Tooltips on collapsed state for ALL items including Lock/Logout
  - Pin/PinOff icons, `motion.button` pin toggle with opacity animation
  - User avatar border follows logoColor
- **Discord gateway fixes** (`server/discord-gateway.ts`):
  - Removed duplicate `nick` slash command definition
  - Removed invalid `client.on("disconnect")` event (not valid in discord.js v14)
  - Increased reconnect cap from 10 to 25 attempts
  - Added 5 new slash commands: `/say`, `/poll`, `/giveaway`, `/emojis`, `/stickers`

## Key Notes
- The `authenticateToken` middleware lives in `server/middleware/auth.ts` (extracted to avoid circular dependency between `auth.ts` routes and `logs.ts`)
- SQLite database is used via `better-sqlite3`
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility
- `server/lib/supabaseAdmin.ts` uses lazy initialization to avoid crashing on startup when env vars are not set
- `src/lib/supabase.ts` uses placeholder credentials to avoid crashing when Supabase env vars are not set
