import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { getThemeColor, getLogoStyle, getLetterStyle, getContainerShape, type LogoColor } from "../lib/theme";

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

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { checkAuth } = useAuth();
  const lc = t.login;
  const { color, style } = useTheme();

  const letterCSS  = getLetterStyle(color, style);
  const shapeClass = getContainerShape(style);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      await checkAuth();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        background: "#05050f",
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -10%, ${color.bg.replace("0.22", "0.28").replace("0.18", "0.24")}, transparent)`,
      }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        style={{ boxShadow: `0 0 40px ${color.bg}, 0 0 80px ${color.bg.replace("0.22", "0.06").replace("0.18", "0.06")}` }}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center ${shapeClass}`}
            style={{
              background: `linear-gradient(145deg, ${color.bg} 0%, rgba(0,0,0,0.1) 100%)`,
              border: `1px solid ${color.border}`,
              boxShadow: `0 0 0 1px ${color.bg}, 0 0 30px ${color.glow.replace("0.5", "0.3")}, inset 0 1px 0 rgba(255,255,255,0.18)`,
            }}
          >
            <span className="text-3xl select-none leading-none" style={letterCSS}>N</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{lc.title}</h1>
          <p className="mt-2 text-sm text-gray-400">{lc.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">{lc.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:bg-white/8"
              style={{ "--tw-ring-color": color.hex } as React.CSSProperties}
              onFocus={e => { e.currentTarget.style.borderColor = color.border; e.currentTarget.style.boxShadow = `0 0 0 1px ${color.bg}`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
              placeholder="admin@nexus.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">{lc.password}</label>
              <Link to="/forgot-password" style={{ color: color.text }}
                className="text-xs transition-colors hover:opacity-80"
              >
                {lc.forgotPassword}
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:bg-white/8"
              onFocus={e => { e.currentTarget.style.borderColor = color.border; e.currentTarget.style.boxShadow = `0 0 0 1px ${color.bg}`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hex}cc 100%)`,
              boxShadow: `0 0 20px ${color.glow.replace("0.5", "0.35")}, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? lc.submitting : lc.submit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          {lc.noAccount}{" "}
          <Link to="/signup" style={{ color: color.text }} className="font-medium transition-colors hover:opacity-80">
            {lc.signUp}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
