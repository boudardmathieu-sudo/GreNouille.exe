import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Shield, Activity, Users, Zap, Server, Cpu, HardDrive } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from "axios";

const data = [
  { time: '00:00', load: 30, network: 20 },
  { time: '04:00', load: 45, network: 35 },
  { time: '08:00', load: 65, network: 50 },
  { time: '12:00', load: 85, network: 75 },
  { time: '16:00', load: 70, network: 60 },
  { time: '20:00', load: 50, network: 40 },
  { time: '24:00', load: 35, network: 25 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState({ users: 0 });

  const konamiCode = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        if (konamiIndex === konamiCode.length - 1) {
          setEasterEggActive(true);
          setKonamiIndex(0);
          setTimeout(() => setEasterEggActive(false), 5000);
        } else {
          setKonamiIndex((prev) => prev + 1);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          axios.get("/api/logs"),
          axios.get("/api/database/stats")
        ]);
        setRecentLogs(logsRes.data.slice(0, 4));
        setDbStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "System Status", value: "Online", icon: Activity, color: "text-green-400" },
    { label: "Security Level", value: "Maximum", icon: Shield, color: "text-blue-400" },
    { label: "Total Users", value: dbStats.users.toString(), icon: Users, color: "text-purple-400" },
    { label: "API Latency", value: "24ms", icon: Zap, color: "text-yellow-400" },
  ];

  const serverStats = [
    { label: "CPU Usage", value: "42%", icon: Cpu, color: "text-cyan-400" },
    { label: "Memory", value: "16GB / 32GB", icon: Server, color: "text-pink-400" },
    { label: "Storage", value: "1.2TB Free", icon: HardDrive, color: "text-orange-400" },
  ];

  return (
    <div className="flex-1 p-8">
      <AnimatePresence>
        {easterEggActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
            >
              HACKER MODE ACTIVATED
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#00FF00] to-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">{user?.username}</span>
        </h1>
        <p className="mt-2 text-gray-400">Here's what's happening with your projects today.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]"
          >
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-white/10 blur-xl transition-transform duration-500 group-hover:scale-150 group-hover:bg-${stat.color.split('-')[1]}-500/20`} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{stat.value}</p>
              </div>
              <div className={`rounded-xl bg-white/5 p-3 ${stat.color} shadow-[0_0_15px_currentColor] group-hover:shadow-[0_0_25px_currentColor] transition-shadow duration-300`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:shadow-[0_0_40px_rgba(52,211,153,0.1)] transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold text-white mb-6">System Load Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00FF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="load" stroke="#39FF14" fillOpacity={1} fill="url(#colorLoad)" />
                <Area type="monotone" dataKey="network" stroke="#00FF00" fillOpacity={1} fill="url(#colorNetwork)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Server Stats & Quick Actions */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:shadow-[0_0_40px_rgba(52,211,153,0.1)] transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Hardware Status</h2>
            <div className="flex flex-col gap-6">
              {serverStats.map((stat) => (
                <motion.div 
                  key={stat.label} 
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className={`rounded-xl bg-white/5 p-3 ${stat.color} shadow-[0_0_10px_currentColor] group-hover:shadow-[0_0_20px_currentColor] transition-shadow duration-200`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                    <p className="font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:shadow-[0_0_40px_rgba(52,211,153,0.1)] transition-shadow duration-300 flex-1"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="flex flex-col gap-4">
              {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    log.type === 'warning' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' :
                    log.type === 'success' ? 'bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.8)]' :
                    log.type === 'error' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' :
                    'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-300">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:shadow-[0_0_40px_rgba(52,211,153,0.1)] transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <button className="relative overflow-hidden w-full rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/30 px-4 py-3 text-sm font-medium text-[#39FF14] transition-all hover:bg-[#39FF14]/30 hover:text-[#00FF00] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] group">
                <span className="relative z-10">Generate Analytics Report</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
              </button>
              <button className="relative overflow-hidden w-full rounded-xl bg-teal-600/20 border border-teal-500/30 px-4 py-3 text-sm font-medium text-teal-400 transition-all hover:bg-teal-600/30 hover:text-teal-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] group">
                <span className="relative z-10">Restart Services</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
