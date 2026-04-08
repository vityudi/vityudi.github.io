"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { GuestbookEntry } from "@/lib/types";

export function GuestbookTerminal() {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<GuestbookEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prevLogsLength = useRef(0);

  // Initial fetch
  useEffect(() => {
    supabase
      .from("guestbook")
      .select("*")
      .order("created_at")
      .limit(50)
      .then(({ data }) => {
        if (data) setLogs(data as GuestbookEntry[]);
      });
  }, []);

  // Realtime subscription — dedup by id to não duplicar o próprio submit
  useEffect(() => {
    const channel = supabase
      .channel("guestbook_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook" },
        (payload) => {
          const entry = payload.new as GuestbookEntry;
          setLogs((prev) =>
            prev.some((l) => l.id === entry.id) ? prev : [...prev, entry]
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Scroll to bottom only when a new entry is added after initial load
  useEffect(() => {
    if (logs.length > prevLogsLength.current && prevLogsLength.current > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLogsLength.current = logs.length;
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = command.trim();
    if (!msg || submitting) return;

    setSubmitting(true);
    setCommand("");
    const username = "guest_" + Math.floor(Math.random() * 1000);
    const { data } = await supabase
      .from("guestbook")
      .insert({ username, message: msg })
      .select()
      .single();

    // Adiciona imediatamente sem esperar o evento realtime
    if (data) {
      setLogs((prev) =>
        prev.some((l) => l.id === (data as GuestbookEntry).id)
          ? prev
          : [...prev, data as GuestbookEntry]
      );
    }
    setSubmitting(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour12: false });

  return (
    <div className="rounded-xl overflow-hidden border border-glass-border bg-panel backdrop-blur-xl shadow-2xl flex flex-col h-[400px]">

      {/* Header */}
      <div className="bg-black/40 px-4 py-3 flex items-center justify-between border-b border-glass-border">
        <span className="text-xs text-gray-400 font-mono">live_visitor_stream - tail -f /var/log/visitors</span>
        <span className="text-xs text-neon-green flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span> DB Connected
        </span>
      </div>

      {/* Log Output Area */}
      <div className="flex-1 p-6 overflow-y-auto font-mono text-sm">
        {logs.length === 0 && (
          <span className="text-gray-600 text-xs">waiting for entries...</span>
        )}
        {logs.map((log) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id}
            className="mb-3 leading-relaxed"
          >
            <span className="text-gray-500">[{formatTime(log.created_at)}]</span>{" "}
            <span className="text-neon-cyan font-bold">{log.username}:</span>{" "}
            <span className="text-gray-300">{log.message}</span>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/60 border-t border-glass-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 font-mono">
          <span className="text-neon-green font-bold shrink-0">guest@yudi:~#</span>
          <span className="text-term-keyword shrink-0">echo</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder='"Your message here" >> /var/log/visitors'
            className="flex-1 bg-transparent border-none outline-none text-term-string placeholder:text-gray-600 focus:ring-0 w-full"
            autoComplete="off"
            spellCheck="false"
            disabled={submitting}
          />
          <button type="submit" className="hidden">Submit</button>
        </form>
      </div>

    </div>
  );
}
