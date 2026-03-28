import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Monitor, Lock, Palette, Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <SettingsIcon className="h-10 w-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-500 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
            System Settings
          </span>
        </h1>
        <p className="mt-2 text-gray-400">Configure your Nexus Dashboard experience.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: "Appearance",
            icon: Palette,
            color: "text-emerald-400",
            shadow: "shadow-emerald-500/20",
            options: [
              { label: "Theme", type: "select", choices: ["Neon Leaf", "Dark Emerald", "Cyberpunk"] },
              { label: "Animations", type: "toggle", active: true },
            ]
          },
          {
            title: "Notifications",
            icon: Bell,
            color: "text-teal-400",
            shadow: "shadow-teal-500/20",
            options: [
              { label: "Push Notifications", type: "toggle", active: true },
              { label: "Email Alerts", type: "toggle", active: false },
            ]
          },
          {
            title: "Privacy & Security",
            icon: Lock,
            color: "text-green-400",
            shadow: "shadow-green-500/20",
            options: [
              { label: "Two-Factor Auth", type: "button", action: "Enable 2FA" },
              { label: "Session Timeout", type: "select", choices: ["15 mins", "1 hour", "Never"] },
            ]
          },
          {
            title: "Data Management",
            icon: Database,
            color: "text-cyan-400",
            shadow: "shadow-cyan-500/20",
            options: [
              { label: "Auto-Backup", type: "toggle", active: true },
              { label: "Clear Cache", type: "button", action: "Clear Now" },
            ]
          }
        ].map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className={`rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:${section.shadow} transition-shadow`}
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <section.icon className={`h-6 w-6 ${section.color} drop-shadow-[0_0_8px_currentColor]`} />
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
            </div>
            
            <div className="space-y-6">
              {section.options.map((opt, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{opt.label}</span>
                  
                  {opt.type === 'toggle' && (
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${opt.active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${opt.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  )}
                  
                  {opt.type === 'select' && (
                    <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-emerald-500">
                      {opt.choices?.map(c => <option key={c} className="bg-gray-900">{c}</option>)}
                    </select>
                  )}

                  {opt.type === 'button' && (
                    <button className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/10">
                      {opt.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
