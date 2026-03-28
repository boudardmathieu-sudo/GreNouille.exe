import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { Leaf, Lock } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setStatus("loading");
    try {
      const res = await axios.post("/api/auth/reset-password", { token, newPassword: password });
      setStatus("success");
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Failed to reset password");
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(57,255,20,0.15),rgba(255,255,255,0))]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
          <p className="text-gray-400 mb-6">The password reset link is invalid or missing.</p>
          <Link to="/forgot-password" className="text-[#39FF14] hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight text-white">New Password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your new password below
          </p>
        </div>

        {status === "error" && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {message}
          </div>
        )}

        {status === "success" ? (
          <div className="text-center">
            <div className="mb-6 rounded-lg bg-[#39FF14]/10 p-4 text-sm text-[#39FF14] border border-[#39FF14]/20">
              {message}
            </div>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
