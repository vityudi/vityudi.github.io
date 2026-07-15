"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import type { CvVersion } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import { Download, Printer } from "lucide-react";

// ─── Access Gate ──────────────────────────────────────────────────────────────

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [credential, setCredential] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) return;
    setLoading(true);
    setError("");

    const { data: valid, error: rpcError } = await supabase.rpc("check_cv_token", {
      credential: credential.trim(),
    });

    if (rpcError || !valid) {
      setError("acesso negado — credencial inválida");
      setLoading(false);
      return;
    }

    localStorage.setItem("cv_access", "1");
    onUnlock();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-xl w-full max-w-sm">
        <div className="bg-black/40 px-5 py-3 border-b border-white/10 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          <span className="font-mono text-sm text-white font-bold">cv_auth</span>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <p className="font-mono text-yellow-400 text-xs mb-1">
              <span className="text-gray-500">$ </span>curl --auth curriculum.pdf
            </p>
            <p className="font-mono text-gray-500 text-[11px] leading-relaxed">
              acesso restrito — digite o seu e-mail ou<br />o token fornecido para continuar
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-gray-400">email ou token:</label>
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="nome@empresa.com ou s3cr3t"
              className="bg-black/40 border border-white/10 rounded px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-yellow-400/60 w-full placeholder:text-gray-600"
              autoFocus
              autoComplete="off"
            />
          </div>
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !credential.trim()}
            className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/50 rounded py-2 font-mono text-xs font-bold hover:bg-yellow-400 hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? "verificando..." : "$ acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Markdown helpers ─────────────────────────────────────────────────────────

type ParsedCv = {
  name: string | null;
  tagline: string | null;
  contactLine: string | null;
  body: string;
};

/**
 * Pull the leading `# Name` and an optional contact/tagline line out of the
 * markdown so we can render them in a styled hero, leaving the rest for
 * ReactMarkdown.
 */
function parseCv(content: string): ParsedCv {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let name: string | null = null;
  let tagline: string | null = null;
  let contactLine: string | null = null;
  let i = 0;

  // skip blank lines
  while (i < lines.length && lines[i].trim() === "") i++;

  if (i < lines.length && /^#\s+/.test(lines[i])) {
    name = lines[i].replace(/^#\s+/, "").trim();
    i++;
  }

  // optional second line: tagline (non-heading, non-empty)
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length && lines[i].trim() && !/^#/.test(lines[i]) && !/^[-*_]{3,}\s*$/.test(lines[i])) {
    const candidate = lines[i].trim();
    // heuristic: if line contains @ or http or |, treat as contact, otherwise tagline
    if (/@|https?:\/\/|\|/.test(candidate)) {
      contactLine = candidate;
    } else {
      tagline = candidate;
    }
    i++;
  }

  // optional contact line right after tagline
  while (i < lines.length && lines[i].trim() === "") i++;
  if (
    !contactLine &&
    i < lines.length &&
    lines[i].trim() &&
    !/^#/.test(lines[i]) &&
    /@|https?:\/\/|\|/.test(lines[i])
  ) {
    contactLine = lines[i].trim();
    i++;
  }

  // skip a leading horizontal rule if present
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length && /^[-*_]{3,}\s*$/.test(lines[i])) i++;

  const body = lines.slice(i).join("\n").trim();
  return { name, tagline, contactLine, body };
}

// ─── CV Content ───────────────────────────────────────────────────────────────

function CvContent() {
  const params = useSearchParams();
  const versionId = params.get("v");
  const [cv, setCv] = useState<CvVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gate, setGate] = useState<"checking" | "locked" | "unlocked">("checking");
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setGate("unlocked");
        return;
      }
      if (localStorage.getItem("cv_access") === "1") {
        setGate("unlocked");
        return;
      }
      setGate("locked");
    }
    checkAccess();
  }, []);

  useEffect(() => {
    if (gate !== "unlocked") return;
    async function fetchCv() {
      let query = supabase.from("cv_versions").select("*");
      if (versionId) {
        query = query.eq("id", versionId);
      } else {
        query = query.eq("is_primary", true);
      }
      const { data } = await query.limit(1).single();
      if (data) {
        setCv(data as CvVersion);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    fetchCv();
  }, [gate, versionId]);

  const parsed = useMemo<ParsedCv | null>(
    () => (cv ? parseCv(cv.content) : null),
    [cv]
  );

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 50);
  };

  if (gate === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="font-mono text-xs text-gray-500 animate-pulse">verificando acesso...</span>
      </div>
    );
  }

  if (gate === "locked") {
    return <AccessGate onUnlock={() => setGate("unlocked")} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-xs text-gray-500 animate-pulse">loading cv...</span>
      </div>
    );
  }

  if (notFound || !cv || !parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs text-gray-500">no CV available</p>
      </div>
    );
  }

  return (
    <div className="cv-page min-h-screen bg-zinc-100 text-black">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-white">
            <span className="text-emerald-400">cv</span>
            <span className="text-gray-500">@yudiprojects</span>
            {!cv.is_primary && (
              <span className="ml-2 text-yellow-400 text-[10px]">preview: {cv.name}</span>
            )}
          </span>
        </div>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="group inline-flex items-center gap-2 font-mono text-xs text-black bg-white px-4 py-1.5 rounded hover:bg-emerald-300 transition-colors font-semibold disabled:opacity-60"
        >
          {printing ? (
            <>
              <Printer className="w-3.5 h-3.5 animate-pulse" />
              preparando…
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 group-hover:translate-y-px transition-transform" />
              download PDF
            </>
          )}
        </button>
      </div>

      {/* Page surface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 print:p-0 print:max-w-none">
        <article className="cv-paper bg-white rounded-2xl ring-1 ring-zinc-200 shadow-sm overflow-hidden print:rounded-none print:ring-0 print:shadow-none">
          {/* Hero */}
          <header className="cv-hero px-8 sm:px-12 pt-8 pb-2 print:px-0 print:pt-0">
            {parsed.name && <h1 className="cv-name">{parsed.name}</h1>}
            {parsed.tagline && <p className="cv-tagline">{parsed.tagline}</p>}
            {parsed.contactLine && (
              <p className="cv-contact">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <>{children}</>,
                    a: ({ href, children }) => (
                      <a href={href ?? "#"}>{children}</a>
                    ),
                  }}
                >
                  {parsed.contactLine}
                </ReactMarkdown>
              </p>
            )}
          </header>

          {/* Body */}
          <div className="cv-content px-8 sm:px-12 pb-10 print:px-0 print:pb-0">
            <ReactMarkdown>{parsed.body}</ReactMarkdown>
          </div>
        </article>
      </div>

      <style jsx global>{`
        .cv-page {
          font-family: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
        }
        .cv-name {
          font-size: 1.35rem;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.01em;
        }
        .cv-tagline {
          font-size: 0.85rem;
          font-weight: 700;
          color: #000;
          margin-top: 0.15rem;
        }
        .cv-contact {
          font-size: 0.72rem;
          color: #000;
          margin-top: 0.3rem;
        }
        .cv-contact a {
          color: #000;
          text-decoration: underline;
        }
        .cv-content {
          color: #000;
        }
        .cv-content h1 {
          font-size: 1rem;
          font-weight: 700;
          margin-top: 0.75rem;
          margin-bottom: 0.3rem;
          color: #000;
        }
        .cv-content h2 {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #000;
          margin-top: 0.85rem;
          margin-bottom: 0.35rem;
        }
        .cv-content h2 + * {
          margin-top: 0;
        }
        .cv-content h3 {
          font-size: 0.78rem;
          font-weight: 700;
          color: #000;
          margin-top: 0.4rem;
          margin-bottom: 0.05rem;
        }
        .cv-content h4 {
          font-size: 0.7rem;
          font-weight: 600;
          color: #000;
          margin-bottom: 0.15rem;
        }
        .cv-content p {
          font-size: 0.72rem;
          color: #000;
          margin-bottom: 0.3rem;
          line-height: 1.4;
        }
        .cv-content ul {
          list-style: disc;
          padding-left: 1.1rem;
          margin-bottom: 0.3rem;
        }
        .cv-content ul > li {
          font-size: 0.72rem;
          color: #000;
          margin-bottom: 0.1rem;
          line-height: 1.4;
        }
        .cv-content ol {
          padding-left: 1.1rem;
          margin-bottom: 0.3rem;
        }
        .cv-content ol > li {
          font-size: 0.72rem;
          color: #000;
          margin-bottom: 0.1rem;
          line-height: 1.4;
        }
        .cv-content strong {
          color: #000;
          font-weight: 700;
        }
        .cv-content em {
          color: #000;
        }
        .cv-content code {
          font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
          font-size: 0.82em;
          background: rgba(0, 0, 0, 0.05);
          padding: 0.1em 0.4em;
          border-radius: 4px;
          color: #000;
        }
        .cv-content blockquote {
          border-left: 3px solid #d4d4d8;
          padding: 0.1rem 0 0.1rem 0.9rem;
          color: #000;
          font-style: italic;
          margin: 0.6rem 0;
        }
        .cv-content hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 0.75rem 0;
        }
        .cv-content a {
          color: #000;
          text-decoration: underline;
        }

        @media print {
          html, body {
            background: white !important;
          }
          .cv-page {
            background: white !important;
          }
          .cv-paper {
            box-shadow: none !important;
            border: none !important;
          }
          @page { margin: 1.3cm 1.6cm; }
        }
      `}</style>
    </div>
  );
}

export default function CvPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="font-mono text-xs text-gray-500 animate-pulse">loading cv...</span>
      </div>
    }>
      <CvContent />
    </Suspense>
  );
}
