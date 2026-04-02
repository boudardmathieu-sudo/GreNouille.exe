import { motion, AnimatePresence } from "motion/react";

const SHARDS = [
  { x: 50, y: 50, r: 0, w: 65, h: 150 },
  { x: 30, y: 45, r: -25, w: 35, h: 110 },
  { x: 70, y: 45, r: 25, w: 35, h: 110 },
  { x: 15, y: 48, r: -42, w: 22, h: 88 },
  { x: 85, y: 48, r: 42, w: 22, h: 88 },
  { x: 5, y: 50, r: -56, w: 16, h: 68 },
  { x: 95, y: 50, r: 56, w: 16, h: 68 },
  { x: 60, y: 42, r: 14, w: 18, h: 75 },
  { x: 40, y: 42, r: -14, w: 18, h: 75 },
];

const FROST = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() > 0.7 ? 3 : 1.5,
  dur: 2 + Math.random() * 3.5,
  delay: Math.random() * 5,
}));

export default function SplashIce({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(18px)" }}
          transition={{ duration: 0.65 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #000d18 0%, #001d32 50%, #000d18 100%)" }}
        >
          {/* Top freeze gradient */}
          <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{
            background: "linear-gradient(180deg, rgba(120,220,255,0.07) 0%, transparent 100%)",
          }} />

          {/* Ice crystal shards */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            {SHARDS.map((s, i) => (
              <motion.div key={i} className="absolute"
                style={{
                  left: `${s.x}%`, bottom: 0, width: s.w, height: s.h,
                  transform: `translateX(-50%) rotate(${s.r}deg)`,
                  transformOrigin: "50% 100%",
                  background: `linear-gradient(180deg, rgba(160,240,255,${0.04 + i * 0.006}) 0%, rgba(80,180,255,${0.14 + i * 0.008}) 50%, rgba(40,140,220,0.06) 100%)`,
                  border: "1px solid rgba(160,240,255,0.18)",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  filter: "blur(0.3px)",
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.04 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>

          {/* Frost particles */}
          {FROST.map((f) => (
            <motion.div key={f.id} className="absolute rounded-full pointer-events-none"
              style={{
                width: f.size, height: f.size,
                left: `${f.x}%`, top: `${f.y}%`,
                background: `rgba(160,240,255,${0.35 + Math.random() * 0.65})`,
                boxShadow: "0 0 4px rgba(100,210,255,0.8)",
              }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: f.dur, repeat: Infinity, delay: f.delay }}
            />
          ))}

          {/* Main logo */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: -24, filter: "blur(22px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.22, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-28 h-28 flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, rgba(120,220,255,0.1) 0%, rgba(60,160,240,0.15) 100%)",
                border: "1px solid rgba(160,240,255,0.28)",
                borderRadius: 24,
                boxShadow: "0 0 40px rgba(100,210,255,0.18), 0 0 80px rgba(100,200,255,0.08), inset 0 0 24px rgba(160,240,255,0.06)",
              }}
            >
              <div className="absolute inset-0 rounded-[24px]" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)",
              }} />
              <motion.span className="relative text-5xl font-black select-none"
                style={{
                  fontFamily: "'Georgia', serif",
                  background: "linear-gradient(180deg, #eafeff 0%, #a0e8ff 40%, #60c8ff 85%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 12px rgba(100,210,255,0.9))",
                  letterSpacing: "-0.03em",
                }}
                animate={{ filter: [
                  "drop-shadow(0 0 12px rgba(100,210,255,0.9))",
                  "drop-shadow(0 0 22px rgba(120,230,255,1))",
                  "drop-shadow(0 0 12px rgba(100,210,255,0.9))",
                ]}}
                transition={{ duration: 2.5, repeat: Infinity }}
              >N</motion.span>
            </motion.div>

            <motion.div className="flex flex-col items-center gap-2.5"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.7 }}
            >
              <h1 className="text-4xl font-black tracking-[0.3em] select-none"
                style={{
                  fontFamily: "'Georgia', serif",
                  background: "linear-gradient(180deg, #eafeff 0%, #90e0ff 50%, #50b8f0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 10px rgba(100,210,255,0.55))",
                }}
              >NEXUS</h1>

              <motion.div className="h-px w-32 origin-center"
                style={{ background: "linear-gradient(90deg, transparent, rgba(100,215,255,0.8), transparent)" }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.82, duration: 0.65 }}
              />

              <p className="text-[9px] tracking-[0.55em] uppercase" style={{ color: "rgba(100,210,255,0.52)", fontFamily: "monospace" }}>
                control panel
              </p>
            </motion.div>
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(100,210,255,0.04) 0%, transparent 70%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
