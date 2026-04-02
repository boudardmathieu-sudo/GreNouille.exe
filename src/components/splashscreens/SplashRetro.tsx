import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const BOOT_STEPS = [
  "NEXUS SYSTEMS CORP — BIOS v3.1.4 ©1987",
  "CPU: NX-6502 @ 4.77 MHz ............. OK",
  "RAM: 65536 KB ........................ OK",
  "VIDEO: VGA 640x480 ................... OK",
  "HDD: NEXUS-20 [C:] 20MB ............. OK",
  "NET: 192.168.0.1 ..................... OK",
  "Loading NEXUS.SYS...",
  "Loading COMMAND.COM...",
  "⚡ NEXUS PANEL v4.2 — READY",
];

export default function SplashRetro({ visible }: { visible: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;

    BOOT_STEPS.forEach((step, i) => {
      setTimeout(() => setLines(prev => [...prev, step]), 80 + i * 310);
    });

    const iv = setInterval(() => setCursor(c => !c), 480);
    return () => clearInterval(iv);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ background: "#080808" }}
        >
          {/* CRT scanlines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
          }} />
          {/* CRT barrel distortion hint */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)",
          }} />
          {/* Green phosphor ambient */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,60,0.025) 0%, transparent 70%)",
          }} />

          <div className="relative z-10 p-8 md:p-14 flex flex-col gap-0.5 font-mono h-full">
            {lines.map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
                className="text-sm leading-relaxed"
                style={{
                  color: line.includes("READY")
                    ? "#00ff3c"
                    : line.includes("Loading")
                    ? "rgba(0,230,50,0.85)"
                    : "rgba(0,200,45,0.72)",
                  textShadow: line.includes("READY")
                    ? "0 0 12px rgba(0,255,60,0.7), 0 0 30px rgba(0,255,60,0.35)"
                    : "0 0 5px rgba(0,200,45,0.4)",
                }}
              >{line}</motion.p>
            ))}

            {lines.length < BOOT_STEPS.length && (
              <span className="text-sm" style={{ color: "rgba(0,200,45,0.72)", textShadow: "0 0 5px rgba(0,200,45,0.4)" }}>
                {cursor ? "█" : " "}
              </span>
            )}

            {lines.length === BOOT_STEPS.length && (
              <motion.div className="mt-10 flex flex-col gap-1.5"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
              >
                <p className="text-4xl font-bold tracking-[0.25em]"
                  style={{ color: "#00ff3c", textShadow: "0 0 20px rgba(0,255,60,0.7), 0 0 50px rgba(0,255,60,0.3)" }}
                >NEXUS</p>
                <p className="text-xs tracking-widest" style={{ color: "rgba(0,230,50,0.5)" }}>
                  CONTROL PANEL v4.2.1 — &gt; _
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
