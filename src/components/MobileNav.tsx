import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Music, MessageSquare, Bot, StickyNote, Shield, Bookmark, CheckSquare, User, Settings, LogOut, Lock, X, Grid3x3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const allNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-indigo-400" },
  { to: "/ai", icon: Bot, label: "NEXUS AI", color: "text-violet-400" },
  { to: "/spotify", icon: Music, label: "Spotify", color: "text-green-400" },
  { to: "/discord", icon: MessageSquare, label: "Discord", color: "text-blue-400" },
  { to: "/analytics", icon: StickyNote, label: "Analytics", color: "text-yellow-400" },
  { to: "/security", icon: Shield, label: "Sécurité", color: "text-red-400" },
  { to: "/database", icon: Bookmark, label: "Base de données", color: "text-cyan-400" },
  { to: "/logs", icon: CheckSquare, label: "Logs", color: "text-orange-400" },
  { to: "/profile", icon: User, label: "Profil", color: "text-pink-400" },
  { to: "/settings", icon: Settings, label: "Paramètres", color: "text-emerald-400" },
];

const quickItems = allNavItems.slice(0, 4);

export default function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { signOut, lock, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut();
    navigate("/login");
  };

  const avatarUrl = (user as any)?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase();

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-[72px] left-0 right-0 z-50 rounded-t-3xl border-t border-white/10 overflow-hidden"
              style={{ background: "rgba(5,5,20,0.97)", backdropFilter: "blur(24px)" }}
            >
              <div className="p-6 pb-4">
                {user && (
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{initial}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={() => setDrawerOpen(false)} className="ml-auto text-gray-500 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-3 mb-4">
                  {allNavItems.map((item, i) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                    >
                      <NavLink
                        to={item.to}
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-white/5 border border-white/5"}`}>
                              <item.icon className={`h-6 w-6 ${isActive ? "text-indigo-300" : item.color}`} />
                            </div>
                            <span className={`text-[10px] font-medium text-center leading-tight ${isActive ? "text-indigo-300" : "text-gray-400"}`}>
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2 border-t border-white/5">
                  <button
                    onClick={() => { lock(); setDrawerOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium"
                  >
                    <Lock className="h-4 w-4" /> Verrouiller
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {quickItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${isActive ? "text-indigo-300" : "text-gray-500"}`
              }
            >
              {({ isActive }) => (
                <div className="relative flex flex-col items-center gap-1">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-pill"
                      className="absolute -top-1 w-1 h-1 rounded-full bg-indigo-400"
                    />
                  )}
                  <item.icon className="h-6 w-6 shrink-0" />
                </div>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${drawerOpen ? "text-indigo-300" : "text-gray-500"}`}
          >
            <Grid3x3 className="h-6 w-6 shrink-0" />
          </button>
        </div>
      </nav>
    </>
  );
}
