import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Key, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <User className="h-10 w-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
            User Profile
          </span>
        </h1>
        <p className="mt-2 text-gray-400">Manage your personal information and security.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="lg:col-span-1 flex flex-col items-center rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.1)]"
        >
          <div className="relative mb-6 group cursor-pointer">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-emerald-500/30 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center">
              <span className="text-5xl font-black text-white">{user?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
          <p className="text-emerald-400 font-medium mt-1">Administrator</p>
          
          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-gray-300">Account Status</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">Verified</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(20,184,166,0.1)]"
        >
          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Personal Information</h3>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    defaultValue={user?.username}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="email" 
                    defaultValue="user@nexus.dev"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 pt-6">Security & 2FA</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Discord User ID (For 2FA)</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      id="discordUserId"
                      placeholder="e.g. 123456789012345678"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={async () => {
                      const userId = (document.getElementById('discordUserId') as HTMLInputElement)?.value;
                      if (!userId) return alert('Please enter a Discord User ID');
                      try {
                        const res = await fetch('/api/discord/dm', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({
                            userId,
                            message: '🔒 **Nexus Security**: This is a test message for your 2FA setup. If you received this, your Discord integration is working correctly!'
                          })
                        });
                        if (res.ok) {
                          alert('Test message sent successfully!');
                        } else {
                          alert('Failed to send test message. Check your User ID and bot configuration.');
                        }
                      } catch (err) {
                        alert('Error sending message');
                      }
                    }}
                    className="rounded-xl bg-white/10 px-4 py-3 font-medium text-white hover:bg-white/20 transition-colors border border-white/10"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="button" className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all hover:scale-105 active:scale-95">
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
