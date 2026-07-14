import { TerminalHero } from "@/components/TerminalHero";
import { BentoSkills } from "@/components/BentoSkills";
import { ServerDashboard } from "@/components/ServerDashboard";
import { GuestbookTerminal } from "@/components/GuestbookTerminal";
import { ScrollReveal } from "@/components/ScrollReveal";

function CommandLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.14em] mb-3.5">
      <span className="text-term-keyword">$</span>{" "}
      <span className="text-term-func">ls</span>{" "}
      <span className="text-term-string">-la</span>{" "}
      <span className="text-gray-300">{children}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="max-w-240 mx-auto px-4 py-14 flex flex-col gap-14 min-h-[150vh]">
      {/* 1. Hero Module */}
      <TerminalHero />

      {/* 2. Skills Module */}
      <ScrollReveal direction="up" delay={0.2}>
        <section id="stack">
          <CommandLabel>./stack</CommandLabel>
          <BentoSkills />
        </section>
      </ScrollReveal>

      {/* 3. Projects Module */}
      <ScrollReveal direction="up" delay={0.2}>
        <section id="deploy" className="scroll-mt-24">
          <CommandLabel>./projetos_em_destaque</CommandLabel>
          <ServerDashboard />
        </section>
      </ScrollReveal>

      {/* 4. Fullstack Supabase Integration */}
      <ScrollReveal direction="up" delay={0.2}>
        <section id="logs">
          <div className="font-mono text-[11px] tracking-[0.14em] mb-3.5">
            <span className="text-term-keyword">$</span>{" "}
            <span className="text-term-func">tail</span>{" "}
            <span className="text-term-string">-f</span>{" "}
            <span className="text-gray-300">/var/log/visitors</span>
          </div>
          <GuestbookTerminal />
        </section>
      </ScrollReveal>
    </main>
  );
}
