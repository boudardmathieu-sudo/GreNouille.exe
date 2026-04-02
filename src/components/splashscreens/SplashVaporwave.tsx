import { motion, AnimatePresence } from "motion/react";

const GRID_LINES_H = 12;
const GRID_LINES_V = 14;

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
          style={{ background: "linear-gradient(180deg, #0d0221 0%, #1a0533 40%, #2d1155 70%, #0d0221 100%)" }}
        >
          {/* Stars */}
          {Array.from({ length: 50 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.85 ? 2 : 1,
                height: Math.random() > 0.85 ? 2 : 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 55}%`,
              }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
            />
          ))}

          {/* Retro sun */}
          <motion.div
            className="absolute"
            style={{ top: "22%", left: "50%", transform: "translateX(-50%)", zIndex: 1 }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              {/* Sun gradient */}
              <div className="absolute inset-0 rounded-full" style={{
                background: "linear-gradient(180deg, #ffdd00 0%, #ff6600 40%, #ff0080 70%, #aa00ff 100%)",
                boxShadow: "0 0 40px rgba(255,100,0,0.5), 0 0 80px rgba(255,0,128,0.3)",
              }} />
              {/* Horizontal stripes */}
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="absolute left-0 right-0 bg-black" style={{
                  top: `${55 + i * 8}%`,
                  height: `${3 + i}%`,
                  opacity: 0.9,
                }} />
              ))}
            </div>
          </motion.div>

          {/* Perspective grid */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: "55%", perspective: "300px" }}>
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: "50% 0%", transform: "rotateX(35deg)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* Horizontal grid lines */}
              {Array.from({ length: GRID_LINES_H }, (_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${(i / GRID_LINES_H) * 100}%`,
                    height: 1,
                    background: `rgba(255,0,200,${0.15 + (i / GRID_LINES_H) * 0.5})`,
                    boxShadow: "0 0 4px rgba(255,0,200,0.5)",
                  }}
                />
              ))}
              {/* Vertical grid lines */}
              {Array.from({ length: GRID_LINES_V }, (_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${(i / (GRID_LINES_V - 1)) * 100}%`,
                    width: 1,
                    background: `rgba(180,0,255,${0.1 + Math.abs(i - GRID_LINES_V / 2) / GRID_LINES_V * 0.4})`,
                    boxShadow: "0 0 4px rgba(180,0,255,0.4)",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* NEXUS title */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-2"
            style={{ marginTop: 40 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="text-6xl font-black tracking-widest select-none"
              style={{
                fontFamily: "'Arial Black', sans-serif",
                background: "linear-gradient(180deg, #ff71ce 0%, #b967ff 50%, #05ffa1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 12px rgba(185,103,255,0.6))",
                letterSpacing: "0.18em",
              }}
            >
              NEXUS
            </h1>
            <motion.p
              className="text-[9px] tracking-[0.5em] uppercase"
              style={{ color: "#05ffa1", textShadow: "0 0 8px #05ffa1", fontFamily: "monospace" }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦ control panel ✦
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
