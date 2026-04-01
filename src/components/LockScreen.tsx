import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
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

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password,
      });
      if (authErr) throw authErr;
      setPassword("");
      onUnlock();
    } catch {
      setError("Mot de passe incorrect");
      setPassword("");
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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "#02020a",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,110,247,0.15), transparent), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(124,58,237,0.08), transparent)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/[0.015]"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12 text-center"
      >
        <p className="text-7xl font-thin text-white tracking-wider tabular-nums">{hours}</p>
        <p className="mt-2 text-sm font-light text-gray-400 capitalize">{date}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 shadow-[0_0_40px_rgba(79,110,247,0.3)]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{initial}</span>
            </div>
          )}
        </div>
        <p className="text-xl font-semibold text-white">{user?.username}</p>
        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

        <form onSubmit={handleUnlock} className="mt-8 w-80">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              autoFocus
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-12 text-center text-white placeholder-gray-600 backdrop-blur-xl outline-none transition-all focus:border-indigo-500/50 focus:bg-white/8 focus:ring-1 focus:ring-indigo-500/30"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 100%)",
              boxShadow: "0 0 20px rgba(79,110,247,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
            {loading ? "Vérification..." : "Déverrouiller"}
          </button>
        </form>

        <button
          onClick={onLogout}
          className="mt-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </motion.div>
    </motion.div>
  );
}
