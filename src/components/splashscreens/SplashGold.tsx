import { motion, AnimatePresence } from "motion/react";

export default function SplashGold({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(16px)" }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#0a0700" }}
        >
          {/* Deep gold ambient */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }} />

          {/* Particles */}
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() > 0.6 ? 3 : 1.5,
                height: Math.random() > 0.6 ? 3 : 1.5,
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                background: `rgba(212,175,55,${0.4 + Math.random() * 0.6})`,
                boxShadow: `0 0 4px rgba(212,175,55,0.8)`,
              }}
              animate={{
                y: [0, -(20 + Math.random() * 40)],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-8">
            {/* Monogram N */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ margin: -20 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                  <circle cx="70" cy="70" r="68" stroke="url(#goldRing)" strokeWidth="1" strokeDasharray="6 4" />
                  <defs>
                    <linearGradient id="goldRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f8e08e" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Hexagon background */}
              <div
                className="w-24 h-24 flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(145deg, #1a1300 0%, #2a1f00 50%, #1a1300 100%)",
                  border: "1px solid rgba(212,175,55,0.5)",
                  boxShadow: "0 0 20px rgba(212,175,55,0.2), inset 0 0 20px rgba(212,175,55,0.05)",
                  borderRadius: 12,
                }}
              >
                <div className="absolute inset-0 rounded-xl" style={{
                  background: "radial-gradient(ellipse at 30% 25%, rgba(212,175,55,0.15) 0%, transparent 60%)",
                }} />
                <span
                  className="relative text-5xl font-black select-none"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    background: "linear-gradient(180deg, #f8e08e 0%, #d4af37 40%, #b8860b 80%, #f8e08e 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))",
                    letterSpacing: "-0.03em",
                  }}
                >
                  N
                </span>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1
                className="text-4xl font-black tracking-[0.35em] select-none"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  background: "linear-gradient(180deg, #f8e08e 0%, #d4af37 50%, #b8860b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 8px rgba(212,175,55,0.4))",
                }}
              >
                NEXUS
              </h1>

              {/* Gold ornament */}
              <div className="flex items-center gap-2">
                <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, #d4af37)" }} />
                <div className="w-1 h-1 rounded-full" style={{ background: "#d4af37", boxShadow: "0 0 6px #d4af37" }} />
                <div className="h-px w-10" style={{ background: "linear-gradient(90deg, #d4af37, transparent)" }} />
              </div>

              <p
                className="text-[9px] tracking-[0.7em] uppercase"
                style={{ color: "rgba(212,175,55,0.6)", fontFamily: "'Georgia', serif" }}
              >
                Control Panel
              </p>
            </motion.div>

            {/* Shimmer bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="w-48 overflow-hidden rounded-full"
              style={{ height: 2, background: "rgba(212,175,55,0.15)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ width: "35%", background: "linear-gradient(90deg, transparent, #f8e08e, #d4af37, #f8e08e, transparent)" }}
                animate={{ x: ["-100%", "380%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
