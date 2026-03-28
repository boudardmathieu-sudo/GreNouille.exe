import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Terminal, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

export default function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/logs");
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "error": return XCircle;
      case "warning": return AlertCircle;
      case "success": return CheckCircle;
      default: return Info;
    }
  };

  const getLogColors = (type: string) => {
    switch (type) {
      case "error": return { color: "text-red-400", bg: "bg-red-500/10" };
      case "warning": return { color: "text-yellow-400", bg: "bg-yellow-500/10" };
      case "success": return { color: "text-emerald-400", bg: "bg-emerald-500/10" };
      default: return { color: "text-blue-400", bg: "bg-blue-500/10" };
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(search.toLowerCase()) || 
    log.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Logs</h1>
          <p className="text-gray-400">View detailed system events and application logs</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-emerald-500 focus:bg-white/10"
          />
          <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
            Export
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-inner h-[calc(100vh-200px)]"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-800 p-3 text-gray-400">
              <Terminal className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Live Feed</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-sm text-gray-400">Streaming</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-sm custom-scrollbar">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">No logs found</div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, i) => {
                const Icon = getLogIcon(log.type);
                const colors = getLogColors(log.type);
                return (
                  <motion.div
                    key={log.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`flex items-start gap-4 rounded-lg border border-white/5 ${colors.bg} p-3 transition-colors hover:bg-white/5`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${colors.color}`} />
                    <div className="flex-1">
                      <p className="text-gray-300">{log.message}</p>
                      <p className="mt-1 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
