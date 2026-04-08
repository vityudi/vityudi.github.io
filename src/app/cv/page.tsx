"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import type { CvVersion } from "@/lib/types";
import ReactMarkdown from "react-markdown";

function CvContent() {
  const params = useSearchParams();
  const versionId = params.get("v");
  const [cv, setCv] = useState<CvVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
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
  }, [versionId]);

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
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-xs text-gray-500 animate-pulse">loading cv...</span>
      </div>
    }>
      <CvContent />
    </Suspense>
  );
}
