"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Cloud, Container, Settings, Box, Database, Zap } from "lucide-react";
import { FaReact, FaPython } from "react-icons/fa";
import { SiDjango } from "react-icons/si";

const smallSkills = [
  { name: "React / Next.js", icon: FaReact, color: "text-[#61DAFB]" },
  { name: "Vite",            icon: Zap,      color: "text-[#646CFF]" },
  { name: "Supabase",        icon: Database,  color: "text-[#3ECF8E]" },
  { name: "Node.js",         icon: Settings,  color: "text-[#339933]" },
  { name: "Python",          icon: FaPython,  color: "text-[#3776AB]" },
  { name: "Django",          icon: SiDjango,  color: "text-[#44B78B]" },
];

// DOM-direct tilt: bypasses framer-motion entirely, zero conflict with variants/stagger
function TiltCard({ children, className, maxTilt = 8 }: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateX(${(-y * maxTilt * 2).toFixed(2)}deg) rotateY(${(x * maxTilt * 2).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
  };

  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  };

  return (
    <div className="h-full" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <div
        ref={ref}
        style={{ transition: "transform 0.18s ease-out", willChange: "transform" }}
        className={className}
      >
        {children}
      </div>
    </div>
  );
}

export function BentoSkills() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "-60px" }}
      className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[180px] gap-5"
    >
      {/* Cloud Card (Large) */}
      <motion.div variants={item} className="col-span-2 row-span-2">
        <TiltCard maxTilt={5} className="h-full rounded-xl p-6 border border-glass-border bg-gradient-to-br from-panel to-black/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cloud size={120} />
          </div>
          <div className="h-full flex flex-col z-10 relative">
            <div className="flex items-center gap-2 font-sans font-semibold text-white mb-6">
              <Cloud className="text-neon-cyan" /> Cloud Providers
            </div>
            <div className="flex-1 flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2 transform transition-transform group-hover:scale-110">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,153,0,0.2)]">
                  <Cloud size={32} className="text-[#FF9900]" />
                </div>
                <span className="font-mono text-sm text-gray-300">AWS</span>
              </div>
              <div className="flex flex-col items-center gap-2 transform transition-transform group-hover:scale-110">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,137,214,0.2)]">
                  <Cloud size={32} className="text-[#0089D6]" />
                </div>
                <span className="font-mono text-sm text-gray-300">Azure</span>
              </div>
            </div>
            <div className="mt-auto text-sm text-gray-400">Infraestrutura resiliente e provisionamento escalável.</div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Containers Card (Medium) */}
      <motion.div variants={item} className="col-span-2 row-span-1">
        <TiltCard maxTilt={4} className="h-full border border-glass-border bg-panel backdrop-blur-xl rounded-xl p-6 flex flex-col group relative overflow-hidden">
          <div className="flex items-center gap-2 font-sans font-semibold text-white mb-4 relative z-10">
            <Container className="text-blue-500" /> Containers & DevOps
          </div>
          <div className="flex-1 flex items-center justify-around relative z-10">
            <div className="flex items-center gap-3">
              <Box className="text-[#2496ED] animate-[float_4s_ease-in-out_infinite]" size={36} />
              <span className="font-mono text-gray-300">Docker</span>
            </div>
            <div className="flex items-center gap-3">
              <Container className="text-[#326CE5] animate-[float_4s_ease-in-out_infinite_2s]" size={36} />
              <span className="font-mono text-gray-300">K8s</span>
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Small Cards */}
      {smallSkills.map((skill, i) => (
        <motion.div key={i} variants={item} className="col-span-1 row-span-1">
          <TiltCard maxTilt={12} className="h-full border border-glass-border bg-panel backdrop-blur-xl rounded-xl p-4 flex flex-col items-center justify-center gap-3 group cursor-default">
            <skill.icon size={32} className={`${skill.color} drop-shadow-md transition-transform duration-200 group-hover:scale-110`} />
            <span className="font-mono text-sm text-gray-300 text-center">{skill.name}</span>
          </TiltCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
