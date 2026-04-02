import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789NEXUS".split("");
    const fontSize = 13;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const speeds: number[] = Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.055)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const head = drops[i] * fontSize < 30;
        ctx.fillStyle = head ? "rgba(180,255,180,0.98)" : `rgba(0,${170 + Math.floor(Math.random() * 55)},0,${0.4 + Math.random() * 0.3})`;
        ctx.font = `${fontSize}px 'Courier New', monospace`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i] += speeds[i];
      }
    };

    const id = setInterval(draw, 38);
    return () => clearInterval(id);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const BOOT_LINES = [
  "> NEXUS_OS v4.2.1 — boot sequence initiated",
  "> Memory check: 65536 blocks OK",
  "> Neural link established",
  "> Kernel modules loaded",
  "> NEXUS PANEL READY",
];

export default function SplashMatrix({ visible }: { visible: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setLines(prev => [...prev, line]), 400 + i * 280);
    });
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000000" }}
        >
          <MatrixCanvas />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3 px-10 py-6 rounded-2xl"
              style={{
                background: "rgba(0,0,0,0.82)",
                border: "1px solid rgba(0,200,0,0.4)",
                boxShadow: "0 0 40px rgba(0,200,0,0.25), 0 0 80px rgba(0,200,0,0.1), inset 0 0 30px rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              <motion.h1
                className="text-6xl font-black tracking-[0.35em] select-none"
                style={{
                  color: "#00ff41",
                  textShadow: "0 0 15px rgba(0,255,65,0.9), 0 0 40px rgba(0,200,0,0.6), 0 0 80px rgba(0,150,0,0.3)",
                  fontFamily: "'Courier New', monospace",
                }}
                animate={{ opacity: [0.85, 1, 0.88, 1, 0.85] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >NEXUS</motion.h1>

              <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.5), transparent)" }} />

              <div className="w-full font-mono text-left space-y-0.5">
                {lines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs"
                    style={{
                      color: line.includes("READY") ? "#00ff41" : "rgba(0,200,0,0.75)",
                      textShadow: line.includes("READY") ? "0 0 8px rgba(0,255,65,0.6)" : "none",
                    }}
                  >{line}</motion.p>
                ))}
                {lines.length < BOOT_LINES.length && (
                  <motion.span
                    className="text-xs"
                    style={{ color: "rgba(0,200,0,0.75)" }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >█</motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
