import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-[#39FF14]/20 blur-3xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute h-32 w-32 rounded-full border-t-2 border-r-2 border-[#39FF14]/50"
            />
            <Leaf className="h-16 w-16 text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,1)] z-10" />
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute -bottom-12 text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-[#00FF00] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]"
            >
              NEXUS
            </motion.h1>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
            className="mt-20 h-1 rounded-full bg-gradient-to-r from-[#39FF14] to-[#00FF00] shadow-[0_0_15px_rgba(57,255,20,0.8)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
