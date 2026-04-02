import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";

export default function SplashApple({ visible }: { visible: boolean }) {
  const [showBar, setShowBar] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setShowBar(true), 600);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000000" }}
        >
          <div className="flex flex-col items-center gap-16">
            {/* N drawn with Apple-style clean line */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.15, 0.64, 1] }}
            >
              <svg width="78" height="78" viewBox="0 0 78 78" fill="none">
                <motion.path
                  d="M20 62 L20 16 L39 44 L58 16 L58 62"
                  stroke="white"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-white text-xl font-semibold tracking-tight select-none"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "-0.025em" }}
              >Nexus Panel</p>

              <AnimatePresence>
                {showBar && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full overflow-hidden"
                    style={{ width: 170, height: 3, background: "rgba(255,255,255,0.14)" }}
                  >
                    <motion.div className="h-full rounded-full"
                      style={{ background: "rgba(255,255,255,0.9)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.0, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
