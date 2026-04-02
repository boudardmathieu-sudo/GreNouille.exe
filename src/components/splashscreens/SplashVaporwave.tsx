import { motion, AnimatePresence } from "motion/react";

const GRID_H = 14;
const GRID_V = 16;
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 55,
  size: Math.random() > 0.85 ? 2 : 1,
  dur: 2 + Math.random() * 3,
  delay: Math.random() * 4,
}));

export default function SplashVaporwave({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #080120 0%, #18053a 40%, #2e1158 70%, #0d0221 100%)" }}
        >
          {/* Stars */}
          {STARS.map((s) => (
            <motion.div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
              style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%` }}
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
            />
          ))}

          {/* Retro sun */}
          <motion.div className="absolute pointer-events-none"
            style={{ top: "16%", left: "50%", transform: "translateX(-50%)", zIndex: 1 }}
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #ffe000 0%, #ff8800 35%, #ff3070 62%, #cc00ff 100%)",
                  boxShadow: "0 0 50px rgba(255,100,0,0.55), 0 0 100px rgba(255,0,120,0.35)",
                }}
              />
              {/* Sun stripes */}
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="absolute left-0 right-0 bg-black"
                  style={{ top: `${52 + i * 7.5}%`, height: `${2.5 + i * 0.4}%`, opacity: 0.92 }}
                />
              ))}
              {/* Sun overlay gradient */}
              <div className="absolute inset-0 rounded-full" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%)",
              }} />
            </div>
          </motion.div>

          {/* Perspective grid */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: "52%", perspective: "280px" }}>
            <motion.div className="absolute inset-0"
              style={{ transformOrigin: "50% 0%", transform: "rotateX(38deg)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22, duration: 0.7 }}
            >
              {Array.from({ length: GRID_H }, (_, i) => (
                <div key={`h-${i}`} className="absolute left-0 right-0"
                  style={{
                    top: `${(i / GRID_H) * 100}%`, height: 1,
                    background: `rgba(255,0,200,${0.12 + (i / GRID_H) * 0.55})`,
                    boxShadow: "0 0 5px rgba(255,0,200,0.5)",
                  }}
                />
              ))}
              {Array.from({ length: GRID_V }, (_, i) => (
                <div key={`v-${i}`} className="absolute top-0 bottom-0"
                  style={{
                    left: `${(i / (GRID_V - 1)) * 100}%`, width: 1,
                    background: `rgba(180,0,255,${0.08 + Math.abs(i - GRID_V / 2) / GRID_V * 0.45})`,
                    boxShadow: "0 0 4px rgba(180,0,255,0.4)",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* NEXUS title */}
          <motion.div className="relative z-10 flex flex-col items-center gap-2.5"
            style={{ marginTop: 50 }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1 className="text-7xl font-black tracking-widest select-none"
              style={{
                fontFamily: "'Arial Black', sans-serif",
                background: "linear-gradient(180deg, #ff71ce 0%, #b967ff 50%, #05ffa1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.2em",
              }}
              animate={{ filter: [
                "drop-shadow(0 0 12px rgba(185,103,255,0.6))",
                "drop-shadow(0 0 25px rgba(5,255,161,0.5))",
                "drop-shadow(0 0 12px rgba(185,103,255,0.6))",
              ]}}
              transition={{ duration: 3, repeat: Infinity }}
            >NEXUS</motion.h1>
            <motion.p className="text-[10px] tracking-[0.55em] uppercase"
              style={{ color: "#05ffa1", textShadow: "0 0 10px #05ffa1, 0 0 25px rgba(5,255,161,0.5)", fontFamily: "monospace" }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2, repeat: Infinity }}
            >✦ CONTROL PANEL ✦</motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
