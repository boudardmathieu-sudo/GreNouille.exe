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
      setTimeout(() => setLit(i + 1), 180 + i * 200);
    });
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#060010" }}
        >
          {/* Brick texture hint */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 44px)",
          }} />

          {/* Ambient neon glow from sign */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 40% at 50% 48%, rgba(255,0,170,0.1) 0%, rgba(0,170,255,0.06) 50%, transparent 75%)" }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Neon sign box */}
          <div className="relative flex flex-col items-center gap-7 px-16 py-10">
            {/* Flickering outer border */}
            <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.7, 1, 0.5, 1, 0.8, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                border: "2px solid rgba(255,0,170,0.65)",
                boxShadow: "0 0 12px rgba(255,0,170,0.4), 0 0 40px rgba(255,0,170,0.18), inset 0 0 10px rgba(255,0,170,0.08)",
              }}
            />

            {/* Letter-by-letter neon reveal */}
            <div className="flex items-center gap-0.5">
              {LETTERS.map((letter, i) => (
                <motion.div key={i} className="relative">
                  <AnimatePresence>
                    {i < lit ? (
                      <motion.span key="lit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-6xl font-black select-none"
                        style={{
                          fontFamily: "'Arial Black', Impact, sans-serif",
                          color: COLORS[i],
                          textShadow: `0 0 7px ${COLORS[i]}, 0 0 22px ${COLORS[i]}, 0 0 55px ${COLORS[i]}90`,
                          filter: `drop-shadow(0 0 8px ${COLORS[i]})`,
                        }}
                      >
                        <motion.span
                          animate={{ opacity: [1, 0.9, 1, 0.85, 1] }}
                          transition={{ duration: 2.5 + i * 0.45, repeat: Infinity, delay: i * 0.35 }}
                          style={{ display: "inline-block" }}
                        >{letter}</motion.span>
                      </motion.span>
                    ) : (
                      <span className="text-6xl font-black select-none"
                        style={{ fontFamily: "'Arial Black', Impact, sans-serif", color: "rgba(255,255,255,0.055)" }}
                      >{letter}</span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Underline neon */}
            <motion.div className="h-px w-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,0,170,0.6), rgba(0,170,255,0.6), transparent)" }}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.2, duration: 0.5 }}
            />

            {/* Subtitle neon */}
            <AnimatePresence>
              {lit === LETTERS.length && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="text-[10px] tracking-[0.65em] uppercase"
                  style={{
                    color: "#00aaff",
                    textShadow: "0 0 8px #00aaff, 0 0 22px rgba(0,170,255,0.6)",
                    fontFamily: "monospace",
                  }}
                >control panel</motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Ground reflection gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{
            background: "linear-gradient(to top, rgba(6,0,16,0.9), transparent)",
          }} />
          {/* Floor neon reflection */}
          {lit === LETTERS.length && (
            <motion.div className="absolute pointer-events-none"
              style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 200, height: 4, background: "radial-gradient(ellipse, rgba(255,0,170,0.5) 0%, transparent 70%)", filter: "blur(3px)" }}
              initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
