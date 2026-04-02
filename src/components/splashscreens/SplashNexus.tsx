import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = Math.floor(canvas.width / 48);
    const rows = Math.floor(canvas.height / 48);
    const dots: { x: number; y: number; opacity: number; phase: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * 48 + 24,
          y: r * 48 + 24,
          opacity: 0,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = frame * 0.012;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const d of dots) {
        const dist = Math.sqrt((d.x - cx) ** 2 + (d.y - cy) ** 2);
        const wave = Math.sin(t - dist * 0.012 + d.phase) * 0.5 + 0.5;
        const alpha = wave * 0.35;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,130,255,${alpha})`;
        ctx.fill();
      }
      frame++;
    };

    const id = setInterval(draw, 40);
    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function SplashNexus({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(28px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#04040f" }}
        >
          <ParticleGrid />

          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(79,110,247,0.12) 0%, transparent 70%)",
          }} />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.4, filter: "blur(30px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-28 h-28 rounded-[32px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(79,110,247,0.25) 0%, rgba(124,58,237,0.18) 100%)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 0 0 1px rgba(79,110,247,0.18), 0 0 50px rgba(79,110,247,0.35), 0 0 120px rgba(79,110,247,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <div className="absolute inset-0 rounded-[32px]" style={{
                  background: "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.2) 0%, transparent 55%)",
                }} />
                <motion.span
                  className="relative z-10 text-5xl font-black select-none leading-none"
                  style={{
                    color: "#ffffff",
                    textShadow: "0 0 20px rgba(120,150,255,1), 0 0 50px rgba(79,110,247,0.6)",
                    letterSpacing: "-0.04em",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                  animate={{ textShadow: [
                    "0 0 20px rgba(120,150,255,1), 0 0 50px rgba(79,110,247,0.6)",
                    "0 0 30px rgba(140,170,255,1), 0 0 80px rgba(79,110,247,0.9)",
                    "0 0 20px rgba(120,150,255,1), 0 0 50px rgba(79,110,247,0.6)",
                  ]}}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >N</motion.span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.42, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <h1
                className="text-5xl font-black tracking-[0.28em] select-none"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, rgba(200,215,255,0.8) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >NEXUS</h1>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.72, duration: 0.55, ease: "easeOut" }}
                className="h-px w-28 origin-center"
                style={{ background: "linear-gradient(90deg, transparent, rgba(110,140,255,0.9), transparent)" }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.88, duration: 0.5 }}
                className="text-[0.62rem] tracking-[0.55em] uppercase font-medium"
                style={{ color: "rgba(200,215,255,0.9)" }}
              >Control Panel</motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.4 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-56 overflow-hidden rounded-full" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(79,110,247,0.9), rgba(139,92,246,0.95), rgba(79,110,247,0.9), transparent)" }}
                  animate={{ x: ["-100%", "350%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.2 }}
                />
              </div>
              <motion.p
                className="text-[9px] font-mono tracking-[0.3em]"
                style={{ color: "rgba(100,130,255,0.5)" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >INITIALISATION...</motion.p>
            </motion.div>
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(4,4,15,0.92) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
