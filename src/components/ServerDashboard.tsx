"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Play, GitBranch, ChevronLeft, ChevronRight } from "lucide-react";

const GAP = 24;
const VISIBLE = 2;

const projects = [
  {
    id: "vm-node-01",
    title: "Gerência Closet",
    description: "Painel de gestão multi-loja para varejo: controle de produtos, vendas, clientes e equipe em tempo real. Backend com Supabase (PostgreSQL + RLS) e autenticação integrada.",
    techs: ["Next.js 15", "React 19", "Supabase", "TypeScript", "Tailwind CSS", "TanStack Table", "Recharts"],
    demo: "https://gerencia-closet.vercel.app/",
    repo: "#"
  },
  {
    id: "vm-node-02",
    title: "Film List",
    description: "App de descoberta e favoritos de filmes com design inspirado no Netflix. Integrado à TMDB API, autenticação via Supabase e compartilhamento público de listas.",
    techs: ["Next.js", "TypeScript", "Supabase", "Zustand", "TMDB API"],
    demo: "https://film-list-sandy.vercel.app/",
    repo: "https://github.com/vityudi/film-list"
  },
  {
    id: "vm-node-03",
    title: "CoreAPI Gateway",
    description: "API RESTful escalável com arquitetura de microsserviços: gateway Express.js para roteamento e rate limiting, serviços Python para processamento de dados, autenticação JWT com refresh tokens e documentação OpenAPI automática.",
    techs: ["Python", "FastAPI", "Django", "Express.js", "JWT", "PostgreSQL", "Docker"],
    demo: null,
    repo: null
  },
  {
    id: "vm-node-04",
    title: "K8s Observability Stack",
    description: "VPS Ubuntu Server configurada com cluster Kubernetes provisionando pods via manifests e Helm charts. Stack de observabilidade completa com Prometheus para métricas, Loki para logs e Grafana para dashboards unificados.",
    techs: ["Kubernetes", "Ubuntu Server", "Helm", "Prometheus", "Loki", "Grafana"],
    demo: "http://grafana.187.77.43.240.nip.io/public-dashboards/3271776dee6845388b793d7e25daf73c",
    repo: null
  }
];

function ProjectCard({ proj }: { proj: typeof projects[number] }) {
  return (
    <div className="relative border border-glass-border bg-panel backdrop-blur-xl rounded-xl overflow-hidden flex flex-col h-[280px]">
      <span className="absolute bottom-2 right-4 font-mono font-black text-[6rem] leading-none text-white/[0.04] select-none pointer-events-none">
        {proj.id.split("-").pop()}
      </span>

      <div className="bg-black/40 px-6 py-4 flex items-center border-b border-glass-border shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,102,0.8)] animate-pulse mr-3" />
        <span className="font-mono text-sm text-white font-bold mr-auto">{proj.id}</span>
        <span className="font-sans text-xs uppercase tracking-widest text-gray-400">{proj.title}</span>
      </div>

      <div className="p-6 flex-1 flex flex-col min-h-0">
        <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
          {proj.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4 overflow-hidden">
          {proj.techs.map(tech => (
            <span key={tech} className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs font-mono text-neon-cyan shrink-0">
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3 mt-auto">
          {proj.demo && (
            <a href={proj.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-neon-green/10 text-neon-green border border-neon-green/50 py-2 px-4 rounded text-xs font-bold hover:bg-neon-green hover:text-black transition-colors">
              <Play size={14} /> START
            </a>
          )}
          {proj.repo && proj.repo !== "#" && (
            <a href={proj.repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-transparent text-gray-300 border border-glass-border py-2 px-4 rounded text-xs font-bold hover:border-white hover:text-white transition-colors">
              <GitBranch size={14} /> REPO
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ServerDashboard() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const maxIndex = projects.length - VISIBLE;

  const getStep = (): number => {
    if (!containerRef.current) return 300;
    return (containerRef.current.offsetWidth - GAP * (VISIBLE - 1)) / VISIBLE + GAP;
  };

  const snapTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrent(clamped);
    animate(x, -clamped * getStep(), {
      type: "spring",
      stiffness: 55,
      damping: 18,
      mass: 1.4,
    });
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -40) snapTo(current + 1);
    else if (info.offset.x > 40) snapTo(current - 1);
    else snapTo(current);
  };

  const cardWidth = `calc((100% - ${GAP}px) / ${VISIBLE})`;

  return (
    <div className="flex flex-col gap-6">
      <div ref={containerRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          dragElastic={1}
          style={{ x, display: "flex", gap: GAP }}
          onDragEnd={handleDragEnd}
          className="select-none"
        >
          {projects.map(proj => (
            <div key={proj.id} style={{ width: cardWidth, flexShrink: 0 }}>
              <ProjectCard proj={proj} />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => snapTo(current - 1)}
          className="w-9 h-9 flex items-center justify-center rounded border border-glass-border text-gray-400 hover:border-white hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-neon-green shadow-[0_0_6px_rgba(0,255,102,0.7)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => snapTo(current + 1)}
          className="w-9 h-9 flex items-center justify-center rounded border border-glass-border text-gray-400 hover:border-white hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
