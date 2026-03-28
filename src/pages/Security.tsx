import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Key, Lock, AlertTriangle } from "lucide-react";
import axios from "axios";

export default function Security() {
  const [user, setUser] = useState<any>(null);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      try {
        const [userRes, sessionsRes] = await Promise.all([
          axios.get("/api/auth/me"),
          axios.get("/api/auth/sessions")
        ]);
        setUser(userRes.data.user);
        setSessions(sessionsRes.data.sessions);
      } catch (error) {
        console.error("Failed to fetch user or sessions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSessions();
  }, []);

  const handleEnable2FA = async () => {
    try {
      await axios.post("/api/auth/2fa/setup");
      setUser({ ...user, twoFactorEnabled: 1 });
      setIsSettingUp2FA(false);
      alert("2FA enabled successfully!");
    } catch (error) {
      console.error("Failed to enable 2FA", error);
      alert("Failed to enable 2FA");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await axios.post("/api/auth/2fa/disable");
      setUser({ ...user, twoFactorEnabled: 0 });
      alert("2FA disabled successfully!");
    } catch (error) {
      console.error("Failed to disable 2FA", error);
      alert("Failed to disable 2FA");
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await axios.post(`/api/auth/sessions/${sessionId}/revoke`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      alert("Session revoked successfully!");
    } catch (error) {
      console.error("Failed to revoke session", error);
      alert("Failed to revoke session");
    }
  };

  if (loading) return <div className="flex-1 p-8 text-white">Loading...</div>;

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Security Center</h1>
        <p className="text-gray-400">Manage your account security and authentication settings</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
          </div>
          
          <p className="mb-6 text-sm text-gray-400">
            Add an extra layer of security to your account by enabling two-factor authentication via Email.
          </p>

          {!user?.twoFactorEnabled && !isSettingUp2FA && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
              <div>
                <p className="font-medium text-white">Email 2FA</p>
                <p className="text-xs text-gray-500">Receive codes via email</p>
              </div>
              <button 
                onClick={() => setIsSettingUp2FA(true)}
                className="rounded-lg bg-[#39FF14]/20 px-4 py-2 text-sm font-medium text-[#39FF14] transition-colors hover:bg-[#39FF14]/30"
              >
                Setup
              </button>
            </div>
          )}

          {isSettingUp2FA && (
            <div className="mb-6 rounded-xl border border-white/5 bg-black/40 p-4">
              <p className="mb-4 text-sm text-gray-300">
                Are you sure you want to enable Email 2FA? Codes will be sent to <strong>{user?.email}</strong>.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleEnable2FA}
                  className="flex-1 rounded-lg bg-[#39FF14]/20 px-4 py-2 text-sm font-medium text-[#39FF14] transition-colors hover:bg-[#39FF14]/30"
                >
                  Enable
                </button>
                <button 
                  onClick={() => setIsSettingUp2FA(false)}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {user?.twoFactorEnabled && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 p-4">
              <div>
                <p className="font-medium text-[#39FF14]">Email 2FA Enabled</p>
                <p className="text-xs text-[#39FF14]/70">Codes sent to {user?.email}</p>
              </div>
              <button 
                onClick={handleDisable2FA}
                className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
              >
                Disable
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]">
              <Key className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Password Management</h2>
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Current Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">New Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95"
            >
              Update Password
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
          </div>

          <div className="space-y-4">
            {sessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white max-w-[200px] md:max-w-md truncate">{session.device}</p>
                    <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                  </div>
                </div>
                {session.current ? (
                  <span className="rounded-full bg-[#39FF14]/20 px-3 py-1 text-xs font-medium text-[#39FF14]">
                    Current Device
                  </span>
                ) : (
                  <button 
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
