export function TopBar() {
  return (
    <div className="print:hidden sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-2.5 bg-panel-solid backdrop-blur-[2.5px] saturate-150 border-b border-glass-border">
      <div className="flex items-center gap-3.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] inline-block" />
        <span className="ml-2 font-mono text-xs font-semibold text-[#d8d5cd] hidden sm:inline">
          vyudi.dev
        </span>
      </div>

      <div className="flex gap-5 sm:gap-7 font-mono text-xs text-gray-400">
        <a href="#stack" className="no-underline hover:text-accent transition-colors">Stack</a>
        <a href="#deploy" className="no-underline hover:text-accent transition-colors">Projetos</a>
        <a href="#logs" className="no-underline hover:text-accent transition-colors">Logs</a>
      </div>

      <div className="font-mono text-[11px] text-gray-500 hidden sm:block">
        UPTIME: 1847D
      </div>
    </div>
  );
}
