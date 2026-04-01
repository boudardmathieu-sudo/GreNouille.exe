import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface LockScreenProps {
  onUnlock: () => void;
  onLogout: () => void;
}

export default function LockScreen({ onUnlock, onLogout }: LockScreenProps) {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [time, setTime] = useState(new Date());
  const [shake, setShake] = useState(false);

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
  const initial = user?.username?.[0]?.toUpperCase();

  const hours = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: "#02020a",
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,110,247,0.15), transparent), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(124,58,237,0.08), transparent)",
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-[0.04] bg-indigo-400"
            style={{
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
        <p className="text-8xl font-thin tabular-nums tracking-widest text-white drop-shadow-[0_0_40px_rgba(79,110,247,0.4)]">
          {hours}
        </p>
        <p className="mt-3 text-sm font-light capitalize tracking-widest text-gray-500">{date}</p>
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
          style={{ boxShadow: "0 0 40px rgba(79,110,247,0.25), 0 0 80px rgba(79,110,247,0.1)" }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-12 text-center text-white placeholder-gray-600 backdrop-blur-xl outline-none transition-all focus:border-indigo-500/40 focus:bg-white/8 focus:ring-1 focus:ring-indigo-500/25"
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
              background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 100%)",
              boxShadow: "0 0 24px rgba(79,110,247,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
            {loading ? "Vérification..." : "Déverrouiller"}
          </button>
        </form>

        <button
          onClick={onLogout}
          className="mt-6 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-400"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </motion.div>
    </motion.div>
  );
}
