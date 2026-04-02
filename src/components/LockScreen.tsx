import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getThemeColor, getLogoStyle, getLetterStyle, getContainerShape, type LogoColor } from "../lib/theme";

interface LockScreenProps {
  onUnlock: () => void;
  onLogout: () => void;
}

function useTheme() {
  const [color, setColor] = useState<LogoColor>(getThemeColor);
  const [style, setStyle] = useState(getLogoStyle);
  useEffect(() => {
    const onColor = () => setColor(getThemeColor());
    const onStyle = () => setStyle(getLogoStyle());
    window.addEventListener("nexus-logo-color-change", onColor);
    window.addEventListener("nexus-logo-style-change", onStyle);
    return () => {
      window.removeEventListener("nexus-logo-color-change", onColor);
      window.removeEventListener("nexus-logo-style-change", onStyle);
    };
  }, []);
  return { color, style };
}

export default function LockScreen({ onUnlock, onLogout }: LockScreenProps) {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [time, setTime]         = useState(new Date());
  const [shake, setShake]       = useState(false);
  const { color, style } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/verify-password", { password });
      setPassword("");
      onUnlock();
    } catch (err: any) {
      const msg = err.response?.data?.error || "";
      if (msg === "Incorrect password") {
        setError("Mot de passe incorrect");
      } else if (msg.includes("No password set") || msg.includes("no password")) {
        setError("Aucun mot de passe défini. Définissez-en un dans votre profil.");
      } else {
        setError("Erreur de vérification");
      }
      setPassword("");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = (user as any)?.avatarUrl;
  const initial   = user?.username?.[0]?.toUpperCase();

  const hours   = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const letterCSS  = getLetterStyle(color, style);
  const shapeClass = getContainerShape(style);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: "#02020a",
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -10%, ${color.bg.replace("0.22", "0.2").replace("0.18", "0.17")}, transparent), radial-gradient(ellipse 60% 80% at 80% 80%, ${color.bg.replace("0.22", "0.09").replace("0.18", "0.07")}, transparent)`,
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              background: color.hex,
              opacity: 0.03 + i * 0.005,
              width: 200 + i * 80,
              height: 200 + i * 80,
              left: `${[10, 80, 50, 20, 70, 40][i]}%`,
              top: `${[20, 10, 70, 80, 50, 30][i]}%`,
              transform: "translate(-50%, -50%)",
              filter: "blur(60px)",
            }}
          />
        ))}
      </div>

      {/* Clock */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 20 }}
        className="mb-14 text-center"
      >
        <p
          className="text-8xl font-thin tabular-nums tracking-widest text-white"
          style={{ textShadow: `0 0 40px ${color.glow.replace("0.5", "0.45")}` }}
        >
          {hours}
        </p>
        <p className="mt-3 text-sm font-light capitalize tracking-widest text-gray-500">{dateStr}</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center"
      >
        {/* Avatar */}
        <div
          className="mb-4 h-20 w-20 overflow-hidden rounded-full border border-white/10"
          style={{ boxShadow: `0 0 40px ${color.glow.replace("0.5", "0.28")}, 0 0 80px ${color.glow.replace("0.5", "0.1")}` }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hex}99 100%)` }}
            >
              <span className="text-3xl font-bold text-white">{initial}</span>
            </div>
          )}
        </div>

        <p className="text-xl font-semibold text-white">{user?.username}</p>
        <p className="mt-1 text-sm text-gray-500">{user?.email}</p>

        {/* Form */}
        <form onSubmit={handleUnlock} className="mt-8 w-80">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              autoFocus
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-12 text-center text-white placeholder-gray-600 backdrop-blur-xl outline-none transition-all"
              onFocus={e => { e.currentTarget.style.borderColor = color.border; e.currentTarget.style.boxShadow = `0 0 0 1px ${color.bg}, inset 0 0 0 1px ${color.bg}`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </motion.div>

          <button
            type="submit"
            disabled={loading || !password}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hex}cc 100%)`,
              boxShadow: `0 0 24px ${color.glow.replace("0.5", "0.3")}, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
            {loading ? "Vérification..." : "Déverrouiller"}
          </button>
        </form>

        {/* Nexus logo indicator */}
        <div className="mt-6 flex items-center gap-2 opacity-40">
          <div
            className={`h-5 w-5 ${shapeClass} flex items-center justify-center`}
            style={{ background: color.bg, border: `1px solid ${color.border}` }}
          >
            <span style={{ ...letterCSS, fontSize: 10 }} className="leading-none select-none">N</span>
          </div>
          <span className="text-xs text-gray-600 tracking-widest uppercase">Nexus Panel</span>
        </div>

        <button
          onClick={onLogout}
          className="mt-4 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-400"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </motion.div>
    </motion.div>
  );
}
