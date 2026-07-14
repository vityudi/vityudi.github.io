"use client";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

export function ScrollReveal({ children, delay = 0, direction = "up", className = "", once = false }: ScrollRevealProps) {
  const getInitial = () => {
    const base = { opacity: 0, scale: 0.96 };
    switch (direction) {
      case "up":    return { ...base, y: 60 };
      case "down":  return { ...base, y: -60 };
      case "left":  return { ...base, x: 60 };
      case "right": return { ...base, x: -60 };
      case "none":  return base;
      default:      return { ...base, y: 60 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        y:       { type: "spring", stiffness: 70, damping: 20, delay },
        x:       { type: "spring", stiffness: 70, damping: 20, delay },
        scale:   { type: "spring", stiffness: 70, damping: 20, delay },
        opacity: { duration: 0.55, delay, ease: "easeOut" },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
