import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EMBER_COUNT = 22;

function useEmbers() {
  return Array.from({ length: EMBER_COUNT }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 2,
    size: 1.5 + Math.random() * 3,
    drift: (Math.random() - 0.5) * 60,
  }));
}

export default function SplashFire({ visible }: { visible: boolean }) {
  const embers = useRef(useEmbers()).current;
  const [phase, setPhase] = useState<"ignite" | "burn">("ignite");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setPhase("burn"), 500);
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
          style={{ background: "#0a0100" }}
        >
          {/* Base fire glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(ellipse 50% 40% at 50% 75%, rgba(255,60,0,0.35) 0%, rgba(180,20,0,0.1) 50%, transparent 70%)",
                "radial-gradient(ellipse 55% 45% at 50% 75%, rgba(255,80,0,0.45) 0%, rgba(200,30,0,0.15) 50%, transparent 70%)",
                "radial-gradient(ellipse 50% 40% at 50% 75%, rgba(255,60,0,0.35) 0%, rgba(180,20,0,0.1) 50%, transparent 70%)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Flame layers (CSS shapes) */}
          <div className="absolute" style={{ bottom: "25%", left: "50%", transform: "translateX(-50%)", width: 200, height: 200 }}>
            {[
              { color: "rgba(255,200,0,0.9)", scale: 0.5, blur: 8 },
              { color: "rgba(255,100,0,0.8)", scale: 0.7, blur: 12 },
              { color: "rgba(200,30,0,0.7)", scale: 0.95, blur: 16 },
              { color: "rgba(140,10,0,0.5)", scale: 1.2, blur: 20 },
            ].map((flame, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 200 * flame.scale,
                  height: 180 * flame.scale,
                  background: flame.color,
                  filter: `blur(${flame.blur}px)`,
                  borderRadius: "50% 50% 20% 20%",
                }}
                animate={{
                  scaleX: [1, 1.08, 0.95, 1.05, 1],
                  scaleY: [1, 1.05, 0.97, 1.03, 1],
                  y: [0, -5, 2, -3, 0],
                }}
                transition={{
                  duration: 0.8 + i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Embers */}
          {embers.map((ember) => (
            <motion.div
              key={ember.id}
              className="absolute rounded-full"
              style={{
                width: ember.size,
                height: ember.size,
                left: `${ember.x}%`,
                bottom: "30%",
                background: ember.size > 3 ? "#ffaa00" : "#ff6600",
                boxShadow: `0 0 ${ember.size * 2}px ${ember.size > 3 ? "#ffaa00" : "#ff4400"}`,
              }}
              animate={{
                y: [0, -(80 + Math.random() * 120)],
                x: [0, ember.drift],
                opacity: [1, 0.8, 0],
                scale: [1, 0.5, 0],
              }}
              transition={{
                duration: ember.duration,
                repeat: Infinity,
                delay: ember.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* NEXUS text */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              className="text-7xl font-black tracking-wide select-none"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                background: "linear-gradient(180deg, #fff7aa 0%, #ffcc00 25%, #ff6600 65%, #cc2200 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 12px rgba(255,120,0,0.8)) drop-shadow(0 0 30px rgba(255,60,0,0.5))",
                letterSpacing: "0.1em",
              }}
              animate={{
                filter: [
                  "drop-shadow(0 0 12px rgba(255,120,0,0.8)) drop-shadow(0 0 30px rgba(255,60,0,0.5))",
                  "drop-shadow(0 0 20px rgba(255,180,0,1)) drop-shadow(0 0 50px rgba(255,100,0,0.7))",
                  "drop-shadow(0 0 12px rgba(255,120,0,0.8)) drop-shadow(0 0 30px rgba(255,60,0,0.5))",
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              NEXUS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="text-[9px] tracking-[0.6em] uppercase"
              style={{ color: "rgba(255,120,0,0.7)", fontFamily: "monospace" }}
            >
              igniting...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
