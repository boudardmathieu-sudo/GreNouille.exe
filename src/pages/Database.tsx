import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Database as DatabaseIcon, HardDrive, Server, Activity } from "lucide-react";
import axios from "axios";

export default function Database() {
  const [stats, setStats] = useState({ size: "Loading...", users: 0, logs: 0, uptime: 0 });
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatabaseData = async () => {
      try {
        const [statsRes, queriesRes] = await Promise.all([
          axios.get("/api/database/stats"),
          axios.get("/api/database/queries")
        ]);
        setStats(statsRes.data);
        setQueries(queriesRes.data);
      } catch (error) {
        console.error("Failed to fetch database data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseData();
    const interval = setInterval(fetchDatabaseData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Database Management</h1>
          <p className="text-gray-400">Monitor and manage your database instances</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Connected
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {[
          { title: "Total Size", value: stats.size, icon: HardDrive, color: "text-emerald-400", bg: "bg-emerald-500/20" },
          { title: "Total Users", value: stats.users.toString(), icon: Activity, color: "text-blue-400", bg: "bg-blue-500/20" },
          { title: "Uptime", value: formatUptime(stats.uptime), icon: Server, color: "text-purple-400", bg: "bg-purple-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-xl ${stat.bg} p-4`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{loading ? "..." : stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400">
            <DatabaseIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Queries</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="border-b border-white/10 bg-black/40 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Query</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading queries...</td>
                </tr>
              ) : queries.map((row, i) => (
                <tr key={i} className="border-b border-white/5 bg-black/20 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-emerald-400">{row.query}</td>
                  <td className="px-6 py-4">{row.duration}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
