"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

const stack = [
  { name: "React", sub: "/ Next.js", color: "#7aa2f7", detail: "5+ anos", detailSub: "PRODUÇÃO DIÁRIA" },
  { name: "Python", sub: "/ Django", color: "#9ece6a", detail: "APIs REST", detailSub: "FASTAPI · DJANGO" },
  { name: "Kubernetes", sub: "/ Docker", color: "#4ec9b0", detail: "Cluster próprio", detailSub: "HELM · PROMETHEUS" },
  { name: "AWS", sub: "/ Azure", color: "#c586c0", detail: "Infra cloud", detailSub: "PROVISIONAMENTO" },
  { name: "Supabase", sub: "/ PostgreSQL", color: "#e9c46a", detail: "Auth + RLS", detailSub: "REALTIME DB" },
  { name: "Node.js", sub: "/ Express", color: "#f2a65a", detail: "Gateways", detailSub: "RATE LIMITING" },
  { name: "FastAPI", sub: "/ JWT", color: "#ff8a65", detail: "Microsserviços", detailSub: "OPENAPI DOCS" },
  { name: "Grafana", sub: "/ Prometheus", color: "#7ee787", detail: "Observability", detailSub: "LOKI · DASHBOARDS" },
];

function FlipCard({ item }: { item: (typeof stack)[number] }) {
  const [flipped, setFlipped] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleEnter = () => {
    clearPending();
    timeoutRef.current = setTimeout(() => setFlipped(true), 90);
  };

  const handleLeave = () => {
    clearPending();
    setFlipped(false);
  };

  return (
    <div className="[perspective:1200px] h-28">
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-[420ms] ease-out cursor-pointer"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-panel backdrop-blur-[2.5px] saturate-150 border border-glass-border rounded-[10px] flex flex-col items-center justify-center gap-2">
          <span
            className="font-display font-bold text-[13px]"
            style={{ color: item.color }}
          >
            {item.name}
          </span>
          <span className="font-mono text-[10.5px] text-gray-500">{item.sub}</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[10px] flex flex-col items-center justify-center gap-1.5 px-2.5"
          style={{ background: item.color }}
        >
          <span className="font-mono font-bold text-xs text-[#0d0d0d] text-center">{item.detail}</span>
          <span className="font-mono text-[9.5px] text-[#0d0d0d]/60 tracking-[0.06em]">{item.detailSub}</span>
        </div>
      </div>
    </div>
  );
}

export function BentoSkills() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {stack.map((s) => (
        <motion.div key={s.name} variants={item}>
          <FlipCard item={s} />
        </motion.div>
      ))}
    </motion.div>
  );
}
