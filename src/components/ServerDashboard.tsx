"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";

function guessKind(proj: Project): string {
  const techs = proj.techs.map((t) => t.toLowerCase());
  if (techs.some((t) => t.includes("kubernetes") || t.includes("docker") || t.includes("helm") || t.includes("prometheus") || t.includes("grafana"))) {
    return "Infraestrutura";
  }
  if (!proj.demo && proj.repo) return "API";
  return "Produto";
}

function tabStyle(active: boolean) {
  return [
    "font-mono text-[11.5px] px-4 py-2.5 rounded-t-lg whitespace-nowrap cursor-pointer transition-colors",
    active ? "bg-panel text-foreground font-semibold" : "bg-transparent text-gray-500 font-medium hover:text-gray-300",
  ].join(" ");
}

export function ServerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setProjects(data as Project[]);
      });
  }, []);

  if (projects.length === 0) {
    return (
      <div className="h-[280px] border border-glass-border bg-panel rounded-xl flex items-center justify-center">
        <span className="font-mono text-xs text-gray-500 animate-pulse">loading projects...</span>
      </div>
    );
  }

  const active = projects[Math.min(activeIdx, projects.length - 1)];
  const kind = guessKind(active);
  const isLive = Boolean(active.demo);

  return (
    <div className="rounded-xl overflow-hidden border border-glass-border shadow-2xl">
      {/* window chrome: traffic lights + document tabs */}
      <div className="flex items-center gap-3.5 px-2.5 pt-2.5 bg-panel-solid backdrop-blur-[2.5px] saturate-150">
        <div className="flex items-center gap-2 pl-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block" />
        </div>
        <div className="flex gap-0.5 flex-1 overflow-x-auto">
          {projects.map((p, i) => (
            <div key={p.id} onClick={() => setActiveIdx(i)} className={tabStyle(i === activeIdx)}>
              {p.node_id}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-panel backdrop-blur-[2.5px] saturate-150 px-6 py-7 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <span className="font-display font-bold text-xl md:text-[23px]">
                  {active.title}
                </span>
                <div className="flex gap-2 items-center mt-2">
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-gray-400 border border-glass-border px-2 py-0.75 rounded">
                    {kind}
                  </span>
                  <span className={`font-mono text-[10.5px] ${isLive ? "text-neon-green" : "text-gray-500"}`}>
                    {isLive ? "● EM PRODUÇÃO" : "● REPOSITÓRIO"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[13.5px] leading-relaxed text-gray-400 mt-4.5 mb-4 max-w-[64ch]">
              {active.description}
            </p>

            <div className="flex flex-wrap gap-2 items-center pt-4 border-t border-white/[0.06]">
              {active.techs.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10.5px] border border-glass-border px-2.5 py-1 rounded text-gray-300"
                >
                  {tech}
                </span>
              ))}
              <div className="ml-auto flex gap-4">
                {active.repo && (
                  <a
                    href={active.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11.5px] text-gray-500 no-underline hover:text-gray-300 transition-colors"
                  >
                    repo ↗
                  </a>
                )}
                {active.demo && (
                  <a
                    href={active.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11.5px] text-accent no-underline hover:underline"
                  >
                    acessar ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
