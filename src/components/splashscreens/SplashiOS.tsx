import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";

export default function SplashiOS({ visible }: { visible: boolean }) {
  const [showLabel, setShowLabel] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t1 = setTimeout(() => setShowLabel(true), 420);
    const t2 = setTimeout(() => setShowLoader(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000000" }}
        >
          {/* Subtle ambient */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(79,110,247,0.07) 0%, transparent 70%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="flex flex-col items-center gap-10">
            {/* App icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.55, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.34, 1.5, 0.64, 1] }}
            >
              <div className="w-32 h-32 rounded-[36px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.09), 0 24px 70px rgba(0,0,0,0.9), 0 0 80px rgba(79,110,247,0.25)",
                }}
              >
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)" }} />
                <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />
                <span className="relative z-10 text-6xl font-black select-none"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, rgba(180,205,255,0.9) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.05em",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  }}
                >N</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {showLabel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <p className="text-white text-2xl font-semibold select-none tracking-tight"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "-0.025em" }}
                  >Nexus Panel</p>
                  <p className="text-sm select-none" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                    Control Center
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showLoader && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="flex gap-1.5"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
