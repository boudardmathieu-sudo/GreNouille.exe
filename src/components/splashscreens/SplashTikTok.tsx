import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SplashTikTok({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"split" | "merge" | "logo">("split");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t1 = setTimeout(() => setPhase("merge"), 700);
    const t2 = setTimeout(() => setPhase("logo"), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  const text = "NEXUS";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Background noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }} />

          {/* Split phase — red and cyan separated */}
          <AnimatePresence>
            {phase === "split" && (
              <motion.div key="split" className="absolute flex items-center justify-center" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {/* Cyan layer */}
                <motion.span
                  className="absolute text-7xl font-black tracking-tight select-none"
                  style={{ fontFamily: "'Arial Black', sans-serif", color: "#25F4EE", mixBlendMode: "screen" }}
                  initial={{ x: -18, opacity: 0.9 }}
                  animate={{ x: -12 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {text}
                </motion.span>
                {/* Red layer */}
                <motion.span
                  className="absolute text-7xl font-black tracking-tight select-none"
                  style={{ fontFamily: "'Arial Black', sans-serif", color: "#FE2C55", mixBlendMode: "screen" }}
                  initial={{ x: 18, opacity: 0.9 }}
                  animate={{ x: 12 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {text}
                </motion.span>
                {/* White center */}
                <span className="text-7xl font-black tracking-tight select-none opacity-0">
                  {text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Merge phase */}
          <AnimatePresence>
            {phase === "merge" && (
              <motion.div key="merge" className="absolute flex items-center justify-center" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <motion.span
                  className="absolute text-7xl font-black tracking-tight select-none"
                  style={{ fontFamily: "'Arial Black', sans-serif", color: "#25F4EE", mixBlendMode: "screen" }}
                  initial={{ x: -12 }}
                  animate={{ x: -3 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {text}
                </motion.span>
                <motion.span
                  className="absolute text-7xl font-black tracking-tight select-none"
                  style={{ fontFamily: "'Arial Black', sans-serif", color: "#FE2C55", mixBlendMode: "screen" }}
                  initial={{ x: 12 }}
                  animate={{ x: 3 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {text}
                </motion.span>
                <span className="text-7xl font-black tracking-tight select-none" style={{ fontFamily: "'Arial Black', sans-serif", color: "rgba(255,255,255,0.85)" }}>
                  {text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final logo */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-5"
              >
                <div className="relative">
                  {/* Static subtle offset layers */}
                  <span className="absolute text-7xl font-black tracking-tight select-none" style={{ fontFamily: "'Arial Black', sans-serif", color: "#25F4EE", left: -3, top: 0, opacity: 0.75, mixBlendMode: "screen" }}>{text}</span>
                  <span className="absolute text-7xl font-black tracking-tight select-none" style={{ fontFamily: "'Arial Black', sans-serif", color: "#FE2C55", left: 3, top: 0, opacity: 0.75, mixBlendMode: "screen" }}>{text}</span>
                  <motion.span
                    className="relative text-7xl font-black tracking-tight select-none"
                    style={{ fontFamily: "'Arial Black', sans-serif", color: "#ffffff" }}
                    animate={{ textShadow: ["0 0 0px #fff", "0 0 20px rgba(255,255,255,0.4)", "0 0 0px #fff"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {text}
                  </motion.span>
                </div>

                {/* TikTok-style note icons */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-px w-8" style={{ background: "linear-gradient(90deg, transparent, #25F4EE)" }} />
                  <span className="text-[9px] tracking-[0.4em] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>PANEL</span>
                  <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #FE2C55, transparent)" }} />
                </motion.div>

                {/* Pulsing dot */}
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#25F4EE" }}
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
