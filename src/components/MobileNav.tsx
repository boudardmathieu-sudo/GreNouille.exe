import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Music, MessageSquare, Bot, StickyNote, Shield,
  Bookmark, CheckSquare, User, Settings, LogOut, Lock, X,
  MoreHorizontal, Play, Pause, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSpotify } from "../context/SpotifyContext";

const allNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/25" },
  { to: "/ai", icon: Bot, label: "NEXUS AI", color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/25" },
  { to: "/spotify", icon: Music, label: "Spotify", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25" },
  { to: "/discord", icon: MessageSquare, label: "Discord", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/25" },
  { to: "/analytics", icon: StickyNote, label: "Analytics", color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/25" },
  { to: "/security", icon: Shield, label: "Sécurité", color: "text-red-400", bg: "bg-red-500/15 border-red-500/25" },
  { to: "/database", icon: Bookmark, label: "Base de données", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/25" },
  { to: "/logs", icon: CheckSquare, label: "Logs", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/25" },
  { to: "/profile", icon: User, label: "Profil", color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/25" },
  { to: "/settings", icon: Settings, label: "Paramètres", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25" },
];

const quickItems = allNavItems.slice(0, 4);

export default function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { signOut, lock, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useSpotify();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut();
    navigate("/login");
  };

  const avatarUrl = (user as any)?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase();

  return (
    <>
      {/* ── Drawer overlay ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-[68px] left-0 right-0 z-50 rounded-t-3xl border-t border-white/10 overflow-hidden"
              style={{ background: "rgba(6,6,18,0.98)", backdropFilter: "blur(28px)" }}
            >
              <div className="p-5 pb-4">
                {/* Drag handle */}
                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

                {/* User card */}
                {user && (
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/8">
                    <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden border border-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{initial}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { navigate("/profile"); setDrawerOpen(false); }}
                      className="shrink-0 flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Profil <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDrawerOpen(false)} className="shrink-0 p-1 rounded-full text-gray-600 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Spotify mini player */}
                {currentTrack && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-3"
                  >
                    {currentTrack.album?.images?.[0]?.url && (
                      <img src={currentTrack.album.images[0].url} alt="" className="h-9 w-9 rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{currentTrack.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                    </div>
                    <button onClick={() => isPlaying ? pauseTrack() : playTrack()}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 text-black" /> : <Play className="h-4 w-4 text-black ml-0.5" />}
                    </button>
                  </motion.div>
                )}

                {/* Nav grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {allNavItems.map((item, i) => (
                    <motion.div key={item.to}
                      initial={{ opacity: 0, scale: 0.85, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.025, type: "spring", stiffness: 350 }}
                    >
                      <NavLink to={item.to} onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition-colors ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${isActive ? "bg-indigo-500/20 border-indigo-500/30" : `${item.bg}`}`}>
                              <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-300" : item.color}`} />
                            </div>
                            <span className={`text-[9px] font-medium text-center leading-tight ${isActive ? "text-indigo-300" : "text-gray-500"}`}>
                              {item.label.split(" ")[0]}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 pt-3 border-t border-white/8">
                  <button onClick={() => { lock(); setDrawerOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/15 transition-colors"
                  >
                    <Lock className="h-4 w-4" /> Verrouiller
                  </button>
                  <button onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[#06060f]/95 backdrop-blur-xl">
        {/* Spotify mini bar (when playing, not on spotify page) */}
        <AnimatePresence>
          {currentTrack && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-b border-[#1DB954]/15 overflow-hidden"
              onClick={() => navigate("/spotify")}
            >
              <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[#1DB954]/5 transition-colors">
                {currentTrack.album?.images?.[0]?.url && (
                  <img src={currentTrack.album.images[0].url} alt="" className="h-7 w-7 rounded-md shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentTrack.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); isPlaying ? pauseTrack() : playTrack(); }}
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-colors"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-black" /> : <Play className="h-3.5 w-3.5 text-black ml-0.5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-around px-2 py-1 pb-[env(safe-area-inset-bottom,8px)]">
          {quickItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors min-w-0 ${isActive ? "text-indigo-300" : "text-gray-600"}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <motion.div layoutId="mobile-active-dot"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"
                      />
                    )}
                    <item.icon className="h-5 w-5 shrink-0" />
                  </div>
                  <span className="text-[10px] font-medium truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${drawerOpen ? "text-indigo-300" : "text-gray-600"}`}
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
