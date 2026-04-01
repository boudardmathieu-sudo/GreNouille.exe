import { motion, AnimatePresence } from "motion/react";

export default function SplashNetflix({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Subtle vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
            }}
          />

          {/* N logo */}
          <div className="relative flex items-center justify-center">
            {/* Glow behind the N */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.6, 0.3], scale: [0.4, 1.6, 1.2] }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute rounded-full"
              style={{
                width: 220,
                height: 220,
                background:
                  "radial-gradient(circle, rgba(229,9,20,0.55) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            {/* The N letter */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              style={{ originY: "50%" }}
            >
              <svg
                width="120"
                height="160"
                viewBox="0 0 120 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="nGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E50914" />
                    <stop offset="100%" stopColor="#B20710" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Left bar */}
                <rect x="4" y="0" width="28" height="160" fill="url(#nGrad)" filter="url(#glow)" rx="2" />
                {/* Diagonal */}
                <polygon points="32,0 88,160 88,100 32,0" fill="url(#nGrad)" filter="url(#glow)" />
                <polygon points="32,60 88,160 32,160" fill="url(#nGrad)" filter="url(#glow)" />
                {/* Right bar */}
                <rect x="88" y="0" width="28" height="160" fill="url(#nGrad)" filter="url(#glow)" rx="2" />
              </svg>
            </motion.div>

            {/* Shine sweep */}
            <motion.div
              initial={{ x: -160, opacity: 0 }}
              animate={{ x: 160, opacity: [0, 0.6, 0] }}
              transition={{ delay: 0.45, duration: 0.55, ease: "easeInOut" }}
              className="absolute inset-y-0 w-16 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                top: 0,
                bottom: 0,
              }}
            />
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="absolute bottom-20 text-xs tracking-[0.35em] uppercase text-white/40 select-none"
            style={{ fontFamily: "sans-serif" }}
          >
            Nexus Dashboard
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
