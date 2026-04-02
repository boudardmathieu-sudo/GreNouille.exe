import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Music, MessageSquare, LogOut, Settings, User, StickyNote,
  ChevronLeft, ChevronRight, Shield, Bookmark, CheckSquare, Lock, Bot, Check,
  Wifi, WifiOff, Globe, Palette, BarChart3, Zap, X, LayoutGrid, Paintbrush,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useSpotify } from "../context/SpotifyContext";
import MobileNav from "./MobileNav";
import {
  logoColors, DEFAULT_LOGO_STYLE,
  getLetterStyle, getContainerShape, getLogoStyle,
} from "../lib/theme";
import type { LogoColor, LogoStyle } from "../lib/theme";

const LOGO_COLOR_KEY = "nexus-logo-color";
const LOGO_STYLE_KEY = "nexus-logo-style";

export { logoColors, getLetterStyle, getContainerShape };
export type { LogoStyle };

export function loadLogoStyle(): LogoStyle {
  return getLogoStyle();
}

export function saveLogoStyle(style: LogoStyle) {
  localStorage.setItem(LOGO_STYLE_KEY, JSON.stringify(style));
  window.dispatchEvent(new Event("nexus-logo-style-change"));
}

export function useLogoColor() {
  const [colorId, setColorId] = useState(() => localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
  useEffect(() => {
    const h = () => setColorId(localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
    window.addEventListener("nexus-logo-color-change", h);
    return () => window.removeEventListener("nexus-logo-color-change", h);
  }, []);
  return logoColors.find((c) => c.id === colorId) || logoColors[0];
}

export function useLogoStyle() {
  const [style, setStyle] = useState<LogoStyle>(getLogoStyle);
  useEffect(() => {
    const h = () => setStyle(getLogoStyle());
    window.addEventListener("nexus-logo-style-change", h);
    return () => window.removeEventListener("nexus-logo-style-change", h);
  }, []);
  return style;
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const FONT_OPTIONS: { id: LogoStyle["font"]; label: string }[] = [
  { id: "system",  label: "Défaut"  },
  { id: "serif",   label: "Serif"   },
  { id: "mono",    label: "Mono"    },
  { id: "impact",  label: "Impact"  },
  { id: "italic",  label: "Italic"  },
  { id: "display", label: "Display" },
];

const EFFECT_OPTIONS: { id: LogoStyle["effect"]; label: string }[] = [
  { id: "glow",     label: "Glow"    },
  { id: "neon",     label: "Neon"    },
  { id: "gradient", label: "Gradient"},
  { id: "outline",  label: "Outline" },
  { id: "hologram", label: "Holo"    },
  { id: "plain",    label: "Plain"   },
];

const SHAPE_OPTIONS: { id: LogoStyle["shape"]; label: string }[] = [
  { id: "rounded", label: "Arrondi" },
  { id: "square",  label: "Carré"   },
  { id: "circle",  label: "Cercle"  },
];

function NexusHub({ onClose, logoColor, logoStyle }: { onClose: () => void; logoColor: LogoColor; logoStyle: LogoStyle }) {
  const { user, lock, signOut } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const navigate = useNavigate();
  const time = useClock();
  const { currentTrack, isPlaying } = useSpotify();
  const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
  const [selectedStyle, setSelectedStyle] = useState<LogoStyle>(getLogoStyle);
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

  const updateStyle = (partial: Partial<LogoStyle>) => {
    const next = { ...selectedStyle, ...partial };
    setSelectedStyle(next);
    saveLogoStyle(next);
  };

  const hours   = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString(lang === "FR" ? "fr-FR" : "en-US", { weekday: "long", day: "numeric", month: "long" });

  const previewColor = logoColors.find(c => c.id === selectedColor) || logoColors[0];
  const letterCSS    = getLetterStyle(previewColor, selectedStyle);
  const shapeClass   = getContainerShape(selectedStyle);

  const quickLinks = [
    { to: "/profile",  icon: User,       label: "Profil"      },
    { to: "/settings", icon: Settings,   label: "Paramètres"  },
    { to: "/themes",   icon: Paintbrush, label: "Thèmes"      },
    { to: "/security", icon: Shield,     label: "Sécurité"    },
  ];

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.92, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.92, x: -10 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute left-16 top-0 z-[200] rounded-2xl border border-white/12 shadow-2xl"
      style={{ background: "rgba(6,6,18,0.98)", backdropFilter: "blur(28px)", width: 300, maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 ${shapeClass} flex items-center justify-center text-sm shrink-0`}
            style={{ background: previewColor.bg, border: `1px solid ${previewColor.border}`, boxShadow: `0 0 10px ${previewColor.glow}40` }}
          >
            <span style={{ ...letterCSS, fontSize: 11 }}>N</span>
          </div>
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
          {user.hasSpotify ? (
            <span title="Spotify connecté"><Wifi className="h-3 w-3 text-emerald-400" /></span>
          ) : (
            <span title="Spotify non connecté"><WifiOff className="h-3 w-3 text-gray-600" /></span>
          )}
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

      {/* Logo customization */}
      <div className="mx-4 mb-3 space-y-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
          <Palette className="h-3 w-3" /> Personnalisation du logo
        </p>

        {/* Color */}
        <div>
          <p className="text-[9px] text-gray-700 uppercase tracking-wider mb-1.5">Couleur</p>
          <div className="grid grid-cols-7 gap-1">
            {logoColors.slice(0, 14).map((c) => (
              <button key={c.id} onClick={() => pickColor(c.id)} title={c.label}
                className="relative h-6 w-full rounded-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                style={{ background: c.bg, border: `1px solid ${selectedColor === c.id ? c.border : "rgba(255,255,255,0.06)"}`, boxShadow: selectedColor === c.id ? `0 0 8px ${c.glow}` : "none" }}
              >
                {selectedColor === c.id && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div>
          <p className="text-[9px] text-gray-700 uppercase tracking-wider mb-1.5">Police</p>
          <div className="grid grid-cols-3 gap-1">
            {FONT_OPTIONS.map((f) => {
              const fStyle = getLetterStyle(previewColor, { ...selectedStyle, font: f.id });
              return (
                <button key={f.id} onClick={() => updateStyle({ font: f.id })}
                  className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-1 border transition-all ${selectedStyle.font === f.id ? "border-white/30 bg-white/10" : "border-white/5 bg-white/3 hover:bg-white/8"}`}
                >
                  <span style={{ ...fStyle, fontSize: 13 }} className="leading-none">N</span>
                  <span className="text-[8px] text-gray-500">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Effect */}
        <div>
          <p className="text-[9px] text-gray-700 uppercase tracking-wider mb-1.5">Effet</p>
          <div className="grid grid-cols-3 gap-1">
            {EFFECT_OPTIONS.map((e) => {
              const eStyle = getLetterStyle(previewColor, { ...selectedStyle, effect: e.id });
              const containerStyle = { background: previewColor.bg, border: `1px solid ${previewColor.border}`, boxShadow: `0 0 8px ${previewColor.glow}30` };
              return (
                <button key={e.id} onClick={() => updateStyle({ effect: e.id })}
                  className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-1 border transition-all ${selectedStyle.effect === e.id ? "border-white/30 bg-white/10" : "border-white/5 bg-white/3 hover:bg-white/8"}`}
                >
                  <div className={`h-5 w-5 ${getContainerShape(selectedStyle)} flex items-center justify-center`} style={containerStyle}>
                    <span style={{ ...eStyle, fontSize: 10 }} className="leading-none">N</span>
                  </div>
                  <span className="text-[8px] text-gray-500">{e.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shape */}
        <div>
          <p className="text-[9px] text-gray-700 uppercase tracking-wider mb-1.5">Forme</p>
          <div className="grid grid-cols-3 gap-1">
            {SHAPE_OPTIONS.map((s) => {
              const sp = getContainerShape({ ...selectedStyle, shape: s.id });
              return (
                <button key={s.id} onClick={() => updateStyle({ shape: s.id })}
                  className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-1 border transition-all ${selectedStyle.shape === s.id ? "border-white/30 bg-white/10" : "border-white/5 bg-white/3 hover:bg-white/8"}`}
                >
                  <div className={`h-5 w-5 ${sp} flex items-center justify-center`}
                    style={{ background: previewColor.bg, border: `1px solid ${previewColor.border}` }}
                  >
                    <span style={{ ...letterCSS, fontSize: 10 }} className="leading-none">N</span>
                  </div>
                  <span className="text-[8px] text-gray-500">{s.label}</span>
                </button>
              );
            })}
          </div>
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
  const [isHovered, setIsHovered]   = useState(false);
  const [isPinned, setIsPinned]     = useState(false);
  const [showHub, setShowHub]       = useState(false);
  const isMobile = useIsMobile();
  const logoColor = useLogoColor();
  const logoStyle = useLogoStyle();

  const isCollapsed = !isPinned && !isHovered;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const letterCSS  = getLetterStyle(logoColor, logoStyle);
  const shapeClass = getContainerShape(logoStyle);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/ai",        icon: Bot,             label: "NEXUS AI"       },
    { to: "/spotify",   icon: Music,           label: t.nav.spotify    },
    { to: "/discord",   icon: MessageSquare,   label: t.nav.discord    },
    { to: "/analytics", icon: StickyNote,      label: t.nav.analytics  },
    { to: "/security",  icon: Shield,          label: t.nav.security   },
    { to: "/database",  icon: Bookmark,        label: t.nav.database   },
    { to: "/logs",      icon: CheckSquare,     label: t.nav.logs       },
    { to: "/widgets",   icon: LayoutGrid,      label: t.nav.widgets    },
    { to: "/themes",    icon: Paintbrush,      label: t.nav.themes     },
    { to: "/profile",   icon: User,            label: t.nav.profile    },
    { to: "/settings",  icon: Settings,        label: t.nav.settings   },
  ];

  const avatarUrl = (user as any)?.avatarUrl;
  const initial   = user?.username?.[0]?.toUpperCase();

  if (isMobile) return <MobileNav />;

  return (
    <div
      style={{ width: isCollapsed ? 80 : 256 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-screen flex-col overflow-hidden border-r border-white/10 bg-[#050505] z-50 transition-[width] duration-200 ease-in-out shrink-0"
    >
      {/* Pin toggle */}
      <button onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white hover:bg-white/20 transition-colors duration-200"
      >
        {isPinned ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Logo header */}
      <div className={`flex-shrink-0 flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 pt-5 pb-4`}>
        <div className="relative">
          <AnimatePresence>
            {showHub && <NexusHub onClose={() => setShowHub(false)} logoColor={logoColor} logoStyle={logoStyle} />}
          </AnimatePresence>
          <button onClick={() => setShowHub(!showHub)}
            title="Nexus Hub"
            className={`flex shrink-0 h-8 w-8 items-center justify-center transition-transform hover:scale-110 active:scale-95 ${shapeClass}`}
            style={{
              background: `linear-gradient(145deg, ${logoColor.bg} 0%, rgba(0,0,0,0.1) 100%)`,
              border: `1px solid ${logoColor.border}`,
              boxShadow: `0 0 0 1px ${logoColor.bg}, 0 0 14px ${logoColor.glow}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <span className="text-sm select-none leading-none" style={letterCSS}>N</span>
          </button>
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-black tracking-[0.2em] whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(160,180,255,0.85) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >NEXUS</h1>
        )}
      </div>

      {/* Nav — flex-1 + min-h-0 allows proper scrolling */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-0.5 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-indigo-300 border border-transparent"
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section — always sticks to bottom */}
      <div className="flex-shrink-0 px-2 pt-2 pb-3 border-t border-white/5">
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
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-yellow-500/10 hover:text-yellow-400 mb-0.5`}
          title={isCollapsed ? "Verrouiller" : undefined}
        >
          <Lock className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Verrouiller</span>}
        </button>

        <button onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400`}
          title={isCollapsed ? t.nav.logout : undefined}
        >
          <LogOut className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isCollapsed ? "" : "group-hover:-translate-x-1"}`} />
          {!isCollapsed && <span className="whitespace-nowrap">{t.nav.logout}</span>}
        </button>
      </div>
    </div>
  );
}
