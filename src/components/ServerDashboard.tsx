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

const KIND_ACCENT: Record<string, string> = {
  Infraestrutura: "#c586c0",
  API: "#7aa2f7",
  Produto: "#4ec9b0",
};

function hostLabel(proj: Project): string {
  if (proj.demo) {
    try {
      return new URL(proj.demo).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }
  if (proj.repo) {
    try {
      const u = new URL(proj.repo);
      return `${u.hostname}${u.pathname}`.replace(/\/$/, "");
    } catch {
      /* fall through */
    }
  }
  return `local://${proj.node_id}`;
}

function tabStyle(active: boolean) {
  return [
    "font-mono text-[11.5px] px-4 py-2.5 rounded-t-lg whitespace-nowrap cursor-pointer transition-colors",
    active ? "bg-panel text-foreground font-semibold" : "bg-transparent text-gray-500 font-medium hover:text-gray-300",
  ].join(" ");
}

function ProjectPreview({ proj, kind, index, total }: { proj: Project; kind: string; index: number; total: number }) {
  const accent = KIND_ACCENT[kind] ?? "#7aa2f7";

  return (
    <div
      className="relative h-[220px] md:h-[260px] rounded-lg overflow-hidden border border-white/[0.06]"
      style={{
        background: `radial-gradient(120% 140% at 15% 0%, ${accent}26 0%, transparent 55%), linear-gradient(180deg, #17171a 0%, #101012 100%)`,
      }}
    >
      {/* dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />
      {/* ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-30"
        style={{ background: accent }}
      />

      <div className="relative h-full flex flex-col p-4 md:p-5">
        {/* faux browser bar */}
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-white/15 inline-block" />
            <span className="w-2 h-2 rounded-full bg-white/15 inline-block" />
            <span className="w-2 h-2 rounded-full bg-white/15 inline-block" />
          </div>
          <div className="flex-1 min-w-0 font-mono text-[10px] text-gray-500 bg-black/30 border border-white/[0.06] rounded px-2.5 py-1 truncate">
            {hostLabel(proj)}
          </div>
          <span className="font-mono text-[10px] text-gray-600 shrink-0">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>

        {/* abstract UI mockup */}
        <div className="flex-1 grid grid-cols-3 gap-2.5 md:gap-3">
          <div className="col-span-2 flex flex-col gap-2.5 md:gap-3">
            <div
              className="flex-1 rounded-md border border-white/[0.06]"
              style={{ background: `linear-gradient(135deg, ${accent}1f, transparent)` }}
            />
            <div className="h-[30%] rounded-md bg-white/[0.03] border border-white/[0.06] flex items-end gap-1 px-2.5 pb-2">
              {[40, 65, 35, 80, 55, 70, 45].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, background: `${accent}66` }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 md:gap-3">
            <div className="flex-1 rounded-md bg-white/[0.03] border border-white/[0.06]" />
            <div className="flex-1 rounded-md bg-white/[0.03] border border-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
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
            <ProjectPreview
              proj={active}
              kind={kind}
              index={Math.min(activeIdx, projects.length - 1)}
              total={projects.length}
            />

            <div className="flex justify-between items-start mt-6 mb-1.5">
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
