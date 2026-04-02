import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SplashCyberpunk({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"boot" | "reveal">("boot");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setPhase("reveal"), 900);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#01000a" }}
        >
          {/* Animated scan lines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,255,240,0.025) 0px, rgba(0,255,240,0.025) 1px, transparent 1px, transparent 3px)",
          }} />

          {/* Neon corner brackets */}
          {[
            { top: 16, left: 16, transform: "rotate(0deg)" },
            { top: 16, right: 16, transform: "rotate(90deg)" },
            { bottom: 16, right: 16, transform: "rotate(180deg)" },
            { bottom: 16, left: 16, transform: "rotate(270deg)" },
          ].map((pos, i) => (
            <motion.div key={i} className="absolute w-14 h-14 pointer-events-none"
              style={pos as any}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ transform: pos.transform }}>
                <path d="M4 28 L4 4 L28 4" stroke="#00f0ff" strokeWidth="1.5" fill="none" opacity="0.8" />
                <path d="M8 28 L8 8 L28 8" stroke="#ff00cc" strokeWidth="0.75" fill="none" opacity="0.4" />
              </svg>
            </motion.div>
          ))}

          {/* Glitch horizontal bars during boot */}
          <AnimatePresence>
            {phase === "boot" && (
              <motion.div key="glitch-bars" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.div key={i} className="absolute left-0 right-0"
                    style={{
                      top: `${8 + i * 11}%`,
                      height: `${3 + i % 3 * 2}px`,
                      background: i % 2 === 0
                        ? "linear-gradient(90deg, transparent 10%, rgba(0,255,240,0.7), rgba(255,0,200,0.5), transparent 90%)"
                        : "linear-gradient(90deg, transparent 20%, rgba(255,0,200,0.6), rgba(0,255,240,0.4), transparent 80%)",
                    }}
                    animate={{ x: ["-110%", "110%"], opacity: [0, 1, 0.8, 1, 0] }}
                    transition={{ duration: 0.25 + i * 0.06, repeat: Infinity, delay: i * 0.1, ease: "linear" }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background neon glow blobs */}
          <motion.div className="absolute pointer-events-none"
            style={{ top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,0,200,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div className="absolute pointer-events-none"
            style={{ bottom: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
            animate={{ opacity: [0.7, 0.3, 0.7] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />

          {/* Main logo reveal */}
          <AnimatePresence>
            {phase === "reveal" && (
              <motion.div key="logo"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center gap-6"
              >
                {/* Glitch N */}
                <div className="relative select-none">
                  <motion.span className="absolute text-[7rem] font-black leading-none"
                    style={{ color: "#ff00cc", top: 0, left: 3, opacity: 0.6, fontFamily: "monospace", filter: "blur(0.5px)" }}
                    animate={{ x: [-3, 3, -1, 2, 0], opacity: [0.6, 0.2, 0.7, 0.3, 0.6] }}
                    transition={{ duration: 0.12, repeat: Infinity, repeatDelay: 2 }}
                  >N</motion.span>
                  <motion.span className="absolute text-[7rem] font-black leading-none"
                    style={{ color: "#00f0ff", top: 0, left: -3, opacity: 0.6, fontFamily: "monospace", filter: "blur(0.5px)" }}
                    animate={{ x: [3, -3, 1, -2, 0], opacity: [0.6, 0.3, 0.5, 0.2, 0.6] }}
                    transition={{ duration: 0.12, repeat: Infinity, repeatDelay: 2, delay: 0.05 }}
                  >N</motion.span>
                  <span className="relative text-[7rem] font-black leading-none"
                    style={{ color: "#fff", textShadow: "0 0 20px #00f0ff, 0 0 60px rgba(0,240,255,0.5), -3px 0 #ff00cc, 3px 0 #00f0ff", fontFamily: "monospace" }}
                  >N</span>
                </div>

                {/* NEXUS label */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <motion.div className="h-px flex-1 w-16" style={{ background: "linear-gradient(90deg, transparent, #00f0ff)" }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.4 }}
                    />
                    <span className="text-sm tracking-[0.6em] font-bold"
                      style={{ color: "#00f0ff", textShadow: "0 0 10px #00f0ff, 0 0 30px rgba(0,240,255,0.5)", fontFamily: "monospace" }}
                    >NEXUS</span>
                    <motion.div className="h-px flex-1 w-16" style={{ background: "linear-gradient(90deg, #ff00cc, transparent)" }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.4 }}
                    />
                  </div>

                  <motion.span className="text-[9px] font-mono tracking-[0.5em] uppercase"
                    style={{ color: "rgba(255,0,204,0.8)", textShadow: "0 0 6px rgba(255,0,204,0.6)" }}
                    animate={{ opacity: [1, 0.3, 1, 0.5, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  >SYS_INIT_OK &gt;&gt; PANEL_LOADED</motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 25%, rgba(1,0,10,0.88) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
