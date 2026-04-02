import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LayoutGrid, Clock, Calendar, Cloud, Cpu, Bookmark, Music, TrendingUp, Plus, X, GripVertical } from "lucide-react";
import { useSpotify } from "../context/SpotifyContext";

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function ClockWidget() {
  const time = useClock();
  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <div className="flex items-end gap-1 font-mono">
        <span className="text-5xl font-black text-white tabular-nums leading-none">{h}</span>
        <span className="text-4xl font-black text-gray-500 animate-pulse leading-none mb-0.5">:</span>
        <span className="text-5xl font-black text-white tabular-nums leading-none">{m}</span>
        <span className="text-2xl font-bold text-gray-600 tabular-nums leading-none mb-1 ml-1">{s}</span>
      </div>
      <p className="text-xs text-gray-500 capitalize mt-1">{dateStr}</p>
    </div>
  );
}

function CalendarWidget() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = ["L","M","M","J","V","S","D"];
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  return (
    <div className="flex flex-col h-full gap-2">
      <p className="text-xs font-semibold text-gray-300 capitalize text-center">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(d => (
          <div key={d} className="text-[9px] text-gray-600 text-center font-medium py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`text-[10px] text-center py-1 rounded-md leading-none transition-colors ${
            d === today.getDate() ? "bg-indigo-500 text-white font-bold" : d ? "text-gray-400 hover:bg-white/5" : ""
          }`}>{d ?? ""}</div>
        ))}
      </div>
    </div>
  );
}

function SpotifyWidget() {
  const { currentTrack, isPlaying } = useSpotify();

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
        <Music className="h-8 w-8 text-gray-700" />
        <p className="text-xs text-gray-600">Aucune musique en cours</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {currentTrack.album?.images?.[0]?.url && (
        <div className="relative">
          <img src={currentTrack.album.images[0].url} alt="" className={`h-16 w-16 rounded-xl shadow-lg ${isPlaying ? "animate-[spin_8s_linear_infinite]" : ""}`}
            style={{ borderRadius: "50%", boxShadow: isPlaying ? "0 0 20px rgba(29,185,84,0.4)" : undefined }} />
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#050505]" />
          </div>
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-semibold text-white truncate max-w-[160px]">{currentTrack.name}</p>
        <p className="text-xs text-gray-500 truncate max-w-[160px]">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
      </div>
      <div className={`flex items-center gap-1.5 text-xs ${isPlaying ? "text-[#1DB954]" : "text-gray-600"}`}>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-[#1DB954] animate-pulse" : "bg-gray-600"}`} />
        {isPlaying ? "En lecture" : "En pause"}
      </div>
    </div>
  );
}

function StatsWidget() {
  const [load, setLoad] = useState(Math.floor(Math.random() * 30 + 20));
  const [mem, setMem] = useState(Math.floor(Math.random() * 20 + 50));

  useEffect(() => {
    const t = setInterval(() => {
      setLoad(v => Math.max(10, Math.min(95, v + (Math.random() * 10 - 5))));
      setMem(v => Math.max(30, Math.min(90, v + (Math.random() * 6 - 3))));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: "CPU", value: Math.round(load), color: load > 70 ? "#f43f5e" : load > 50 ? "#f59e0b" : "#10b981" },
    { label: "RAM", value: Math.round(mem), color: mem > 80 ? "#f43f5e" : mem > 60 ? "#f59e0b" : "#10b981" },
    { label: "Disk", value: 42, color: "#10b981" },
    { label: "Net", value: 15, color: "#22d3ee" },
  ];

  return (
    <div className="flex flex-col h-full gap-3 justify-center">
      {stats.map(s => (
        <div key={s.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 font-mono">{s.label}</span>
            <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.value}%`, background: s.color, boxShadow: `0 0 6px ${s.color}60` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuoteWidget() {
  const quotes = [
    { text: "L'excellence est un art qu'on ne maîtrise que par l'entraînement.", author: "Aristote" },
    { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
    { text: "Le code, c'est de la poésie pour les machines.", author: "Anonyme" },
    { text: "Les données sont le nouveau pétrole.", author: "Clive Humby" },
    { text: "Toute technologie suffisamment avancée est indiscernable de la magie.", author: "Arthur C. Clarke" },
  ];
  const [idx] = useState(() => Math.floor(Math.random() * quotes.length));
  const q = quotes[idx];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-2">
      <div className="text-3xl text-gray-700 font-serif leading-none">"</div>
      <p className="text-xs text-gray-300 italic leading-relaxed">{q.text}</p>
      <p className="text-[10px] text-gray-600">— {q.author}</p>
    </div>
  );
}

const WIDGETS_CONFIG = [
  { id: "clock", label: "Horloge", icon: Clock, component: ClockWidget, cols: 2, rows: 1, color: "indigo" },
  { id: "calendar", label: "Calendrier", icon: Calendar, component: CalendarWidget, cols: 1, rows: 2, color: "violet" },
  { id: "spotify", label: "Spotify", icon: Music, component: SpotifyWidget, cols: 1, rows: 2, color: "emerald" },
  { id: "stats", label: "Système", icon: Cpu, component: StatsWidget, cols: 1, rows: 2, color: "cyan" },
  { id: "quote", label: "Citation", icon: TrendingUp, component: QuoteWidget, cols: 2, rows: 1, color: "amber" },
];

const ACCENT_COLORS: Record<string, string> = {
  indigo: "rgba(79,110,247,0.15)",
  violet: "rgba(139,92,246,0.15)",
  emerald: "rgba(16,185,129,0.12)",
  cyan: "rgba(34,211,238,0.12)",
  amber: "rgba(245,158,11,0.12)",
};

const BORDER_COLORS: Record<string, string> = {
  indigo: "rgba(79,110,247,0.3)",
  violet: "rgba(139,92,246,0.3)",
  emerald: "rgba(16,185,129,0.3)",
  cyan: "rgba(34,211,238,0.3)",
  amber: "rgba(245,158,11,0.3)",
};

const WIDGETS_VISIBLE_KEY = "nexus-widgets-visible";

export default function Widgets() {
  const [visible, setVisible] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WIDGETS_VISIBLE_KEY) || "null") || WIDGETS_CONFIG.map(w => w.id); }
    catch { return WIDGETS_CONFIG.map(w => w.id); }
  });

  const toggleWidget = (id: string) => {
    const next = visible.includes(id) ? visible.filter(v => v !== id) : [...visible, id];
    setVisible(next);
    localStorage.setItem(WIDGETS_VISIBLE_KEY, JSON.stringify(next));
  };

  const activeWidgets = WIDGETS_CONFIG.filter(w => visible.includes(w.id));

  return (
    <div className="flex-1 p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <LayoutGrid className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-sky-500">
                Widgets
              </span>
            </h1>
            <p className="mt-2 text-gray-400">Affichez vos informations importantes en un coup d'œil.</p>
          </div>

          {/* Widget toggle buttons */}
          <div className="flex flex-wrap gap-2">
            {WIDGETS_CONFIG.map(w => (
              <button key={w.id} onClick={() => toggleWidget(w.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  visible.includes(w.id)
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/8 text-gray-600 hover:border-white/15 hover:text-gray-400"
                }`}
              >
                <w.icon className="h-3 w-3" />
                {w.label}
                {visible.includes(w.id) ? <X className="h-2.5 w-2.5 ml-0.5 opacity-60" /> : <Plus className="h-2.5 w-2.5 ml-0.5 opacity-60" />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {activeWidgets.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-4">
          <LayoutGrid className="h-16 w-16 text-gray-800" />
          <p className="text-gray-600 text-sm">Aucun widget actif. Activez-en un ci-dessus.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]"
        >
          {activeWidgets.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-2xl border p-4 backdrop-blur-xl overflow-hidden relative"
              style={{
                background: ACCENT_COLORS[w.color] || "rgba(255,255,255,0.03)",
                borderColor: BORDER_COLORS[w.color] || "rgba(255,255,255,0.1)",
                gridColumn: w.cols > 1 ? `span ${w.cols}` : undefined,
                gridRow: w.rows > 1 ? `span ${w.rows}` : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <w.icon className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">{w.label}</span>
              </div>
              <div className="flex-1 h-[calc(100%-28px)]">
                <w.component />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
