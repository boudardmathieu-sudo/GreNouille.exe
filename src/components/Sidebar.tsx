import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Music, MessageSquare, LogOut, Settings, User, StickyNote,
  ChevronLeft, ChevronRight, Shield, Bookmark, CheckSquare, Lock, Bot, Check,
  Clock, Wifi, WifiOff, Globe, Palette, BarChart3, Zap, X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useSpotify } from "../context/SpotifyContext";
import MobileNav from "./MobileNav";

const LOGO_COLOR_KEY = "nexus-logo-color";

const logoColors = [
  { id: "indigo", label: "Indigo", bg: "rgba(79,110,247,0.22)", border: "rgba(79,110,247,0.4)", glow: "rgba(79,110,247,0.5)", text: "rgba(100,130,255,0.9)", hex: "#4f6ef7" },
  { id: "violet", label: "Violet", bg: "rgba(139,92,246,0.22)", border: "rgba(139,92,246,0.4)", glow: "rgba(139,92,246,0.5)", text: "rgba(167,139,250,0.9)", hex: "#8b5cf6" },
  { id: "cyan", label: "Cyan", bg: "rgba(34,211,238,0.18)", border: "rgba(34,211,238,0.4)", glow: "rgba(34,211,238,0.5)", text: "rgba(34,211,238,0.9)", hex: "#22d3ee" },
  { id: "emerald", label: "Emerald", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.4)", glow: "rgba(16,185,129,0.5)", text: "rgba(16,185,129,0.9)", hex: "#10b981" },
  { id: "rose", label: "Rose", bg: "rgba(244,63,94,0.18)", border: "rgba(244,63,94,0.4)", glow: "rgba(244,63,94,0.5)", text: "rgba(244,63,94,0.9)", hex: "#f43f5e" },
  { id: "amber", label: "Ambre", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.4)", glow: "rgba(245,158,11,0.5)", text: "rgba(245,158,11,0.9)", hex: "#f59e0b" },
  { id: "white", label: "Blanc", bg: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.3)", glow: "rgba(255,255,255,0.4)", text: "rgba(255,255,255,0.9)", hex: "#ffffff" },
];

export function useLogoColor() {
  const [colorId, setColorId] = useState(() => localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
  useEffect(() => {
    const h = () => setColorId(localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
    window.addEventListener("nexus-logo-color-change", h);
    return () => window.removeEventListener("nexus-logo-color-change", h);
  }, []);
  return logoColors.find((c) => c.id === colorId) || logoColors[0];
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function NexusHub({ onClose, logoColor }: { onClose: () => void; logoColor: typeof logoColors[0] }) {
  const { user, lock, signOut } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const navigate = useNavigate();
  const time = useClock();
  const { currentTrack, isPlaying } = useSpotify();
  const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", h), 50);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const pickColor = (id: string) => {
    setSelectedColor(id);
    localStorage.setItem(LOGO_COLOR_KEY, id);
    window.dispatchEvent(new Event("nexus-logo-color-change"));
  };

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString(lang === "FR" ? "fr-FR" : "en-US", { weekday: "long", day: "numeric", month: "long" });

  const quickLinks = [
    { to: "/profile", icon: User, label: "Profil" },
    { to: "/settings", icon: Settings, label: "Paramètres" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/security", icon: Shield, label: "Sécurité" },
  ];

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.92, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.92, x: -10 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute left-16 top-0 z-[200] rounded-2xl border border-white/12 shadow-2xl overflow-hidden"
      style={{ background: "rgba(6,6,18,0.98)", backdropFilter: "blur(28px)", width: 280 }}
    >
      {/* Header: close */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md flex items-center justify-center text-sm font-black text-white"
            style={{ background: logoColor.bg, border: `1px solid ${logoColor.border}`, boxShadow: `0 0 10px ${logoColor.glow}40` }}
          >N</div>
          <span className="text-sm font-bold text-white">Nexus Hub</span>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Clock */}
      <div className="mx-4 mt-2 mb-3 rounded-xl bg-white/5 border border-white/8 p-3 text-center">
        <div className="flex items-center justify-center gap-1 font-mono">
          <span className="text-3xl font-black text-white tabular-nums">{hours}</span>
          <span className="text-2xl font-black text-gray-500 animate-pulse">:</span>
          <span className="text-3xl font-black text-white tabular-nums">{minutes}</span>
          <span className="text-lg font-bold text-gray-600 tabular-nums ml-1">{seconds}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 capitalize">{dateStr}</p>
      </div>

      {/* User info */}
      {user && (
        <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 px-3 py-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            {(user as any).avatarUrl ? (
              <img src={(user as any).avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">{user.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-1">
            {user.hasSpotify ? (
              <span title="Spotify connecté"><Wifi className="h-3 w-3 text-emerald-400" /></span>
            ) : (
              <span title="Spotify non connecté"><WifiOff className="h-3 w-3 text-gray-600" /></span>
            )}
          </div>
        </div>
      )}

      {/* Spotify mini */}
      {currentTrack && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 px-3 py-2">
          {currentTrack.album?.images?.[0]?.url && (
            <img src={currentTrack.album.images[0].url} alt="" className="h-7 w-7 rounded-md shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1DB954] truncate">{currentTrack.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
          </div>
          <div className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? "bg-[#1DB954] animate-pulse" : "bg-gray-600"}`} />
        </div>
      )}

      {/* Color picker */}
      <div className="mx-4 mb-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Palette className="h-3 w-3" /> Couleur du logo
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {logoColors.map((c) => (
            <button key={c.id} onClick={() => pickColor(c.id)} title={c.label}
              className="relative h-7 w-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ background: c.bg, border: `1px solid ${selectedColor === c.id ? c.border : "rgba(255,255,255,0.08)"}`, boxShadow: selectedColor === c.id ? `0 0 10px ${c.glow}` : "none" }}
            >
              {selectedColor === c.id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      {/* Language toggle */}
      <div className="mx-4 mb-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Globe className="h-3 w-3" /> Langue
        </p>
        <div className="flex gap-1.5">
          {(["FR", "EN"] as const).map((l) => (
            <button key={l} onClick={() => { if (lang !== l) toggle(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${lang === l ? "bg-white/15 text-white" : "text-gray-600 hover:text-gray-400 hover:bg-white/5"}`}
            >{l === "FR" ? "🇫🇷 FR" : "🇬🇧 EN"}</button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="mx-4 mb-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Zap className="h-3 w-3" /> Accès rapide
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {quickLinks.map(({ to, icon: Icon, label }) => (
            <button key={to} onClick={() => { navigate(to); onClose(); }}
              className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-2 text-xs text-gray-400 hover:text-white transition-all text-left"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mx-4 mb-4 flex gap-1.5">
        <button onClick={() => { lock(); onClose(); }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition-colors"
        >
          <Lock className="h-3.5 w-3.5" /> Verrouiller
        </button>
        <button onClick={async () => { await signOut(); onClose(); navigate("/login"); }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Quitter
        </button>
      </div>
    </motion.div>
  );
}

export default function Sidebar() {
  const { signOut, lock, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const isMobile = useIsMobile();
  const logoColor = useLogoColor();

  const isCollapsed = !isPinned && !isHovered;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/ai", icon: Bot, label: "NEXUS AI" },
    { to: "/spotify", icon: Music, label: t.nav.spotify },
    { to: "/discord", icon: MessageSquare, label: t.nav.discord },
    { to: "/analytics", icon: StickyNote, label: t.nav.analytics },
    { to: "/security", icon: Shield, label: t.nav.security },
    { to: "/database", icon: Bookmark, label: t.nav.database },
    { to: "/logs", icon: CheckSquare, label: t.nav.logs },
    { to: "/profile", icon: User, label: t.nav.profile },
    { to: "/settings", icon: Settings, label: t.nav.settings },
  ];

  const avatarUrl = (user as any)?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase();

  if (isMobile) return <MobileNav />;

  return (
    <div
      style={{ width: isCollapsed ? 80 : 256 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-screen flex-col border-r border-white/10 bg-[#050505] p-4 z-50 transition-[width] duration-200 ease-in-out shrink-0"
    >
      <button onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white hover:bg-white/20 transition-colors duration-200"
      >
        {isPinned ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div className={`mb-12 flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-2 mt-4`}>
        <div className="relative">
          <AnimatePresence>
            {showHub && <NexusHub onClose={() => setShowHub(false)} logoColor={logoColor} />}
          </AnimatePresence>
          <button onClick={() => setShowHub(!showHub)}
            title="Nexus Hub"
            className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(145deg, ${logoColor.bg} 0%, rgba(0,0,0,0.1) 100%)`,
              border: `1px solid ${logoColor.border}`,
              boxShadow: `0 0 0 1px ${logoColor.bg}, 0 0 14px ${logoColor.glow}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <span className="text-sm font-black select-none leading-none"
              style={{ color: "#ffffff", textShadow: `0 0 10px ${logoColor.text}, 0 0 20px ${logoColor.glow}`, letterSpacing: "-0.04em", fontFamily: "system-ui, sans-serif" }}
            >N</span>
          </button>
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-black tracking-[0.2em] whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(160,180,255,0.85) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >NEXUS</h1>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-gray-400 hover:bg-white/5 hover:text-indigo-300"
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="relative z-10 h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="relative z-10 whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!isCollapsed && user && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden border border-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initial}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      )}

      <button onClick={lock}
        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-yellow-500/10 hover:text-yellow-400 mb-1`}
        title={isCollapsed ? "Verrouiller" : undefined}
      >
        <Lock className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="whitespace-nowrap">Verrouiller</span>}
      </button>

      <button onClick={handleLogout}
        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400`}
        title={isCollapsed ? t.nav.logout : undefined}
      >
        <LogOut className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isCollapsed ? "" : "group-hover:-translate-x-1"}`} />
        {!isCollapsed && <span className="whitespace-nowrap">{t.nav.logout}</span>}
      </button>
    </div>
  );
}
