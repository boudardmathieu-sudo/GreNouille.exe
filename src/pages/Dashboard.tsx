import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Shield, Activity, Users, Zap, Plus, X, Music, Cloud, MessageSquare,
  StickyNote, Link2, RefreshCw, FileDown, Check, Clock, Bot, Cpu,
  SkipBack, SkipForward, Play, Pause, AlertTriangle, Lock, Eye,
  ChevronRight, Star, Send, Trophy,
} from "lucide-react";
import axios from "axios";

const ALL_WIDGETS = [
  { id: "spotify", label: "Spotify", icon: Music, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "weather", label: "Météo", icon: Cloud, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "discord", label: "Discord", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { id: "notes", label: "Notes rapides", icon: StickyNote, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "links", label: "Liens rapides", icon: Link2, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { id: "nexusai", label: "NEXUS AI", icon: Bot, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { id: "system", label: "Système", icon: Cpu, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "security", label: "Sécurité", icon: Shield, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
];

const WIDGET_LINKS: Record<string, string> = {
  spotify: "/spotify",
  discord: "/discord",
  nexusai: "/ai",
};

const WIDGET_STORAGE_KEY = "nexus-active-widgets";
const NOTE_WIDGET_KEY = "nexus-widget-note";
const LINKS_WIDGET_KEY = "nexus-widget-links";

function useScrollingText(text: string, speed = 40) {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setOffset(0);
    lastRef.current = 0;
    let textW = 0;
    let containerW = 0;

    const animate = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const delta = (now - lastRef.current) / 1000;
      lastRef.current = now;
      textW = textRef.current?.offsetWidth || 0;
      containerW = containerRef.current?.offsetWidth || 0;
      if (textW > containerW) {
        setOffset((prev) => {
          const next = prev + speed * delta;
          return next > textW + 40 ? 0 : next;
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, speed]);

  return { offset, containerRef, textRef };
}

function ScrollingText({ text, className = "" }: { text: string; className?: string }) {
  const { offset, containerRef, textRef } = useScrollingText(text);
  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <span ref={textRef} className="inline-block" style={{ transform: `translateX(-${offset}px)` }}>
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </span>
    </div>
  );
}

function SpotifyWidget() {
  const [track, setTrack] = useState<any>(null);
  const [progressMs, setProgressMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCurrent = useCallback(() => {
    axios.get("/api/spotify/player/current")
      .then((r) => {
        if (r.data?.item) {
          setTrack(r.data.item);
          setProgressMs(r.data.progress_ms || 0);
          setIsPlaying(r.data.is_playing || false);
        } else {
          setTrack(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCurrent();
    const poll = setInterval(fetchCurrent, 5000);
    return () => clearInterval(poll);
  }, [fetchCurrent]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (isPlaying) {
      tickRef.current = setInterval(() => setProgressMs((p) => p + 1000), 1000);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isPlaying, track?.id]);

  const control = async (action: string) => {
    try {
      if (action === "play" || action === "pause") {
        await axios.post(`/api/spotify/${action}`);
        setIsPlaying(action === "play");
      } else {
        await axios.post(`/api/spotify/${action}`);
        setTimeout(fetchCurrent, 600);
      }
    } catch {}
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement...</p>;
  if (!track) return <p className="text-sm text-gray-500">Aucune lecture en cours</p>;

  const pct = track.duration_ms ? Math.min(100, (progressMs / track.duration_ms) * 100) : 0;
  const trackName = `${track.name} — ${track.artists?.map((a: any) => a.name).join(", ")}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {track.album?.images?.[0]?.url && (
          <div className="relative shrink-0">
            <img
              src={track.album.images[0].url}
              alt="Album"
              className="h-16 w-16 rounded-xl shadow-lg shadow-emerald-500/20"
            />
            {isPlaying && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/50 animate-pulse" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <ScrollingText text={trackName} className="font-semibold text-white text-sm" />
          <p className="text-xs text-gray-500 mt-0.5 truncate">{track.album?.name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden cursor-pointer">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>{fmt(progressMs)}</span>
          <span>{fmt(track.duration_ms)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => control("previous")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={() => control(isPlaying ? "pause" : "play")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400 transition-all active:scale-90 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button
          onClick={() => control("next")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NexusAIWidget() {
  const [sessions, setSessions] = useState<number | null>(null);
  useEffect(() => {
    axios.get("/api/database/stats").then((r) => setSessions(r.data.aiSessions ?? null)).catch(() => {});
  }, []);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
        <Bot className="h-6 w-6 text-violet-400" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-sm">NEXUS AI</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {sessions !== null ? `${sessions} session${sessions !== 1 ? "s" : ""}` : "Assistant prêt"}
        </p>
        <div className="mt-1.5 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-1 w-4 rounded-full bg-violet-500/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-violet-400"
                animate={{ width: ["0%", "100%", "0%"] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemWidget() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetch = () => {
      axios.get("/api/security/stats").then((r) => setStats(r.data)).catch(() => {});
    };
    fetch();
    const i = setInterval(fetch, 15000);
    return () => clearInterval(i);
  }, []);

  if (!stats) return <p className="text-sm text-gray-500">Chargement...</p>;

  const Bar = ({ pct, color }: { pct: number; color: string }) => (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-500 uppercase tracking-wider">CPU</span>
          <span className="text-white font-bold">{stats.system?.cpuPercent ?? 0}%</span>
        </div>
        <Bar pct={stats.system?.cpuPercent ?? 0} color="bg-orange-400" />
      </div>
      <div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-500 uppercase tracking-wider">RAM</span>
          <span className="text-white font-bold">{stats.system?.memPercent ?? 0}%</span>
        </div>
        <Bar pct={stats.system?.memPercent ?? 0} color="bg-blue-400" />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 pt-1">
        <span>{stats.system?.usedMemGb ?? "?"}GB / {stats.system?.totalMemGb ?? "?"}GB</span>
        <span className="text-emerald-400">● En ligne</span>
      </div>
    </div>
  );
}

function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState("...");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!navigator.geolocation) { setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const [meteo, geo] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=kmh`).then((r) => r.json()),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).then((r) => r.json()),
          ]);
          setWeather(meteo.current);
          setCity(geo.address?.city || geo.address?.town || geo.address?.village || "Votre ville");
        } catch { setLoading(false); }
        finally { setLoading(false); }
      },
      () => setLoading(false)
    );
  }, []);

  const getIcon = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 49) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 99) return "⛈️";
    return "🌤️";
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement...</p>;
  if (!weather) return <p className="text-sm text-gray-500">Activez la géolocalisation</p>;
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-black text-white">{Math.round(weather.temperature_2m)}°C</p>
        <p className="text-sm text-gray-400 mt-0.5">{city}</p>
        <p className="text-xs text-gray-500 mt-1">Vent : {Math.round(weather.windspeed_10m)} km/h</p>
      </div>
      <span className="text-5xl">{getIcon(weather.weathercode)}</span>
    </div>
  );
}

function DiscordWidget() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    axios.get("/api/auth/discord/status").then((r) => setConfigured(r.data.configured)).catch(() => setConfigured(false));
  }, []);
  if (configured === null) return <p className="text-sm text-gray-500">Vérification...</p>;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${configured ? "bg-indigo-500/20" : "bg-red-500/10"}`}>
        <MessageSquare className={`h-6 w-6 ${configured ? "text-indigo-400" : "text-red-400"}`} />
      </div>
      <div>
        <p className={`font-semibold text-sm ${configured ? "text-indigo-300" : "text-red-400"}`}>{configured ? "Bot connecté" : "Non configuré"}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {configured ? "Discord bot actif" : "Ajoutez DISCORD_BOT_TOKEN"}
        </p>
      </div>
    </div>
  );
}

function NotesWidget() {
  const [note, setNote] = useState(() => localStorage.getItem(NOTE_WIDGET_KEY) || "");
  const save = useCallback((v: string) => { setNote(v); localStorage.setItem(NOTE_WIDGET_KEY, v); }, []);
  return (
    <textarea
      value={note}
      onChange={(e) => save(e.target.value)}
      placeholder="Écrivez ici..."
      className="w-full h-24 resize-none bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none leading-relaxed"
    />
  );
}

function LinksWidget() {
  const [links, setLinks] = useState<{ label: string; url: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(LINKS_WIDGET_KEY) || "[]"); } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const save = (items: typeof links) => { setLinks(items); localStorage.setItem(LINKS_WIDGET_KEY, JSON.stringify(items)); };
  const add = () => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!u.startsWith("http")) u = "https://" + u;
    save([...links, { label: label.trim() || u, url: u }]);
    setLabel(""); setUrl(""); setAdding(false);
  };
  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-400 hover:text-blue-300 truncate transition-colors">{l.label}</a>
          <button onClick={() => save(links.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-1.5">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nom du lien" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500" onKeyDown={(e) => e.key === "Enter" && add()} />
          <div className="flex gap-1.5">
            <button onClick={add} className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-500">Ajouter</button>
            <button onClick={() => setAdding(false)} className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-medium text-white hover:bg-white/20">Annuler</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Ajouter un lien
        </button>
      )}
    </div>
  );
}

function SecurityWidget() {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [evRes, stRes] = await Promise.all([
          axios.get("/api/security/events?limit=5"),
          axios.get("/api/security/stats"),
        ]);
        setEvents(evRes.data.events || []);
        setStats(stRes.data);
      } catch {}
    };
    fetch();
    const i = setInterval(fetch, 15000);
    return () => clearInterval(i);
  }, []);

  const levelColor = stats?.threatLevel === "ÉLEVÉ"
    ? "text-red-400" : stats?.threatLevel === "MOYEN"
    ? "text-yellow-400" : "text-emerald-400";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-red-400" />
          <span className="text-sm font-semibold text-white">Surveillance active</span>
        </div>
        <span className={`text-xs font-bold ${levelColor}`}>{stats?.threatLevel || "FAIBLE"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-black/30 p-2 text-center">
          <p className="text-lg font-black text-white">{stats?.todayCount || 0}</p>
          <p className="text-[10px] text-gray-500">Événements aujourd'hui</p>
        </div>
        <div className="rounded-lg bg-black/30 p-2 text-center">
          <p className="text-lg font-black text-yellow-400">{stats?.warnings || 0}</p>
          <p className="text-[10px] text-gray-500">Alertes</p>
        </div>
      </div>
      <div className="space-y-1">
        {events.slice(0, 3).map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${e.severity === "warning" ? "bg-yellow-400" : e.severity === "critical" ? "bg-red-400" : "bg-blue-400"}`} />
            <span className="text-gray-400 truncate">{e.message}</span>
          </div>
        ))}
        {events.length === 0 && <p className="text-xs text-gray-600">Aucun événement récent</p>}
      </div>
    </div>
  );
}

function WidgetContent({ id }: { id: string }) {
  if (id === "spotify") return <SpotifyWidget />;
  if (id === "weather") return <WeatherWidget />;
  if (id === "discord") return <DiscordWidget />;
  if (id === "notes") return <NotesWidget />;
  if (id === "links") return <LinksWidget />;
  if (id === "nexusai") return <NexusAIWidget />;
  if (id === "system") return <SystemWidget />;
  if (id === "security") return <SecurityWidget />;
  return null;
}

const SWIPE_THRESHOLD = 90;

function SwipeableWidget({ wid, w, onRemove, onNavigate }: {
  wid: string;
  w: typeof ALL_WIDGETS[number];
  onRemove: (id: string) => void;
  onNavigate: (path: string) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [removing, setRemoving] = useState(false);
  const isPastThreshold = dragX > SWIPE_THRESHOLD;

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 400) {
      setRemoving(true);
      setTimeout(() => onRemove(wid), 250);
    } else {
      setDragX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className={`absolute inset-y-0 left-0 flex items-center justify-end pr-6 rounded-xl transition-opacity duration-150 ${isPastThreshold ? "opacity-100" : "opacity-0"}`}
        style={{ width: `${Math.min(dragX, 160)}px`, background: "linear-gradient(to right, rgba(239,68,68,0.0), rgba(239,68,68,0.35))" }}
      >
        <div className="flex flex-col items-center gap-1">
          <X className="h-5 w-5 text-red-400" />
          <span className="text-[10px] text-red-400 font-semibold">Supprimer</span>
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 160 }}
        dragElastic={0.15}
        onDrag={(_: any, info: { offset: { x: number } }) => setDragX(Math.max(0, info.offset.x))}
        onDragEnd={handleDragEnd}
        animate={removing ? { x: 200, opacity: 0 } : {}}
        transition={removing ? { duration: 0.2 } : { type: "spring", stiffness: 400, damping: 35 }}
        style={{ x: 0 }}
        className={`relative border ${w.border} ${w.bg} p-4 group rounded-xl cursor-grab active:cursor-grabbing touch-pan-y`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${w.color} ${WIDGET_LINKS[wid] ? "hover:opacity-80 transition-opacity cursor-pointer" : ""}`}
            onClick={() => WIDGET_LINKS[wid] && onNavigate(WIDGET_LINKS[wid])}
          >
            <w.icon className="h-4 w-4" />
            {w.label}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(wid); }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-500/20 active:scale-90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <WidgetContent id={wid} />
      </motion.div>
    </div>
  );
}

function DailyChallengeWidget({ userEmail }: { userEmail?: string }) {
  const [challenge, setChallenge] = useState<any>(null);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const email = userEmail || "";

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          axios.get("/api/challenge/today"),
          email ? axios.get(`/api/challenge/score?email=${encodeURIComponent(email)}`) : Promise.resolve(null),
        ]);
        setChallenge(cRes.data);
        if (sRes) setScore(sRes.data);

        const todayKey = `nexus-challenge-${cRes.data.date}`;
        const cached = localStorage.getItem(todayKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setResult(parsed);
          setAlreadyAnswered(true);
        }
      } catch {}
    };
    load();
  }, [email]);

  const submit = async () => {
    if (!answer.trim() || !email || submitting) return;
    setSubmitting(true);
    try {
      const res = await axios.post("/api/challenge/answer", { email, answer });
      setResult({ correct: res.data.correct, correctAnswer: res.data.correctAnswer });
      setAlreadyAnswered(res.data.alreadyAnswered || true);
      setScore(res.data.score);
      const todayKey = `nexus-challenge-${challenge?.date}`;
      localStorage.setItem(todayKey, JSON.stringify({ correct: res.data.correct, correctAnswer: res.data.correctAnswer }));
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const catColor: Record<string, string> = {
    Anime: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    Film: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    Littérature: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    Poème: "text-pink-400 border-pink-500/30 bg-pink-500/10",
    Citation: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    Philosophe: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Défi du Jour</h2>
        </div>
        {score && (
          <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{score.correct}/{score.total}</span>
          </div>
        )}
      </div>

      {!challenge ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-yellow-400 text-lg leading-none">"</span>
            <div className="flex-1 min-w-0">
              <ScrollingText
                text={challenge.quote}
                className="text-sm font-medium text-gray-200 italic"
              />
            </div>
            <span className="mt-auto text-yellow-400 text-lg leading-none">"</span>
          </div>

          {challenge.category && (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${catColor[challenge.category] || "text-gray-400 border-gray-500/30 bg-gray-500/10"}`}>
              {challenge.category}
            </span>
          )}

          {alreadyAnswered && result ? (
            <div className={`rounded-xl border p-3 ${result.correct ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
              <div className="flex items-center gap-2 mb-1">
                {result.correct
                  ? <Check className="h-4 w-4 text-emerald-400" />
                  : <X className="h-4 w-4 text-red-400" />}
                <span className={`text-sm font-bold ${result.correct ? "text-emerald-400" : "text-red-400"}`}>
                  {result.correct ? "+1 point !" : "Raté !"}
                </span>
              </div>
              <p className="text-xs text-gray-400">Réponse : <span className="text-white font-semibold">{result.correctAnswer}</span></p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={email ? "Qui a dit ça ?" : "Connectez votre email pour jouer"}
                disabled={!email || submitting}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-yellow-500/50 transition-colors disabled:opacity-40"
              />
              <button
                onClick={submit}
                disabled={!answer.trim() || !email || submitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
          {!email && (
            <p className="text-xs text-gray-600">Votre email doit être enregistré dans le profil pour sauvegarder le score.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return (
    <div className="flex flex-col items-end">
      <p className="text-2xl font-black text-white tabular-nums tracking-tight">
        {now.getHours().toString().padStart(2, "0")}:{now.getMinutes().toString().padStart(2, "0")}
        <span className="text-base text-gray-500 ml-1">:{now.getSeconds().toString().padStart(2, "0")}</span>
      </p>
      <p className="text-xs text-gray-400">{days[now.getDay()]} {now.getDate()} {months[now.getMonth()]}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState({ users: 0 });
  const [sysStats, setSysStats] = useState<any>(null);
  const [actionStatus, setActionStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WIDGET_STORAGE_KEY) || '["spotify","weather","security"]'); } catch { return ["spotify", "weather", "security"]; }
  });

  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        if (konamiIndex === konamiCode.length - 1) {
          setEasterEggActive(true); setKonamiIndex(0); setTimeout(() => setEasterEggActive(false), 5000);
        } else { setKonamiIndex((prev) => prev + 1); }
      } else { setKonamiIndex(0); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, statsRes, sysRes] = await Promise.all([
          axios.get("/api/logs"),
          axios.get("/api/database/stats"),
          axios.get("/api/security/stats"),
        ]);
        setRecentLogs(logsRes.data.slice(0, 4));
        setDbStats(statsRes.data);
        setSysStats(sysRes.data);
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const saveWidgets = (w: string[]) => { setActiveWidgets(w); localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(w)); };
  const addWidget = (id: string) => { if (!activeWidgets.includes(id)) saveWidgets([...activeWidgets, id]); setShowAddWidget(false); };
  const removeWidget = (id: string) => saveWidgets(activeWidgets.filter((w) => w !== id));
  const inactiveWidgets = ALL_WIDGETS.filter((w) => !activeWidgets.includes(w.id));

  const showAction = (msg: string, ok: boolean) => {
    setActionStatus({ msg, ok });
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleRestartServices = async () => {
    try {
      await axios.get("/api/health");
      showAction("Services vérifiés avec succès !", true);
    } catch { showAction("Erreur lors de la vérification.", false); }
  };

  const handleGenerateReport = () => {
    const report = {
      generated: new Date().toISOString(),
      user: user?.username,
      stats: dbStats,
      system: sysStats?.system,
      security: { threatLevel: sysStats?.threatLevel, warnings: sysStats?.warnings },
      recentActivity: recentLogs.slice(0, 5),
      activeWidgets,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexus-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    showAction("Rapport généré et téléchargé !", true);
  };

  const threatColor = sysStats?.threatLevel === "ÉLEVÉ" ? "text-red-400"
    : sysStats?.threatLevel === "MOYEN" ? "text-yellow-400" : "text-emerald-400";

  const stats = [
    { label: "Statut Système", value: "En ligne", icon: Activity, color: "text-emerald-400", glow: "rgba(52,211,153,0.3)" },
    {
      label: "Sécurité",
      value: sysStats?.threatLevel || "FAIBLE",
      icon: Shield,
      color: sysStats?.threatLevel === "ÉLEVÉ" ? "text-red-400" : sysStats?.threatLevel === "MOYEN" ? "text-yellow-400" : "text-blue-400",
      glow: "rgba(96,165,250,0.3)"
    },
    { label: "Utilisateurs", value: dbStats.users.toString(), icon: Users, color: "text-purple-400", glow: "rgba(167,139,250,0.3)" },
    {
      label: "CPU / RAM",
      value: sysStats ? `${sysStats.system?.cpuPercent ?? 0}% / ${sysStats.system?.memPercent ?? 0}%` : "...",
      icon: Cpu,
      color: "text-orange-400",
      glow: "rgba(251,146,60,0.3)"
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-8">
      <AnimatePresence>
        {easterEggActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360], filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-center px-4"
            >
              HACKER MODE ACTIVATED
            </motion.div>
          </motion.div>
        )}
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${actionStatus.ok ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-red-500/30 bg-red-500/20 text-red-300"}`}
          >
            {actionStatus.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {actionStatus.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-8 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Bon retour,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#00FF00] to-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
              {user?.username}
            </span>
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            <span className={`font-semibold ${threatColor}`}>
              {sysStats?.todayCount ?? 0} événements
            </span>{" "}
            détectés aujourd'hui · Panel v1.3
          </p>
        </div>
        <LiveClock />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md transition-all hover:bg-white/10"
            style={{ boxShadow: `0 0 0 transparent` }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 25px ${stat.glow}`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 0 transparent`)}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">{stat.label}</p>
                <p className="mt-1 text-xl md:text-2xl font-black text-white truncate">{stat.value}</p>
              </div>
              <div className={`rounded-xl bg-white/5 p-2.5 ${stat.color} shrink-0`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <DailyChallengeWidget userEmail={user?.email} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Mes Widgets</h2>
            <button
              onClick={() => setShowAddWidget(!showAddWidget)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${showAddWidget ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20" : "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"}`}
            >
              {showAddWidget ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showAddWidget && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-gray-400 mb-3">Ajouter un widget :</p>
                  {inactiveWidgets.length === 0 ? (
                    <p className="text-sm text-gray-600">Tous les widgets sont déjà ajoutés.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {inactiveWidgets.map((w) => (
                        <button
                          key={w.id} onClick={() => addWidget(w.id)}
                          className={`flex items-center gap-2 rounded-full border ${w.border} ${w.bg} px-3 py-1.5 text-sm font-medium ${w.color} hover:opacity-80 transition-opacity`}
                        >
                          <w.icon className="h-4 w-4" />
                          {w.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeWidgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-10 w-10 text-gray-700 mb-3" />
              <p className="text-gray-500">Aucun widget actif</p>
              <p className="text-sm text-gray-600 mt-1">Cliquez sur + pour en ajouter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeWidgets.map((wid) => {
                const w = ALL_WIDGETS.find((x) => x.id === wid);
                if (!w) return null;
                return (
                  <SwipeableWidget key={wid} wid={wid} w={w} onRemove={removeWidget} onNavigate={(path) => navigate(path)} />
                );
              })}
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Activité Récente</h2>
              <Lock className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex flex-col gap-3">
              {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${log.type === "warning" ? "bg-yellow-400" : log.type === "success" ? "bg-emerald-400" : log.type === "error" ? "bg-red-400" : "bg-blue-400"}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 truncate">{log.message}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(log.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">Aucune activité récente</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
          >
            <h2 className="text-base font-semibold text-white mb-4">Alertes Sécurité</h2>
            <div className="space-y-2">
              {sysStats?.warnings > 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
                  <p className="text-xs text-yellow-300">{sysStats.warnings} alerte(s) détectée(s)</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-300">Aucune alerte — Système sécurisé</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
          >
            <h2 className="text-base font-semibold text-white mb-4">Actions Rapides</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGenerateReport}
                className="w-full rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/30 px-4 py-3 text-sm font-medium text-[#39FF14] transition-all hover:bg-[#39FF14]/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center gap-2"
              >
                <FileDown className="h-4 w-4 shrink-0" />
                Générer un rapport
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>
              <button
                onClick={handleRestartServices}
                className="w-full rounded-xl bg-teal-600/20 border border-teal-500/30 px-4 py-3 text-sm font-medium text-teal-400 transition-all hover:bg-teal-600/30 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                Vérifier les services
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
