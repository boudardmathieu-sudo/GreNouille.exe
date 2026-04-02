import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "> NEXUS_OS v4.2.1 — BOOT SEQUENCE STARTED",
  "> Memory integrity: 65536 blocks [PASS]",
  "> AUTH_MODULE ............. [OK]",
  "> NET_INTERFACE ........... [OK]",
  "> SENSOR_ARRAY ............ [OK]",
  "> AI_CORE ................. [OK]",
  "> ENCRYPTION .............. [OK]",
  "> Authorisation confirmée — ACCÈS AUTORISÉ",
];

export default function SplashHUD({ visible }: { visible: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);
  const hasRun = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;

    let angle = 0;
    const animateRadar = () => {
      angle = (angle + 2) % 360;
      setRadarAngle(angle);
      rafRef.current = requestAnimationFrame(animateRadar);
    };
    rafRef.current = requestAnimationFrame(animateRadar);

    BOOT_LINES.forEach((_, i) => {
      setTimeout(() => setVisibleLines(i + 1), 150 + i * 240);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = 65, cy = 65, r = 55;
  const rad = toRad(radarAngle);
  const sweepRad = toRad(radarAngle - 80);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#000d08" }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(0,255,120,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,120,0.03) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

          {/* Corner info labels */}
          <div className="absolute top-4 left-5 font-mono text-[10px]" style={{ color: "rgba(0,255,120,0.45)" }}>NEXUS-HUD v4.2.1</div>
          <motion.div className="absolute top-4 right-5 font-mono text-[10px]" style={{ color: "rgba(0,255,120,0.45)" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
          >SYS OK ●</motion.div>
          <div className="absolute bottom-4 left-5 font-mono text-[10px]" style={{ color: "rgba(0,255,120,0.35)" }}>48.8566°N / 2.3522°E</div>
          <div className="absolute bottom-4 right-5 font-mono text-[10px]" style={{ color: "rgba(0,255,120,0.35)" }}>FREQ: 2.4GHz ↑↑</div>

          <div className="relative flex items-center gap-14">
            {/* Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <svg width="130" height="130" viewBox="0 0 130 130">
                {[55, 40, 27, 14].map((rr, i) => (
                  <circle key={i} cx={cx} cy={cy} r={rr} fill="none" stroke={`rgba(0,255,120,${0.12 + i * 0.04})`} strokeWidth="1" />
                ))}
                <line x1="10" y1={cy} x2="120" y2={cy} stroke="rgba(0,255,120,0.12)" strokeWidth="1" />
                <line x1={cx} y1="10" x2={cx} y2="120" stroke="rgba(0,255,120,0.12)" strokeWidth="1" />

                <defs>
                  <radialGradient id="sweepGrad2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${cx} ${cy}) rotate(${radarAngle}) scale(${r})`}
                  >
                    <stop offset="0%" stopColor="rgba(0,255,120,0)" />
                    <stop offset="55%" stopColor="rgba(0,255,120,0.3)" />
                    <stop offset="100%" stopColor="rgba(0,255,120,0.04)" />
                  </radialGradient>
                </defs>

                <path
                  d={`M ${cx} ${cy} L ${cx + r * Math.cos(sweepRad)} ${cy + r * Math.sin(sweepRad)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)} Z`}
                  fill="url(#sweepGrad2)"
                />
                <line x1={cx} y1={cy} x2={cx + r * Math.cos(rad)} y2={cy + r * Math.sin(rad)}
                  stroke="rgba(0,255,120,0.9)" strokeWidth="1.5"
                />

                {/* Blips */}
                <motion.circle cx="80" cy="35" r="2.5" fill="#00ff78"
                  animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
                <motion.circle cx="40" cy="80" r="1.8" fill="#00ff78"
                  animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle cx="90" cy="78" r="1.5" fill="#00ff78"
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
                />
              </svg>
            </motion.div>

            {/* Boot log */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col gap-0.5"
              style={{ minWidth: 300 }}
            >
              {BOOT_LINES.map((line, i) => (
                <motion.p key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={i < visibleLines ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] font-mono"
                  style={{
                    color: i === visibleLines - 1
                      ? "#00ff78"
                      : line.includes("[OK]") || line.includes("AUTORISÉ")
                      ? "rgba(0,255,120,0.62)"
                      : "rgba(0,200,90,0.42)",
                    textShadow: i === visibleLines - 1 ? "0 0 8px rgba(0,255,120,0.7)" : "none",
                    fontWeight: line.includes("AUTORISÉ") ? "bold" : "normal",
                  }}
                >{line}</motion.p>
              ))}
              {visibleLines < BOOT_LINES.length && (
                <motion.span className="text-[11px] font-mono" style={{ color: "#00ff78" }}
                  animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                >_</motion.span>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
