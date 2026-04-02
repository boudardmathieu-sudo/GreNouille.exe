import { motion, AnimatePresence } from "motion/react";

const WIN_COLORS = ["#4F6EF7", "#7C3AED", "#6366F1", "#8B5CF6"];

export default function SplashWindows({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#050510" }}
        >
          {/* Subtle background */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(79,110,247,0.08) 0%, transparent 70%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 5, repeat: Infinity }}
          />

          <div className="flex flex-col items-center justify-between h-full py-24 w-full">
            <div />

            <div className="flex flex-col items-center gap-14">
              {/* Windows logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                  {[
                    { x: 4, y: 4, color: WIN_COLORS[0], dx: -10, dy: -10, delay: 0.08 },
                    { x: 48, y: 4, color: WIN_COLORS[1], dx: 10, dy: -10, delay: 0.14 },
                    { x: 4, y: 48, color: WIN_COLORS[2], dx: -10, dy: 10, delay: 0.2 },
                    { x: 48, y: 48, color: WIN_COLORS[3], dx: 10, dy: 10, delay: 0.26 },
                  ].map((sq, i) => (
                    <motion.rect key={i} x={sq.x} y={sq.y} width="36" height="36" rx="5" fill={sq.color}
                      initial={{ opacity: 0, x: sq.dx, y: sq.dy }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ delay: sq.delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      style={{ filter: `drop-shadow(0 0 8px ${sq.color}80)` }}
                    />
                  ))}
                </svg>
              </motion.div>

              <motion.div className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45 }}
              >
                <p className="text-white text-3xl font-light tracking-[0.22em] select-none"
                  style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                >NEXUS</p>
                <p className="text-xs tracking-[0.3em] select-none"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                >Control Panel</p>
              </motion.div>
            </div>

            {/* Windows-style 5 dot loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.3 }}
              className="flex gap-2.5"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.85)" }}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.28, 1, 0.28] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
