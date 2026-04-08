"use client";
import { useState } from "react";
import { Mail, Check } from "lucide-react";

const EMAIL = "vitoryudi.artur@gmail.com";

export function StatusBar() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-7 bg-black/90 backdrop-blur border-t border-white/[0.06] flex items-center px-4 select-none">
      {/* Left — session info */}
      <div className="flex items-center gap-0 h-full shrink-0">
        <div className="flex items-center gap-1.5 bg-neon-green/90 text-black px-2.5 h-full font-mono text-[10px] font-bold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-black/40 inline-block" />
          NORMAL
        </div>
        <div className="w-0 h-0 border-t-[14px] border-b-[14px] border-l-[8px] border-t-transparent border-b-transparent border-l-neon-green/90" />
        <span className="font-mono text-[10px] text-gray-400 px-3 hidden sm:inline">
          root@yudi:<span className="text-neon-cyan">~/vitoryudi</span>
        </span>
      </div>

      {/* Center — social links (absolute so it's always truly centered) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 h-7">
        <a
          href="https://github.com/vityudi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 h-full text-gray-400 hover:text-white transition-colors group"
          title="github.com/vityudi"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
          <span className="font-mono text-[10px]">vityudi</span>
        </a>

        <span className="text-white/10">│</span>

        <a
          href="https://www.linkedin.com/in/vitoryudi/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 h-full text-gray-400 hover:text-neon-cyan transition-colors"
          title="linkedin.com/in/vitoryudi"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          <span className="font-mono text-[10px]">vitoryudi</span>
        </a>

        <span className="text-white/10">│</span>

        <button
          onClick={copyEmail}
          className="flex items-center gap-1.5 px-3 h-full text-gray-400 hover:text-neon-green transition-colors"
          title={copied ? "copied!" : EMAIL}
        >
          {copied ? <Check size={11} className="text-neon-green" /> : <Mail size={11} />}
          <span className="font-mono text-[10px]">{copied ? "copied!" : "email"}</span>
        </button>
      </div>

      {/* Right — filler to keep left content from overlapping center */}
      <div className="ml-auto shrink-0 hidden sm:flex items-center font-mono text-[10px] text-gray-600 px-3">
        utf-8
      </div>
    </div>
  );
}
