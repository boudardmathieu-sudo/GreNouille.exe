import { motion, AnimatePresence } from "motion/react";

const CRYSTAL_SHARDS = [
  { x: 50, y: 50, r: 0, w: 60, h: 140 },
  { x: 30, y: 45, r: -22, w: 30, h: 100 },
  { x: 70, y: 45, r: 22, w: 30, h: 100 },
  { x: 18, y: 50, r: -38, w: 20, h: 80 },
  { x: 82, y: 50, r: 38, w: 20, h: 80 },
  { x: 10, y: 52, r: -52, w: 14, h: 60 },
  { x: 90, y: 52, r: 52, w: 14, h: 60 },
];

export default function SplashIce({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(16px)" }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #000a14 0%, #001a2e 50%, #000a14 100%)" }}
        >
          {/* Ice crystal shards background */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ paddingBottom: 0 }}>
            {CRYSTAL_SHARDS.map((s, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${s.x}%`,
                  bottom: 0,
                  width: s.w,
                  height: s.h,
                  transform: `translateX(-50%) rotate(${s.r}deg)`,
                  transformOrigin: "50% 100%",
                  background: `linear-gradient(180deg, rgba(150,230,255,${0.05 + i * 0.01}) 0%, rgba(100,200,255,${0.12 + i * 0.01}) 50%, rgba(50,150,220,0.08) 100%)`,
                  border: "1px solid rgba(150,230,255,0.15)",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  filter: "blur(0.5px)",
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>

          {/* Frost particles */}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: Math.random() > 0.7 ? 3 : 1.5,
                height: Math.random() > 0.7 ? 3 : 1.5,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `rgba(150,230,255,${0.3 + Math.random() * 0.7})`,
                boxShadow: "0 0 4px rgba(100,200,255,0.8)",
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}

          {/* Top ice gradient */}
          <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none" style={{
            background: "linear-gradient(180deg, rgba(100,200,255,0.06) 0%, transparent 100%)",
          }} />

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-7">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-24 h-24 flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, rgba(100,200,255,0.08) 0%, rgba(50,150,220,0.12) 100%)",
                border: "1px solid rgba(150,230,255,0.25)",
                borderRadius: 20,
                boxShadow: "0 0 30px rgba(100,200,255,0.15), inset 0 0 20px rgba(150,230,255,0.05)",
              }}
            >
              {/* Frost shine */}
              <div className="absolute inset-0 rounded-[20px]" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
              }} />
              <span
                className="relative text-5xl font-black select-none"
                style={{
                  fontFamily: "'Georgia', serif",
                  background: "linear-gradient(180deg, #e8f8ff 0%, #a0e0ff 40%, #60c0ff 80%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 10px rgba(100,200,255,0.8))",
                  letterSpacing: "-0.03em",
                }}
              >
                N
              </span>
            </motion.div>

            {/* Text */}
            <motion.div
              className="flex flex-col items-center gap-2.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <h1
                className="text-4xl font-black tracking-[0.3em] select-none"
                style={{
                  fontFamily: "'Georgia', serif",
                  background: "linear-gradient(180deg, #e8f8ff 0%, #90d8ff 50%, #50b0ef 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 10px rgba(100,200,255,0.5))",
                }}
              >
                NEXUS
              </h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="h-px w-28 origin-center"
                style={{ background: "linear-gradient(90deg, transparent, rgba(100,200,255,0.7), transparent)" }}
              />

              <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color: "rgba(100,200,255,0.5)", fontFamily: "monospace" }}>
                control panel
              </p>
            </motion.div>
          </div>

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(100,200,255,0.04) 0%, transparent 70%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
