import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EMBERS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 3,
  size: 1 + Math.random() * 3.5,
  drift: (Math.random() - 0.5) * 120,
  color: Math.random() > 0.55
    ? "#ffee00"
    : Math.random() > 0.4
    ? "#ffaa00"
    : "#ff5500",
  startY: Math.random() * 30,
}));

const FLAME_BLOBS = [
  { w: "80%",  h: "52%", left: "10%",  bot: "-5%", blur: 60, col: "rgba(180,20,0,0.85)",    dur: 1.8, dX: 1,  dY: 6  },
  { w: "65%",  h: "60%", left: "18%",  bot: "-8%", blur: 45, col: "rgba(230,50,0,0.8)",     dur: 1.4, dX: 2,  dY: 8  },
  { w: "50%",  h: "65%", left: "25%",  bot: "-6%", blur: 35, col: "rgba(255,100,0,0.75)",   dur: 1.1, dX: 3,  dY: 10 },
  { w: "40%",  h: "62%", left: "30%",  bot: "-4%", blur: 28, col: "rgba(255,150,0,0.7)",    dur: 0.9, dX: 4,  dY: 12 },
  { w: "30%",  h: "55%", left: "35%",  bot: "-2%", blur: 20, col: "rgba(255,200,30,0.65)",  dur: 0.75,dX: 5,  dY: 14 },
  { w: "20%",  h: "48%", left: "40%",  bot: "0%",  blur: 14, col: "rgba(255,235,80,0.55)",  dur: 0.6, dX: 3,  dY: 16 },
  { w: "12%",  h: "40%", left: "44%",  bot: "2%",  blur: 10, col: "rgba(255,255,180,0.45)", dur: 0.5, dX: 2,  dY: 18 },
];

export default function SplashFire({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"ignite" | "burn" | "text">("ignite");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t1 = setTimeout(() => setPhase("burn"), 350);
    const t2 = setTimeout(() => setPhase("text"), 750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#060000" }}
        >
          {/* Deep ambient base */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(ellipse 70% 55% at 50% 90%, rgba(200,30,0,0.55) 0%, rgba(100,5,0,0.25) 45%, transparent 70%)",
                "radial-gradient(ellipse 80% 65% at 50% 90%, rgba(240,60,0,0.7) 0%, rgba(140,10,0,0.32) 45%, transparent 70%)",
                "radial-gradient(ellipse 70% 55% at 50% 90%, rgba(200,30,0,0.55) 0%, rgba(100,5,0,0.25) 45%, transparent 70%)",
              ],
            }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Layered CSS flame blobs */}
          {FLAME_BLOBS.map((b, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{
                width: b.w,
                height: b.h,
                left: b.left,
                bottom: b.bot,
                background: `radial-gradient(ellipse 50% 80% at 50% 100%, ${b.col}, transparent 70%)`,
                filter: `blur(${b.blur}px)`,
                mixBlendMode: "screen",
              }}
              animate={{
                scaleX: [1, 1 + b.dX * 0.015, 1 - b.dX * 0.01, 1],
                scaleY: [1, 1 - b.dY * 0.01, 1 + b.dY * 0.008, 1],
                y: [0, -b.dY, b.dY * 0.5, 0],
              }}
              transition={{
                duration: b.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.07,
              }}
            />
          ))}

          {/* Sharp inner flame core */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "22%",
              height: "45%",
              left: "39%",
              bottom: "8%",
              background: "radial-gradient(ellipse 40% 70% at 50% 100%, rgba(255,255,220,0.9) 0%, rgba(255,220,60,0.7) 25%, rgba(255,160,0,0.4) 55%, transparent 78%)",
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
            animate={{
              scaleX: [1, 1.08, 0.94, 1],
              scaleY: [1, 0.96, 1.04, 1],
              y: [0, -12, 6, 0],
            }}
            transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Heat distortion haze */}
          <motion.div
            className="absolute inset-x-0 pointer-events-none"
            style={{
              bottom: "20%",
              height: "30%",
              background: "linear-gradient(to top, rgba(255,80,0,0.04) 0%, transparent 100%)",
              filter: "blur(2px)",
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Embers */}
          {EMBERS.map((e) => (
            <motion.div
              key={e.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: e.size,
                height: e.size,
                left: `${e.x}%`,
                bottom: `${20 + e.startY}%`,
                background: e.color,
                boxShadow: `0 0 ${e.size * 3.5}px ${e.color}`,
              }}
              animate={{
                y: [0, -(150 + Math.random() * 200)],
                x: [0, e.drift],
                opacity: [0, 1, 0.8, 0],
                scale: [1, 0.7, 0.3, 0],
              }}
              transition={{
                duration: e.duration,
                repeat: Infinity,
                delay: e.delay,
                ease: [0.4, 0, 0.6, 1],
              }}
            />
          ))}

          {/* Smoke wisps */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`smoke-${i}`}
              className="absolute pointer-events-none"
              style={{
                width: 80 + i * 40,
                height: 80 + i * 40,
                left: `${30 + i * 10}%`,
                top: "5%",
                borderRadius: "50%",
                background: "rgba(25,10,5,0.2)",
                filter: "blur(22px)",
              }}
              animate={{
                y: [0, -50, 0],
                x: [(i % 2 === 0 ? -1 : 1) * 15, (i % 2 === 0 ? 1 : -1) * 15, (i % 2 === 0 ? -1 : 1) * 15],
                opacity: [0, 0.5, 0],
                scale: [0.7, 1.3, 0.7],
              }}
              transition={{
                duration: 3.5 + i * 0.6,
                repeat: Infinity,
                delay: i * 0.9,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* NEXUS text */}
          <AnimatePresence>
            {phase === "text" && (
              <motion.div
                className="relative z-10 flex flex-col items-center"
                style={{ marginTop: "-5vh" }}
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.h1
                  className="font-black select-none"
                  style={{
                    fontSize: "clamp(64px, 12vw, 110px)",
                    fontFamily: "'Arial Black', Impact, sans-serif",
                    letterSpacing: "0.1em",
                    background: "linear-gradient(180deg, #ffffff 0%, #ffeeaa 12%, #ffcc00 28%, #ff8800 52%, #dd2200 80%, #880000 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                  }}
                  animate={{
                    filter: [
                      "drop-shadow(0 0 8px rgba(255,140,0,1)) drop-shadow(0 0 25px rgba(255,60,0,0.7)) drop-shadow(0 0 60px rgba(200,20,0,0.4))",
                      "drop-shadow(0 0 18px rgba(255,220,0,1)) drop-shadow(0 0 45px rgba(255,100,0,0.9)) drop-shadow(0 0 90px rgba(255,40,0,0.5))",
                      "drop-shadow(0 0 8px rgba(255,140,0,1)) drop-shadow(0 0 25px rgba(255,60,0,0.7)) drop-shadow(0 0 60px rgba(200,20,0,0.4))",
                    ],
                  }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                >
                  NEXUS
                </motion.h1>

                <motion.p
                  className="text-[11px] tracking-[0.65em] uppercase mt-3"
                  style={{ color: "rgba(255,160,40,0.9)", fontFamily: "monospace" }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  igniting...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 15%, rgba(0,0,0,0.75) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
