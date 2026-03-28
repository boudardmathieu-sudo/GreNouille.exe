import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ActivitySquare, TrendingUp, Users, Zap, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';

export default function Analytics() {
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTraffic: "0",
    activeUsers: "0",
    conversionRate: "0%",
    avgLatency: "0ms"
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trafficRes, statsRes] = await Promise.all([
          axios.get('/api/analytics/traffic'),
          axios.get('/api/analytics/stats')
        ]);
        setTrafficData(trafficRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <ActivitySquare className="h-10 w-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
            Analytics Overview
          </span>
        </h1>
        <p className="mt-2 text-gray-400">Deep dive into your system's performance metrics.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Traffic", value: stats.totalTraffic, icon: Globe, color: "text-emerald-400", shadow: "shadow-emerald-500/20" },
          { label: "Active Users", value: stats.activeUsers, icon: Users, color: "text-green-400", shadow: "shadow-green-500/20" },
          { label: "Conversion Rate", value: stats.conversionRate, icon: TrendingUp, color: "text-teal-400", shadow: "shadow-teal-500/20" },
          { label: "Avg. Latency", value: stats.avgLatency, icon: Zap, color: "text-cyan-400", shadow: "shadow-cyan-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-lg ${stat.shadow} hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className={`mt-2 text-3xl font-black ${stat.color} drop-shadow-[0_0_10px_currentColor]`}>{stat.value}</p>
              </div>
              <div className={`rounded-xl bg-white/5 p-4 ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" /> Traffic Trends
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(20,184,166,0.1)]"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-400" /> Page Views
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }} cursor={{ fill: '#ffffff10' }} />
                <Bar dataKey="pageViews" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
