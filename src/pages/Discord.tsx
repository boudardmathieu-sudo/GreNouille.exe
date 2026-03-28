import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { Send, MessageSquare, Terminal, Activity } from "lucide-react";

export default function Discord() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/discord/logs");
      setLogs(res.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await axios.post("/api/discord/message", { message });
      setMessage("");
      fetchLogs();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discord Control Panel</h1>
          <p className="text-gray-400">Manage bot activity and send messages</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-4 py-2 text-sm text-[#5865F2]">
          <Activity className="h-4 w-4 animate-pulse" />
          Bot Online
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#5865F2]/20 p-3 text-[#5865F2]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Broadcast Message</h2>
          </div>

          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-gray-500 outline-none transition-all focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2]"
                placeholder="Type a message to send to the Discord channel..."
              />
            </div>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 font-semibold text-white transition-all hover:bg-[#4752C4] disabled:opacity-50"
            >
              {sending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to Channel
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-inner"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-800 p-3 text-gray-400">
                <Terminal className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
            </div>
            <button onClick={fetchLogs} className="text-sm text-gray-400 hover:text-white">Refresh</button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-sm">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-500">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">No recent messages</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-[#5865F2]">{log.author.username}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{log.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
