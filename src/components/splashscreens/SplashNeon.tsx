import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const LETTERS = ["N", "E", "X", "U", "S"];
const COLORS = ["#ff00aa", "#ff6600", "#ffee00", "#00ff88", "#00aaff"];

export default function SplashNeon({ visible }: { visible: boolean }) {
  const [lit, setLit] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    LETTERS.forEach((_, i) => {
      setTimeout(() => setLit(i + 1), 200 + i * 220);
    });
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#08000f" }}
        >
          {/* Brick wall texture — subtle */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px)",
          }} />

          {/* Neon sign border */}
          <motion.div
            className="relative flex flex-col items-center gap-6 px-16 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Outer neon border */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
              border: "2px solid rgba(255,0,170,0.4)",
              boxShadow: "0 0 8px rgba(255,0,170,0.3), inset 0 0 8px rgba(255,0,170,0.1)",
            }} />
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.5, 1, 0.7, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                border: "2px solid rgba(255,0,170,0.6)",
                boxShadow: "0 0 20px rgba(255,0,170,0.4), 0 0 40px rgba(255,0,170,0.15)",
              }}
            />

            {/* NEXUS letters — each a different neon color */}
            <div className="flex items-center gap-1">
              {LETTERS.map((letter, i) => (
                <motion.div key={i} className="relative">
                  <AnimatePresence>
                    {i < lit && (
                      <motion.span
                        key={`lit-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-6xl font-black select-none"
                        style={{
                          fontFamily: "'Arial Black', Impact, sans-serif",
                          color: COLORS[i],
                          textShadow: `0 0 7px ${COLORS[i]}, 0 0 20px ${COLORS[i]}, 0 0 50px ${COLORS[i]}80`,
                          filter: `drop-shadow(0 0 6px ${COLORS[i]})`,
                        }}
                      >
                        <motion.span
                          animate={{ opacity: [1, 0.85, 1, 0.9, 1] }}
                          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                          style={{ display: "inline-block" }}
                        >
                          {letter}
                        </motion.span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Unlit version */}
                  {i >= lit && (
                    <span className="text-6xl font-black select-none" style={{ fontFamily: "'Arial Black', Impact, sans-serif", color: "rgba(255,255,255,0.07)" }}>
                      {letter}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Subtitle neon */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={lit === LETTERS.length ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[10px] tracking-[0.6em] uppercase"
              style={{
                color: "#00aaff",
                textShadow: "0 0 6px #00aaff, 0 0 18px #00aaff80",
                fontFamily: "monospace",
              }}
            >
              control panel
            </motion.p>
          </motion.div>

          {/* Ground reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
            background: "linear-gradient(to top, rgba(8,0,15,0) 0%, transparent 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
