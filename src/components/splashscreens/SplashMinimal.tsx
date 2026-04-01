import { motion, AnimatePresence } from "motion/react";

const letters = ["N", "E", "X", "U", "S"];

export default function SplashMinimal({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#030303" }}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="flex gap-1">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl font-thin tracking-[0.3em] select-none text-white"
                  style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", letterSpacing: "0.2em" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-px w-32 origin-left"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-xs tracking-[0.6em] uppercase text-white select-none"
            >
              control panel
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
