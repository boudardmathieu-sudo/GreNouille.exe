import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Music2, Bot, BarChart2, Brain,
  Palette, Calendar, Shield, Database, ScrollText,
  RotateCcw, Copy, ChevronLeft, ChevronRight,
  Cpu, Zap, Settings, Blocks,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",  icon: LayoutDashboard, path: "/dashboard" },
  { label: "Spotify",    icon: Music2,           path: "/spotify"   },
  { label: "Discord",    icon: Bot,              path: "/discord"   },
  { label: "IA Nexus",   icon: Brain,            path: "/ai"        },
  { label: "Analytics",  icon: BarChart2,        path: "/analytics" },
  { label: "Agenda",     icon: Calendar,         path: "/agenda"    },
];

const TOOL_ITEMS = [
  { label: "Thèmes",     icon: Palette,          path: "/themes"    },
  { label: "Widgets",    icon: Blocks,           path: "/widgets"   },
  { label: "Sécurité",   icon: Shield,           path: "/security"  },
  { label: "Database",   icon: Database,         path: "/database"  },
  { label: "Logs",       icon: ScrollText,       path: "/logs"      },
  { label: "Paramètres", icon: Settings,         path: "/settings"  },
];

type MenuPos = { x: number; y: number };

export default function ContextMenu() {
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [copying, setCopying] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      // Allow default on inputs, textareas, selects
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      e.preventDefault();

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const menuW = 220;
      const menuH = 420;
      const x = e.clientX + menuW > vw ? e.clientX - menuW : e.clientX;
      const y = e.clientY + menuH > vh ? e.clientY - menuH : e.clientY;
      setPos({ x, y });
    };

    const close = () => setPos(null);

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  const go = (path: string) => { navigate(path); setPos(null); };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopying(true);
    setTimeout(() => setCopying(false), 1400);
    setPos(null);
  };

  return (
    <AnimatePresence>
      {pos && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.93, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: -4 }}
          transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[9999] select-none"
          style={{ left: pos.x, top: pos.y, minWidth: 210 }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="rounded-xl overflow-hidden text-[12px] font-medium"
            style={{
              background: "rgba(8, 8, 20, 0.96)",
              border: "1px solid rgba(79,110,247,0.25)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(79,110,247,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="px-3 py-2.5 flex items-center gap-2 border-b border-white/[0.06]">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(79,110,247,0.5), rgba(124,58,237,0.4))", boxShadow: "0 0 8px rgba(79,110,247,0.3)" }}>
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-white font-black tracking-wider text-[11px]">NEXUS</span>
              <span className="ml-auto text-white/25 text-[9px] font-mono">v1.4.0</span>
            </div>

            {/* Navigation */}
            <div className="px-1 py-1 border-b border-white/[0.06]">
              <div className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase text-white/25">Navigation</div>
              {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
                <button key={path} onClick={() => go(path)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left group"
                  style={{
                    color: location.pathname === path ? "rgb(99,130,255)" : "rgba(255,255,255,0.75)",
                    background: location.pathname === path ? "rgba(79,110,247,0.12)" : "transparent",
                  }}
                  onMouseEnter={e => { if (location.pathname !== path) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (location.pathname !== path) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: location.pathname === path ? "rgb(99,130,255)" : "rgba(255,255,255,0.4)" }} />
                  {label}
                  {location.pathname === path && <span className="ml-auto w-1 h-1 rounded-full bg-blue-400" />}
                </button>
              ))}
            </div>

            {/* Tools */}
            <div className="px-1 py-1 border-b border-white/[0.06]">
              <div className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase text-white/25">Outils</div>
              {TOOL_ITEMS.map(({ label, icon: Icon, path }) => (
                <button key={path} onClick={() => go(path)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left"
                  style={{ color: location.pathname === path ? "rgb(99,130,255)" : "rgba(255,255,255,0.65)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/35" />
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="px-1 py-1">
              <div className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase text-white/25">Actions</div>
              <button onClick={() => { window.history.back(); setPos(null); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left text-white/65"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <ChevronLeft className="h-3.5 w-3.5 text-white/35" />
                Précédent
                <span className="ml-auto text-white/20 text-[9px] font-mono">ALT+←</span>
              </button>
              <button onClick={() => { window.history.forward(); setPos(null); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left text-white/65"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <ChevronRight className="h-3.5 w-3.5 text-white/35" />
                Suivant
              </button>
              <button onClick={() => { window.location.reload(); setPos(null); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left text-white/65"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <RotateCcw className="h-3.5 w-3.5 text-white/35" />
                Recharger
                <span className="ml-auto text-white/20 text-[9px] font-mono">F5</span>
              </button>
              <button onClick={copyUrl}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left"
                style={{ color: copying ? "rgba(99,255,130,0.9)" : "rgba(255,255,255,0.65)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <Copy className="h-3.5 w-3.5 text-white/35" />
                {copying ? "Copié !" : "Copier l'adresse"}
              </button>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-white/[0.06] flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-white/20" />
              <span className="text-white/20 text-[9px] font-mono">NEXUS PANEL · MATHIEU</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
