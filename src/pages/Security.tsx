import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Key, Lock, Monitor, Check, X, Loader2,
  Eye, EyeOff, AlertTriangle, Smartphone, Globe, RefreshCw,
  ShieldCheck, ShieldOff, Clock, Trash2,
} from "lucide-react";
import axios from "axios";

function parseDevice(ua: string) {
  if (!ua) return { name: "Appareil inconnu", icon: Monitor };
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) return { name: "Mobile", icon: Smartphone };
  if (lower.includes("chrome")) return { name: `Chrome · ${ua.match(/Windows|Mac|Linux/)?.[0] || "PC"}`, icon: Monitor };
  if (lower.includes("firefox")) return { name: `Firefox · ${ua.match(/Windows|Mac|Linux/)?.[0] || "PC"}`, icon: Monitor };
  if (lower.includes("safari")) return { name: `Safari · Mac`, icon: Monitor };
  return { name: ua.slice(0, 40), icon: Monitor };
}

export default function Security() {
  const [user, setUser] = useState<any>(null);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [userRes, sessionsRes] = await Promise.all([
        axios.get("/api/auth/me"),
        axios.get("/api/auth/sessions"),
      ]);
      setUser(userRes.data.user);
      setSessions(sessionsRes.data.sessions || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEnable2FA = async () => {
    try {
      await axios.post("/api/auth/2fa/setup");
      setUser({ ...user, twoFactorEnabled: 1 });
      setIsSettingUp2FA(false);
      showToast("2FA activé avec succès !");
    } catch {
      showToast("Impossible d'activer la 2FA", false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await axios.post("/api/auth/2fa/disable");
      setUser({ ...user, twoFactorEnabled: 0 });
      showToast("2FA désactivé.");
    } catch {
      showToast("Impossible de désactiver la 2FA", false);
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await axios.post(`/api/auth/sessions/${sessionId}/revoke`);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      showToast("Session révoquée.");
    } catch {
      showToast("Impossible de révoquer la session", false);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await Promise.all(sessions.map((s) => axios.post(`/api/auth/sessions/${s.id}/revoke`)));
      setSessions([]);
      showToast("Toutes les sessions révoquées.");
    } catch {
      showToast("Erreur lors de la révocation", false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) { showToast("Les mots de passe ne correspondent pas", false); return; }
    if (newPassword.length < 8) { showToast("Le mot de passe doit contenir au moins 8 caractères", false); return; }
    setSavingPwd(true);
    try {
      await axios.patch("/api/auth/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showToast("Mot de passe mis à jour !");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur lors de la mise à jour", false);
    } finally {
      setSavingPwd(false);
    }
  };

  // Security score
  const securityScore = (() => {
    let score = 0;
    if (user?.twoFactorEnabled) score += 40;
    if (user?.discordId) score += 20;
    if (sessions.length < 5) score += 20;
    score += 20; // base score for having an account
    return score;
  })();

  const scoreColor = securityScore >= 80 ? "#39FF14" : securityScore >= 50 ? "#FAA61A" : "#ED4245";

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 p-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${toast.ok ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-red-500/30 bg-red-500/20 text-red-300"}`}
          >
            {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Centre de Sécurité</h1>
        <p className="text-gray-400">Gérez la sécurité et l'authentification de votre compte</p>
      </div>

      {/* Security score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: `${scoreColor}20` }}>
              <Shield className="h-6 w-6" style={{ color: scoreColor }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Score de sécurité</h2>
              <p className="text-xs text-gray-500">Basé sur vos paramètres de sécurité actifs</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: scoreColor }}>{securityScore}%</p>
            <p className="text-xs text-gray-500">{securityScore >= 80 ? "Excellent" : securityScore >= 50 ? "Moyen" : "Faible"}</p>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${securityScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: scoreColor, boxShadow: `0 0 10px ${scoreColor}60` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "2FA activé", done: !!user?.twoFactorEnabled, points: 40 },
            { label: "Discord lié", done: !!user?.discordId, points: 20 },
            { label: "Sessions normales", done: sessions.length < 5, points: 20 },
            { label: "Compte actif", done: true, points: 20 },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${item.done ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-gray-500"}`}>
              {item.done ? <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> : <ShieldOff className="h-3.5 w-3.5 shrink-0" />}
              <span>{item.label}</span>
              <span className="ml-auto font-bold">+{item.points}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 2FA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]"><Shield className="h-6 w-6" /></div>
            <h2 className="text-xl font-semibold text-white">Authentification à deux facteurs</h2>
          </div>
          <p className="mb-6 text-sm text-gray-400">
            Ajoutez une couche de sécurité supplémentaire à votre compte en activant la 2FA par email.
          </p>
          {!user?.twoFactorEnabled && !isSettingUp2FA && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
              <div>
                <p className="font-medium text-white">2FA par Email</p>
                <p className="text-xs text-gray-500">Codes de vérification par email</p>
              </div>
              <button onClick={() => setIsSettingUp2FA(true)}
                className="rounded-lg bg-[#39FF14]/20 px-4 py-2 text-sm font-medium text-[#39FF14] hover:bg-[#39FF14]/30 transition-colors">
                Configurer
              </button>
            </div>
          )}
          {isSettingUp2FA && (
            <div className="mb-4 rounded-xl border border-white/5 bg-black/40 p-4">
              <p className="mb-4 text-sm text-gray-300">
                Activer la 2FA par email ? Les codes seront envoyés à <strong className="text-white">{user?.email}</strong>.
              </p>
              <div className="flex gap-2">
                <button onClick={handleEnable2FA} className="flex-1 rounded-lg bg-[#39FF14]/20 px-4 py-2 text-sm font-medium text-[#39FF14] hover:bg-[#39FF14]/30 transition-colors">Activer</button>
                <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors">Annuler</button>
              </div>
            </div>
          )}
          {user?.twoFactorEnabled ? (
            <div className="flex items-center justify-between rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 p-4">
              <div>
                <p className="font-medium text-[#39FF14]">✓ 2FA par Email Activé</p>
                <p className="text-xs text-[#39FF14]/70">Codes envoyés à {user?.email}</p>
              </div>
              <button onClick={handleDisable2FA} className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors">
                Désactiver
              </button>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300/70">
              La 2FA par email est gérée par Supabase. Assurez-vous d'avoir configuré votre Supabase Auth correctement.
            </p>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]"><Key className="h-6 w-6" /></div>
            <h2 className="text-xl font-semibold text-white">Gestion du Mot de Passe</h2>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {[
              { label: "Mot de passe actuel", value: currentPassword, setter: setCurrentPassword },
              { label: "Nouveau mot de passe", value: newPassword, setter: setNewPassword },
              { label: "Confirmer le nouveau mot de passe", value: confirmPassword, setter: setConfirmPassword },
            ].map((field, i) => (
              <div key={i}>
                <label className="mb-2 block text-sm font-medium text-gray-300">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-10 text-white placeholder-gray-500 outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition-all"
                    placeholder="••••••••"
                  />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {newPassword && newPassword.length > 0 && (
              <div className="flex gap-1">
                {[6, 8, 12].map((len) => (
                  <div key={len} className={`h-1 flex-1 rounded-full ${newPassword.length >= len ? "bg-[#39FF14]" : "bg-white/10"} transition-colors`} />
                ))}
                <span className="ml-2 text-xs text-gray-500">
                  {newPassword.length < 6 ? "Trop court" : newPassword.length < 8 ? "Faible" : newPassword.length < 12 ? "Correct" : "Fort"}
                </span>
              </div>
            )}
            <button type="submit" disabled={savingPwd || !currentPassword || !newPassword || !confirmPassword}
              className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {savingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </button>
          </form>
        </motion.div>

        {/* Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]"><Lock className="h-6 w-6" /></div>
              <div>
                <h2 className="text-xl font-semibold text-white">Sessions Actives</h2>
                <p className="text-xs text-gray-500 mt-0.5">{sessions.length} session{sessions.length !== 1 ? "s" : ""} enregistrée{sessions.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchData} disabled={refreshing}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Actualiser
              </button>
              {sessions.length > 1 && (
                <button onClick={handleRevokeAll}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Révoquer tout
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Monitor className="h-12 w-12 text-gray-700 mb-3" />
                <p className="text-gray-500 font-medium">Aucune session active</p>
                <p className="text-xs text-gray-600 mt-1">Les sessions apparaîtront ici après connexion</p>
              </div>
            ) : (
              sessions.map((session, i) => {
                const device = parseDevice(session.device || "");
                const DeviceIcon = device.icon;
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <DeviceIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate max-w-[200px] md:max-w-sm">{device.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Globe className="h-3 w-3" /> {session.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" /> {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="shrink-0 rounded-full bg-[#39FF14]/20 px-3 py-1 text-xs font-medium text-[#39FF14]">Session actuelle</span>
                    ) : (
                      <button onClick={() => handleRevokeSession(session.id)}
                        className="shrink-0 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
