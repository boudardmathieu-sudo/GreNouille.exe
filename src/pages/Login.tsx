import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Leaf, Shield } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (requires2FA) {
        await axios.post("/api/auth/verify-2fa", { tempToken, code });
        await checkAuth();
        navigate("/dashboard");
      } else {
        const res = await axios.post("/api/auth/login", { email, password });
        if (res.data.requires2FA) {
          setRequires2FA(true);
          setTempToken(res.data.tempToken);
        } else {
          await checkAuth();
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(57,255,20,0.15),rgba(255,255,255,0))]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(57,255,20,0.1)] backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
            <Leaf className="h-8 w-8 text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,1)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-400">
            {requires2FA ? "Enter your 2FA code to continue" : "Enter your credentials to access the panel"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {!requires2FA ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
                  placeholder="admin@nexus.com"
                  required
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#39FF14] hover:text-[#00FF00]">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Authentication Code
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14] tracking-widest"
                  placeholder="123456"
                  required
                  maxLength={6}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                We've sent a 6-digit code to your email account.
              </p>
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95"
          >
            {requires2FA ? "Verify Code" : "Sign In"}
          </button>
        </form>

        {!requires2FA && (
          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-[#39FF14] hover:text-[#00FF00]">
              Sign up
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
