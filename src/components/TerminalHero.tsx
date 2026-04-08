"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Terminal, Server, Rocket, FileCode } from "lucide-react";

export function TerminalHero() {
  const terminalTiltRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const sectionOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const sectionScale   = useTransform(scrollY, [0, 480], [1, 0.93]);
  const termY          = useTransform(scrollY, [0, 700], [0, 70]);
  const hudY           = useTransform(scrollY, [0, 700], [0, 35]);

  const onTerminalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!terminalTiltRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    terminalTiltRef.current.style.transform =
      `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
  };

  const onTerminalMouseLeave = () => {
    if (!terminalTiltRef.current) return;
    terminalTiltRef.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <motion.section
      style={{ opacity: sectionOpacity, scale: sectionScale }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-10"
    >

      {/* Terminal — parallax wrapper */}
      <motion.div style={{ y: termY }} className="lg:col-span-2">
        {/* perspective context + mouse handlers */}
        <div
          style={{ perspective: "900px" }}
          onMouseMove={onTerminalMouseMove}
          onMouseLeave={onTerminalMouseLeave}
        >
          {/* tilt target — pure CSS, no framer-motion conflict */}
          <div
            ref={terminalTiltRef}
            style={{ transition: "transform 0.18s ease-out", willChange: "transform" }}
          >
            {/* entry animation — only opacity/y/filter, no transform conflict */}
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl overflow-hidden border border-glass-border bg-panel backdrop-blur-xl shadow-2xl relative"
            >
              <div className="bg-black/40 px-4 py-3 flex items-center justify-between border-b border-glass-border">
                <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                  <Terminal size={14} className="text-neon-cyan" />
                  ~/vitoryudi/dashboard.sh --bash
                </span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-inner"></div>
                </div>
              </div>

              <div className="p-6 md:p-8 font-mono text-[15px]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-neon-green font-bold drop-shadow-[0_0_8px_rgba(0,255,102,0.2)]">root@yudi:~#</span>
                  <span className="text-term-func">./init.sh</span>
                  <span className="text-term-string">--user</span>
                  <span className="text-white">vityudi</span>
                </div>

                <div className="mb-8 pl-4 border-l-2 border-white/10">
                  <h1 className="text-4xl md:text-5xl font-sans font-extrabold mb-2 text-white">
                    Olá, eu sou <span className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">Vitor Yudi</span>
                  </h1>
                  <h2 className="text-xl md:text-2xl text-foreground font-sans font-medium drop-shadow-md">
                    Desenvolvedor Fullstack & DevOps
                  </h2>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-neon-green font-bold">root@yudi:~#</span>
                  <span className="text-term-keyword">cat</span>
                  <span className="text-white">profile.md</span>
                </div>

                <div className="pl-4 border-l-2 border-white/10 text-gray-400 font-sans text-base leading-relaxed">
                  <span className="text-term-keyword">#</span> Missão<br />
                  Construir infraestruturas escaláveis e aplicações resilientes.<br />
                  Unir o desenvolvimento de <b>software robusto</b> com <b>visão de produto</b>,
                  entregando cadeia <br />end-to-end completa com produtos que fazem sentido.
                </div>

                <div className="flex items-center gap-2 mt-6 mb-3">
                  <span className="text-neon-green font-bold">root@yudi:~#</span>
                  <span className="text-term-keyword">wget</span>
                  <span className="text-term-string">curriculum.pdf</span>
                </div>

                <a
                  href="/cv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group ml-4 pl-4 border-l-2 border-white/10 flex items-center gap-3 w-fit hover:border-neon-cyan/40 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <span className="text-neon-cyan">Saving:</span>
                      <span>curriculum.pdf</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-px">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span
                            key={i}
                            className="inline-block w-3 h-2 bg-neon-cyan/70 group-hover:bg-neon-cyan transition-colors"
                            style={{ transitionDelay: `${i * 20}ms` }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-xs text-gray-400">100%</span>
                      <span className="font-mono text-xs text-neon-cyan font-bold group-hover:underline">
                        open ↗
                      </span>
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-neon-green font-bold">root@yudi:~#</span>
                  <span className="w-2.5 h-[1.2em] bg-neon-cyan inline-block animate-pulse"></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Side HUD — shallower parallax layer */}
      <motion.div style={{ y: hudY }}>
        <motion.div
          initial={{ opacity: 0, x: 45, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <div className="p-6 rounded-xl border border-glass-border bg-panel backdrop-blur-xl shadow-lg flex items-center gap-4 group hover:border-neon-green/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 text-neon-green flex items-center justify-center group-hover:scale-110 transition-transform">
              <Server size={24} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">System Status</div>
              <div className="text-xl font-mono font-bold text-neon-green">Online</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a href="#deploy" className="flex items-center justify-center gap-2 bg-neon-green/10 text-neon-green border border-neon-green/50 py-3 px-6 rounded-lg font-bold uppercase tracking-wider hover:bg-neon-green hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,102,0)] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)]">
              Deploy Projetos <Rocket size={18} />
            </a>
            <a href="#logs" className="flex items-center justify-center gap-2 bg-transparent text-gray-300 border border-glass-border py-3 px-6 rounded-lg font-bold uppercase tracking-wider hover:border-white hover:text-white transition-all">
              Ver Logs_ <FileCode size={18} />
            </a>
          </div>
        </motion.div>
      </motion.div>

    </motion.section>
  );
}
