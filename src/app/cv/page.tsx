"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import type { CvVersion } from "@/lib/types";
import ReactMarkdown from "react-markdown";

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

// ─── CV Content ───────────────────────────────────────────────────────────────

function CvContent() {
  const params = useSearchParams();
  const versionId = params.get("v");
  const [cv, setCv] = useState<CvVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gate, setGate] = useState<"checking" | "locked" | "unlocked">("checking");

  // Check access
  useEffect(() => {
    async function checkAccess() {
      // Admin bypass — if authenticated via Supabase auth, skip gate
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

  // Fetch CV once unlocked
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

  if (notFound || !cv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs text-gray-500">no CV available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Print toolbar — hidden when printing */}
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
          onClick={() => window.print()}
          className="font-mono text-xs text-black bg-white px-4 py-1.5 rounded hover:bg-gray-200 transition-colors font-semibold"
        >
          ↓ download PDF
        </button>
      </div>

      {/* CV content */}
      <div className="max-w-3xl mx-auto px-8 py-10 print:p-0 print:max-w-none">
        <div className="cv-content">
          <ReactMarkdown>{cv.content}</ReactMarkdown>
        </div>
      </div>

      <style jsx global>{`
        .cv-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #111;
        }
        .cv-content h2 {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #111;
          border-bottom: 2px solid #111;
          padding-bottom: 0.25rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .cv-content h3 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #111;
          margin-top: 1rem;
          margin-bottom: 0.1rem;
        }
        .cv-content p {
          font-size: 0.875rem;
          color: #333;
          margin-bottom: 0.4rem;
          line-height: 1.6;
        }
        .cv-content ul {
          padding-left: 1.2rem;
          margin-bottom: 0.5rem;
        }
        .cv-content li {
          font-size: 0.875rem;
          color: #333;
          margin-bottom: 0.2rem;
          line-height: 1.5;
        }
        .cv-content strong {
          color: #111;
          font-weight: 600;
        }
        .cv-content hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 1rem 0;
        }
        .cv-content a {
          color: #2563eb;
          text-decoration: none;
        }

        @media print {
          body { background: white !important; }
          .cv-content h1 { font-size: 1.5rem; }
          .cv-content h2 { font-size: 0.85rem; margin-top: 1rem; }
          .cv-content p, .cv-content li { font-size: 0.8rem; }
          @page { margin: 1.5cm 2cm; }
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
