import { TerminalHero } from "@/components/TerminalHero";
import { BentoSkills } from "@/components/BentoSkills";
import { ServerDashboard } from "@/components/ServerDashboard";
import { GuestbookTerminal } from "@/components/GuestbookTerminal";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 py-32 flex flex-col gap-40 min-h-[150vh]">
      {/* 1. Hero Module */}
      <TerminalHero />

      {/* 2. Skills Module */}
      <ScrollReveal direction="up" delay={0.2}>
        <section id="stack">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-12 uppercase tracking-wide inline-block">
            Stack_
          </h2>
          <BentoSkills />
        </section>
      </ScrollReveal>

      {/* 3. Projects Module */}
      <ScrollReveal direction="up" delay={0.2}>
        <section id="deploy">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-12 uppercase tracking-wide inline-block">
            Instâncias_Ativas
          </h2>
          <ServerDashboard />
        </section>
      </ScrollReveal>

      {/* 4. Fullstack Supabase Integration */}
      <ScrollReveal direction="up" delay={0.2}>
        <section id="logs">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-white bg-clip-text text-transparent mb-12 uppercase tracking-wide inline-block">
            /var/log/visitors
          </h2>
          <GuestbookTerminal />
        </section>
      </ScrollReveal>
    </main>
  );
}
