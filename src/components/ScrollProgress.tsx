"use client";
import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-neon-cyan origin-left z-50 shadow-[0_0_15px_rgba(0,240,255,0.7)]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
