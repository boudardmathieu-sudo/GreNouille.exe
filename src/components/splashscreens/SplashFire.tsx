import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

const EMBERS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: 28 + Math.random() * 44,
  delay: Math.random() * 2.5,
  duration: 1.8 + Math.random() * 2.2,
  size: 1.5 + Math.random() * 3.5,
  drift: (Math.random() - 0.5) * 80,
}));

function FireCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = 280;
    const H = canvas.height = 200;

    const buf = new Uint8Array(W * H);
    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      palette.push([
        Math.min(255, i * 3),
        Math.max(0, Math.min(255, i * 2 - 120)),
        0,
      ]);
    }

    const draw = () => {
      for (let x = 0; x < W; x++) {
        buf[(H - 1) * W + x] = Math.random() > 0.35 ? 200 + Math.random() * 55 : 0;
      }
      for (let y = 0; y < H - 1; y++) {
        for (let x = 0; x < W; x++) {
          const s = buf[(y + 1) * W + ((x - 1 + W) % W)]
            + buf[(y + 1) * W + x]
            + buf[(y + 1) * W + ((x + 1) % W)]
            + buf[Math.min(H - 1, y + 2) * W + x];
          buf[y * W + x] = Math.max(0, Math.floor(s / 4) - 1);
        }
      }

      const img = ctx.createImageData(W, H);
      for (let i = 0; i < W * H; i++) {
        const c = palette[buf[i]];
        img.data[i * 4] = c[0];
        img.data[i * 4 + 1] = c[1];
        img.data[i * 4 + 2] = c[2];
        img.data[i * 4 + 3] = Math.min(255, buf[i] * 2);
      }
      ctx.putImageData(img, 0, 0);
    };

    const id = setInterval(draw, 40);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ position: "absolute", bottom: "22%", left: "50%", transform: "translateX(-50%) scaleX(2.2) scaleY(1.4)", opacity: 0.85, imageRendering: "pixelated", width: 280, height: 200 }}
    />
  );
}

export default function SplashFire({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#080100" }}
        >
          {/* Fire glow base */}
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ background: [
              "radial-gradient(ellipse 55% 45% at 50% 80%, rgba(255,60,0,0.38) 0%, rgba(180,20,0,0.12) 55%, transparent 72%)",
              "radial-gradient(ellipse 60% 50% at 50% 80%, rgba(255,90,0,0.5) 0%, rgba(200,30,0,0.18) 55%, transparent 72%)",
              "radial-gradient(ellipse 55% 45% at 50% 80%, rgba(255,60,0,0.38) 0%, rgba(180,20,0,0.12) 55%, transparent 72%)",
            ]}}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />

          <FireCanvas />

          {/* Embers */}
          {EMBERS.map((e) => (
            <motion.div key={e.id} className="absolute rounded-full pointer-events-none"
              style={{
                width: e.size, height: e.size,
                left: `${e.x}%`, bottom: "28%",
                background: e.size > 3.5 ? "#ffcc00" : e.size > 2.5 ? "#ff8800" : "#ff5500",
                boxShadow: `0 0 ${e.size * 2.5}px ${e.size > 3 ? "#ffaa00" : "#ff4400"}`,
              }}
              animate={{ y: [0, -(90 + Math.random() * 130)], x: [0, e.drift], opacity: [1, 0.7, 0], scale: [1, 0.4, 0] }}
              transition={{ duration: e.duration, repeat: Infinity, delay: e.delay, ease: "easeOut" }}
            />
          ))}

          {/* NEXUS text */}
          <motion.div className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1 className="text-7xl font-black tracking-wide select-none"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                background: "linear-gradient(180deg, #fff5aa 0%, #ffcc00 22%, #ff8800 58%, #cc2200 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.1em",
              }}
              animate={{ filter: [
                "drop-shadow(0 0 14px rgba(255,130,0,0.85)) drop-shadow(0 0 35px rgba(255,60,0,0.55))",
                "drop-shadow(0 0 24px rgba(255,200,0,1)) drop-shadow(0 0 60px rgba(255,110,0,0.75))",
                "drop-shadow(0 0 14px rgba(255,130,0,0.85)) drop-shadow(0 0 35px rgba(255,60,0,0.55))",
              ]}}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            >NEXUS</motion.h1>

            <motion.p className="text-[10px] tracking-[0.65em] uppercase"
              style={{ color: "rgba(255,130,0,0.7)", fontFamily: "monospace" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.4 }}
            >igniting...</motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
