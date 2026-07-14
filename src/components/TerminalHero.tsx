"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function TerminalHero() {
  const terminalTiltRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const sectionOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const sectionScale = useTransform(scrollY, [0, 480], [1, 0.93]);
  const termY = useTransform(scrollY, [0, 700], [0, 70]);

  const onTerminalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!terminalTiltRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    terminalTiltRef.current.style.transform =
      `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  };

  const onTerminalMouseLeave = () => {
    if (!terminalTiltRef.current) return;
    terminalTiltRef.current.style.transform = "";
  };

  return (
    <motion.section style={{ opacity: sectionOpacity, scale: sectionScale }}>
      <div className="font-mono text-xs tracking-[0.12em] mb-4">
        <span className="text-term-keyword">root@vyudi</span>
        <span className="text-gray-600">:~$</span>{" "}
        <span className="text-term-func">whoami</span>{" "}
        <span className="text-term-string">--role</span>
      </div>

      <h1 className="font-display font-black text-5xl md:text-[58px] leading-[0.96] tracking-[-0.015em] m-0">
        VITOR YUDI
      </h1>

      <div className="inline-flex items-center gap-2 mt-3.5">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block" />
        <span className="font-mono font-semibold text-lg md:text-[22px] tracking-[0.08em] text-accent uppercase">
          SOFTWARE ENGINEER
        </span>
      </div>

      <p className="max-w-[72ch] text-sm leading-relaxed text-gray-400 mt-5 font-mono">
        Desenvolvedor fullstack e engenheiro DevOps com visão de produto. Projeto, construo e opero
        sistemas de ponta a ponta, traduzindo requisitos de negócio em software confiável e pronto para escalar.
      </p>

      {/* Terminal window */}
      <motion.div style={{ y: termY }} className="mt-8">
        <div
          style={{ perspective: "900px" }}
          onMouseMove={onTerminalMouseMove}
          onMouseLeave={onTerminalMouseLeave}
        >
          <div
            ref={terminalTiltRef}
            style={{ transition: "transform 0.18s ease-out" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl overflow-hidden border border-glass-border shadow-2xl"
            >
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-panel-solid backdrop-blur-[2.5px] saturate-150">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block" />
                <span className="flex-1 text-center mr-16 font-mono text-[11.5px] text-gray-400">
                  vyudi — ~/ops/status — 80×24
                </span>
              </div>
              <div className="bg-panel backdrop-blur-[2.5px] saturate-150 px-6 py-5">
                <div className="font-mono text-[13.5px] leading-[1.75]">
                  <div>
                    <span className="text-term-keyword">$</span>{" "}
                    <span className="text-term-func">nmap</span>{" "}
                    <span className="text-term-string">-sV skills</span>{" "}
                    <span className="text-gray-300">--scan-all</span>
                  </div>
                  <div className="text-gray-600">Starting scan @ vyudi.dev ...</div>
                  <div>
                    <span className="text-term-string">[+] react/next.js</span>{" "}
                    <span className="text-gray-700">.........</span>{" "}
                    <span className="text-neon-green">OPEN</span>
                  </div>
                  <div>
                    <span className="text-term-string">[+] python/django</span>{" "}
                    <span className="text-gray-700">.........</span>{" "}
                    <span className="text-neon-green">OPEN</span>
                  </div>
                  <div>
                    <span className="text-term-string">[+] kubernetes/docker</span>{" "}
                    <span className="text-gray-700">.....</span>{" "}
                    <span className="text-neon-green">OPEN</span>
                  </div>
                  <div>
                    <span className="text-term-string">[+] aws/azure</span>{" "}
                    <span className="text-gray-700">.............</span>{" "}
                    <span className="text-neon-green">OPEN</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-term-keyword">$</span>{" "}
                    <span className="text-term-func">./deploy</span>{" "}
                    <span className="text-gray-300">--env=production</span>
                    <span className="inline-block w-1.75 h-3.75 bg-foreground ml-1.5 align-[-2px] animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3 mt-6">
        <a
          href="#deploy"
          className="font-display font-extrabold text-xs bg-accent text-[#0d0d0d] px-5.5 py-3 tracking-[0.02em] no-underline"
        >
          VER PROJETOS →
        </a>
        <a
          href="/cv"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-gray-300 border border-glass-border px-5.5 py-3 no-underline hover:border-white hover:text-white transition-colors"
        >
          baixar cv ↓
        </a>
      </div>
    </motion.section>
  );
}
