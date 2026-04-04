import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

export default function SplashNetflix({ visible }: { visible: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (visible) {
      vid.currentTime = 0;
      vid.muted = false;
      const p = vid.play();
      if (p !== undefined) p.catch(() => { vid.muted = true; vid.play().catch(() => {}); });
    } else {
      vid.pause();
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black overflow-hidden"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src="/netflix-intro.mp4"
            playsInline
            preload="auto"
          />
          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
