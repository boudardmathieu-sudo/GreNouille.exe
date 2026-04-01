import { motion, AnimatePresence } from "motion/react";

export default function SplashWindows({ visible }: { visible: boolean }) {
  const dots = [0, 1, 2, 3, 4];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#050510" }}
        >
          <div className="flex flex-col items-center justify-between h-full py-24 w-full">
            <div />

            <div className="flex flex-col items-center gap-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <svg width="80" height="80" viewBox="0 0 88 88" fill="none">
                  <motion.rect
                    x="4" y="4" width="36" height="36" rx="4"
                    fill="#4F6EF7"
                    initial={{ opacity: 0, x: -10, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.rect
                    x="48" y="4" width="36" height="36" rx="4"
                    fill="#7C3AED"
                    initial={{ opacity: 0, x: 10, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.rect
                    x="4" y="48" width="36" height="36" rx="4"
                    fill="#6366F1"
                    initial={{ opacity: 0, x: -10, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.rect
                    x="48" y="48" width="36" height="36" rx="4"
                    fill="#8B5CF6"
                    initial={{ opacity: 0, x: 10, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-white text-3xl font-light tracking-[0.15em] select-none"
                style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
              >
                NEXUS
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="flex gap-2"
            >
              {dots.map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: "rgba(255,255,255,0.85)" }}
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
