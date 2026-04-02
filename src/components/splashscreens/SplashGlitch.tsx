import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SplashGlitch({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"glitch" | "settle">("glitch");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setPhase("settle"), 1300);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#060008" }}
        >
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }} />

          {/* Horizontal glitch bands */}
          {phase === "glitch" && Array.from({ length: 9 }, (_, i) => (
            <motion.div key={i} className="absolute left-0 right-0"
              style={{
                top: `${4 + i * 10.5}%`,
                height: `${2 + (i % 4) * 3}px`,
                background: i % 3 === 0
                  ? "linear-gradient(90deg, transparent 5%, rgba(255,0,60,0.75), rgba(0,240,255,0.55), transparent 95%)"
                  : i % 3 === 1
                  ? "linear-gradient(90deg, transparent 15%, rgba(0,240,255,0.7), rgba(255,0,60,0.5), transparent 85%)"
                  : "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.5), transparent 70%)",
                mixBlendMode: "screen",
              }}
              animate={{ x: ["-70%", "70%", "-40%", "90%", "-15%"], opacity: [0, 1, 0, 0.8, 0] }}
              transition={{ duration: 0.16 + i * 0.04, repeat: Infinity, delay: i * 0.07, ease: "linear" }}
            />
          ))}

          {/* Main text */}
          <AnimatePresence>
            {phase === "glitch" && (
              <motion.div key="glitch-text" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="relative select-none"
              >
                <motion.span className="absolute text-8xl font-black tracking-widest leading-none"
                  style={{ color: "#ff003c", mixBlendMode: "screen", top: 0, left: 0 }}
                  animate={{ x: [-5, 4, -2, 6, 0, -3, 5, -1, 0], opacity: [0.7, 0.4, 0.8, 0.3, 0.6, 0.9, 0.2, 0.7, 0.7] }}
                  transition={{ duration: 0.14, repeat: Infinity, ease: "linear" }}
                >NEXUS</motion.span>
                <motion.span className="absolute text-8xl font-black tracking-widest leading-none"
                  style={{ color: "#00f0ff", mixBlendMode: "screen", top: 0, left: 0 }}
                  animate={{ x: [4, -5, 2, -6, 0, 4, -3, 2, 0], opacity: [0.6, 0.8, 0.3, 0.9, 0.4, 0.7, 0.5, 0.8, 0.6] }}
                  transition={{ duration: 0.14, repeat: Infinity, ease: "linear", delay: 0.02 }}
                >NEXUS</motion.span>
                <motion.span className="relative text-8xl font-black tracking-widest leading-none"
                  style={{ color: "#ffffff" }}
                  animate={{ x: [0, -2, 1, -3, 0, 2, -1, 0], skewX: [0, -3, 0, 3, 0] }}
                  transition={{ duration: 0.16, repeat: Infinity, ease: "linear" }}
                >NEXUS</motion.span>
              </motion.div>
            )}

            {phase === "settle" && (
              <motion.div key="settled" className="flex flex-col items-center gap-5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
              >
                <motion.span className="text-8xl font-black tracking-widest"
                  style={{ color: "#ffffff", textShadow: "0 0 40px rgba(255,255,255,0.25)" }}
                  animate={{ textShadow: [
                    "0 0 40px rgba(255,255,255,0.25)",
                    "0 0 60px rgba(200,220,255,0.4)",
                    "0 0 40px rgba(255,255,255,0.25)",
                  ]}}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >NEXUS</motion.span>
                <motion.div className="h-px w-40 origin-center"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.55 }}
                />
                <motion.p className="text-xs tracking-[0.65em] uppercase" style={{ color: "rgba(255,255,255,0.38)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                >control panel</motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 65% 65% at 50% 50%, transparent 20%, rgba(6,0,8,0.82) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
