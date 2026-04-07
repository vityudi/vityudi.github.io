"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Mock data until Supabase is hooked up
const mockLogs = [
  { id: 1, user: "guest_892", message: "Amazing portfolio! The animations are clean.", time: "10:42:05" },
  { id: 2, user: "recruiter_x", message: "Love the terminal approach. Very unique.", time: "11:15:22" },
  { id: 3, user: "dev_ops_guy", message: "sudo rm -rf /* just kidding lol", time: "14:33:01" }
];

export function GuestbookTerminal() {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState(mockLogs);
  const endRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Simulate echoing the command into the log
    const newLog = {
      id: Date.now(),
      user: "guest_" + Math.floor(Math.random() * 1000),
      message: command,
      time: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    setLogs([...logs, newLog]);
    setCommand("");
    
    // TODO: Hook up to Supabase
    // await supabase.from('visitors_log').insert([{ message: command }])
  };

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
        {logs.map((log) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id} 
            className="mb-3 leading-relaxed"
          >
            <span className="text-gray-500">[{log.time}]</span>{" "}
            <span className="text-neon-cyan font-bold">{log.user}:</span>{" "}
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
          />
          <button type="submit" className="hidden">Submit</button>
        </form>
      </div>

    </div>
  )
}
