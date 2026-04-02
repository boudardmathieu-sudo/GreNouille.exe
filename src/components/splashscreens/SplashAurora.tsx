import { motion, AnimatePresence } from "motion/react";

const ORBS = [
  { color: "#00c8ff", x: "18%", y: "28%", w: 550, h: 320, delay: 0, dur: 8 },
  { color: "#7c3aed", x: "62%", y: "18%", w: 480, h: 380, delay: 1, dur: 10 },
  { color: "#06b6d4", x: "38%", y: "62%", w: 500, h: 300, delay: 0.5, dur: 9 },
  { color: "#a855f7", x: "72%", y: "58%", w: 420, h: 360, delay: 1.5, dur: 11 },
  { color: "#10b981", x: "8%", y: "68%", w: 380, h: 280, delay: 0.8, dur: 7 },
  { color: "#f59e0b", x: "85%", y: "35%", w: 280, h: 220, delay: 2, dur: 12 },
];

const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() > 0.8 ? 2 : 1,
  dur: 2 + Math.random() * 3.5,
  delay: Math.random() * 4,
}));

export default function SplashAurora({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: "blur(22px)" }}
          transition={{ duration: 0.65 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#020310" }}
        >
          {/* Aurora orbs */}
          {ORBS.map((orb, i) => (
            <motion.div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                left: orb.x, top: orb.y, width: orb.w, height: orb.h,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(ellipse, ${orb.color}28 0%, transparent 65%)`,
                filter: "blur(50px)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.85, 0.55, 0.95, 0.65],
                scale: [0.5, 1.12, 0.92, 1.18, 1],
                x: [0, 35, -22, 18, 0],
                y: [0, -22, 18, -12, 0],
              }}
              transition={{ delay: orb.delay, duration: orb.dur, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Star field */}
          {STARS.map((s) => (
            <motion.div key={s.id} className="absolute rounded-full"
              style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%`, background: "white" }}
              animate={{ opacity: [0.08, 0.9, 0.08] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
            />
          ))}

          {/* Horizontal aurora band */}
          <motion.div className="absolute pointer-events-none"
            style={{
              top: "35%", left: "-10%", right: "-10%", height: 80,
              background: "linear-gradient(180deg, transparent, rgba(168,85,247,0.08) 30%, rgba(6,182,212,0.1) 60%, transparent)",
              filter: "blur(20px)",
            }}
            animate={{ opacity: [0, 0.7, 0.4, 0.9, 0.5], y: [0, -15, 10, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 32, filter: "blur(22px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.35, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <motion.h1
                className="text-7xl font-black tracking-tight select-none"
                style={{
                  background: "linear-gradient(135deg, #a5f3fc 0%, #818cf8 35%, #c084fc 65%, #34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                animate={{ filter: [
                  "drop-shadow(0 0 20px rgba(168,85,247,0.3))",
                  "drop-shadow(0 0 45px rgba(6,182,212,0.55))",
                  "drop-shadow(0 0 25px rgba(52,211,153,0.4))",
                  "drop-shadow(0 0 20px rgba(168,85,247,0.3))",
                ]}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >NEXUS</motion.h1>

              <motion.div className="h-px w-48 origin-center"
                style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.7), rgba(6,182,212,0.7), transparent)" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.75, duration: 0.85 }}
              />

              <motion.p className="text-xs tracking-[0.55em] uppercase"
                style={{ color: "rgba(165,243,252,0.7)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.6 }}
              >Control Panel</motion.p>
            </motion.div>
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 18%, rgba(2,3,16,0.72) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
