"use client";
import { useState, useEffect, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Project, GuestbookEntry, CvVersion, CvAccessToken } from "@/lib/types";
import type { Session } from "@supabase/supabase-js";
import { LogOut, Plus, Trash2, Edit2, X, Check, ExternalLink, GitBranch, GripVertical, Save, Star, Eye, EyeOff } from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectForm = {
  node_id: string;
  title: string;
  description: string;
  techs: string;
  demo: string;
  repo: string;
};

const emptyForm: ProjectForm = {
  node_id: "",
  title: "",
  description: "",
  techs: "",
  demo: "",
  repo: "",
};

function projectToForm(p: Project): ProjectForm {
  return {
    node_id: p.node_id,
    title: p.title,
    description: p.description,
    techs: p.techs.join(", "),
    demo: p.demo ?? "",
    repo: p.repo ?? "",
  };
}

function formToInsert(f: ProjectForm, sort_order: number) {
  return {
    node_id: f.node_id.trim(),
    title: f.title.trim(),
    description: f.description.trim(),
    techs: f.techs.split(",").map((t) => t.trim()).filter(Boolean),
    demo: f.demo.trim() || null,
    repo: f.repo.trim() || null,
    sort_order,
  };
}

const inputCls =
  "bg-black/40 border border-glass-border rounded px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-neon-cyan w-full placeholder:text-gray-600";

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="border border-glass-border bg-panel backdrop-blur-xl rounded-xl w-full max-w-sm">
        <div className="bg-black/40 px-5 py-3 border-b border-glass-border flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_rgba(0,255,102,0.8)]" />
          <span className="font-mono text-sm text-white font-bold">admin_auth</span>
        </div>
        <form onSubmit={handleLogin} className="p-5 flex flex-col gap-4">
          <p className="font-mono text-neon-green text-xs">
            <span className="text-gray-500">$ </span>ssh admin@yudiprojects.dev
          </p>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-gray-400">email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoFocus required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-gray-400">password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required />
          </div>
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-neon-green/10 text-neon-green border border-neon-green/50 rounded py-2 font-mono text-xs font-bold hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? "authenticating..." : "$ login"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Draggable Project Row ────────────────────────────────────────────────────

function DraggableProjectRow({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      className={`border rounded-lg p-4 flex items-start gap-3 cursor-default select-none transition-colors ${
        dragging
          ? "border-neon-cyan/40 bg-neon-cyan/[0.04] scale-[1.02]"
          : "border-glass-border bg-black/20"
      }`}
    >
      {/* Drag handle */}
      <button
        onPointerDown={(e) => controls.start(e)}
        onPointerUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
        className="mt-0.5 text-gray-600 hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="font-mono text-xs text-neon-green font-bold shrink-0">{project.node_id}</span>
          <span className="font-sans text-sm text-white font-semibold truncate">{project.title}</span>
        </div>
        <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed mb-2">{project.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.techs.map((t) => (
            <span key={t} className="font-mono text-[10px] text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/20 px-2 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors" title="Demo">
            <ExternalLink size={14} />
          </a>
        )}
        {project.repo && (
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors" title="Repo">
            <GitBranch size={14} />
          </a>
        )}
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors" title="Edit">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ─── Project Edit Form ────────────────────────────────────────────────────────

function ProjectEditForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ProjectForm;
  onSave: (f: ProjectForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (key: keyof ProjectForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="border border-neon-cyan/40 bg-black/30 rounded-lg p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-gray-400">node_id</label>
          <input value={form.node_id} onChange={set("node_id")} placeholder="vm-node-05" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-gray-400">title</label>
          <input value={form.title} onChange={set("title")} placeholder="Project Name" className={inputCls} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] text-gray-400">description</label>
        <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Short description..." className={`${inputCls} resize-none`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] text-gray-400">techs (comma-separated)</label>
        <input value={form.techs} onChange={set("techs")} placeholder="Next.js, TypeScript, Supabase" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-gray-400">demo url</label>
          <input value={form.demo} onChange={set("demo")} placeholder="https://..." className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-gray-400">repo url</label>
          <input value={form.repo} onChange={set("repo")} placeholder="https://github.com/..." className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-gray-400 border border-glass-border rounded hover:text-white hover:border-white transition-colors">
          <X size={12} /> cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.node_id.trim() || !form.title.trim()}
          className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-neon-green border border-neon-green/50 bg-neon-green/10 rounded hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
        >
          <Check size={12} /> {saving ? "saving..." : "save"}
        </button>
      </div>
    </div>
  );
}

// ─── CV Tab ───────────────────────────────────────────────────────────────────

function CvTab() {
  const [versions, setVersions] = useState<CvVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", content: "" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("cv_versions").select("*").order("created_at", { ascending: false });
    if (data) setVersions(data as CvVersion[]);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const openAdd = () => {
    setForm({ name: "", content: "" });
    setEditId(null);
    setShowAdd(true);
    setPreviewId(null);
  };

  const openEdit = (v: CvVersion) => {
    setForm({ name: v.name, content: v.content });
    setEditId(v.id);
    setShowAdd(true);
    setPreviewId(null);
  };

  const cancelForm = () => {
    setShowAdd(false);
    setEditId(null);
    setForm({ name: "", content: "" });
  };

  const saveVersion = async () => {
    if (!form.name.trim() || !form.content.trim()) return;
    setSaving(true);
    if (editId) {
      await supabase.from("cv_versions").update({ name: form.name.trim(), content: form.content.trim() }).eq("id", editId);
    } else {
      const isPrimary = versions.length === 0;
      await supabase.from("cv_versions").insert({ name: form.name.trim(), content: form.content.trim(), is_primary: isPrimary });
    }
    await load();
    cancelForm();
    setSaving(false);
  };

  const setPrimary = async (id: number) => {
    await supabase.from("cv_versions").update({ is_primary: false }).neq("id", -1);
    await supabase.from("cv_versions").update({ is_primary: true }).eq("id", id);
    await load();
  };

  const deleteVersion = async (id: number) => {
    if (!confirm("Delete this CV version?")) return;
    await supabase.from("cv_versions").delete().eq("id", id);
    setPreviewId((p) => (p === id ? null : p));
    load();
  };

  const previewVersion = versions.find((v) => v.id === previewId);

  if (loading) return <p className="font-mono text-xs text-gray-500">loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-400">{versions.length} version{versions.length !== 1 ? "s" : ""}</span>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 font-mono text-xs text-neon-green border border-neon-green/50 bg-neon-green/10 px-3 py-1.5 rounded hover:bg-neon-green hover:text-black transition-colors"
        >
          <Plus size={12} /> new version
        </button>
      </div>

      {/* Form */}
      {showAdd && (
        <div className="border border-neon-cyan/40 bg-black/30 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-gray-400">version name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Backend Focus, DevOps, Full Stack..."
              className={inputCls}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-gray-400">content (markdown)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={16}
              placeholder="# Your Name&#10;&#10;## Experience..."
              className={`${inputCls} resize-y font-mono text-[11px] leading-relaxed`}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={cancelForm} className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-gray-400 border border-glass-border rounded hover:text-white hover:border-white transition-colors">
              <X size={12} /> cancel
            </button>
            <button
              onClick={saveVersion}
              disabled={saving || !form.name.trim() || !form.content.trim()}
              className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-neon-green border border-neon-green/50 bg-neon-green/10 rounded hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
            >
              <Check size={12} /> {saving ? "saving..." : "save"}
            </button>
          </div>
        </div>
      )}

      {/* Version list */}
      <div className="flex flex-col gap-2">
        {versions.map((v) => (
          <div key={v.id} className="flex flex-col gap-0">
            <div className={`border rounded-lg px-4 py-3 flex items-center gap-3 transition-colors ${v.is_primary ? "border-neon-green/40 bg-neon-green/[0.04]" : "border-glass-border bg-black/20"}`}>
              {v.is_primary && (
                <Star size={12} className="text-neon-green shrink-0" fill="currentColor" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm text-white font-semibold">{v.name}</span>
                <span className="font-mono text-[10px] text-gray-500 ml-2">
                  {new Date(v.created_at).toLocaleDateString("pt-BR")}
                </span>
                {v.is_primary && (
                  <span className="ml-2 font-mono text-[10px] text-neon-green border border-neon-green/40 px-1.5 py-0.5 rounded">primary</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setPreviewId(previewId === v.id ? null : v.id)}
                  className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors"
                  title="Preview"
                >
                  {previewId === v.id ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {!v.is_primary && (
                  <button
                    onClick={() => setPrimary(v.id)}
                    className="p-1.5 text-gray-400 hover:text-neon-green transition-colors"
                    title="Set as primary"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button onClick={() => openEdit(v)} className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors" title="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteVersion(v.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Inline preview */}
            {previewId === v.id && previewVersion && (
              <div className="border border-t-0 border-neon-cyan/20 rounded-b-lg bg-black/40 px-6 py-5">
                <div className="flex justify-end mb-3">
                  <a
                    href={`/cv?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-xs text-neon-cyan border border-neon-cyan/40 px-3 py-1.5 rounded hover:bg-neon-cyan hover:text-black transition-colors"
                  >
                    <ExternalLink size={12} /> open full page
                  </a>
                </div>
                <div className="prose prose-invert prose-sm max-w-none font-sans">
                  <ReactMarkdown>{previewVersion.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {versions.length === 0 && !showAdd && (
          <p className="font-mono text-xs text-gray-500 text-center py-8">no CV versions yet — add one above</p>
        )}
      </div>

      {versions.length > 0 && (
        <div className="border border-glass-border rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="font-mono text-xs text-gray-400">
            public link: <span className="text-neon-cyan">/cv</span>
          </div>
          <a
            href="/cv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
          >
            <ExternalLink size={12} /> view live
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Access Tab ───────────────────────────────────────────────────────────────

function AccessTab() {
  const [tokens, setTokens] = useState<CvAccessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ value: "", label: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("cv_access_tokens")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTokens(data as CvAccessToken[]);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const add = async () => {
    if (!form.value.trim()) return;
    setSaving(true);
    await supabase.from("cv_access_tokens").insert({
      value: form.value.trim().toLowerCase(),
      label: form.label.trim() || null,
    });
    await load();
    setForm({ value: "", label: "" });
    setShowAdd(false);
    setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Remover este token de acesso?")) return;
    await supabase.from("cv_access_tokens").delete().eq("id", id);
    load();
  };

  if (loading) return <p className="font-mono text-xs text-gray-500">loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-400">
          {tokens.length} token{tokens.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 font-mono text-xs text-neon-green border border-neon-green/50 bg-neon-green/10 px-3 py-1.5 rounded hover:bg-neon-green hover:text-black transition-colors"
        >
          <Plus size={12} /> add token
        </button>
      </div>

      {showAdd && (
        <div className="border border-neon-cyan/40 bg-black/30 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-gray-400">email ou token</label>
            <input
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="recruiter@empresa.com ou s3cr3t42"
              className={inputCls}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-gray-400">label (opcional)</label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Google Recruiter"
              className={inputCls}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAdd(false); setForm({ value: "", label: "" }); }}
              className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-gray-400 border border-glass-border rounded hover:text-white hover:border-white transition-colors"
            >
              <X size={12} /> cancel
            </button>
            <button
              onClick={add}
              disabled={saving || !form.value.trim()}
              className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-neon-green border border-neon-green/50 bg-neon-green/10 rounded hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
            >
              <Check size={12} /> {saving ? "saving..." : "save"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tokens.map((t) => (
          <div key={t.id} className="border border-glass-border bg-black/20 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-sm text-neon-cyan">{t.value}</span>
              {t.label && (
                <span className="font-mono text-xs text-gray-500 ml-2">({t.label})</span>
              )}
              <span className="font-mono text-[10px] text-gray-600 ml-2">
                {new Date(t.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              title="Remove"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {tokens.length === 0 && !showAdd && (
          <p className="font-mono text-xs text-gray-500 text-center py-8">
            nenhum token cadastrado — adicione um acima
          </p>
        )}
      </div>

      <div className="border border-glass-border rounded-lg px-4 py-3">
        <p className="font-mono text-xs text-gray-400 leading-relaxed">
          visitantes precisam digitar um e-mail ou token cadastrado aqui para acessar{" "}
          <span className="text-neon-cyan">/cv</span>
        </p>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel({ session }: { session: Session }) {
  const [tab, setTab] = useState<"projects" | "guestbook" | "cv" | "access">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadProjects = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").order("sort_order");
    if (data) setProjects(data as Project[]);
  }, []);

  const loadGuestbook = useCallback(async () => {
    const { data } = await supabase.from("guestbook").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setGuestbook(data as GuestbookEntry[]);
  }, []);

  useEffect(() => {
    Promise.all([loadProjects(), loadGuestbook()]).finally(() => setLoading(false));
  }, [loadProjects, loadGuestbook]);

  // Called by Reorder.Group when user drags
  const handleReorder = (newOrder: Project[]) => {
    setProjects(newOrder);
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    await Promise.all(
      projects.map((p, i) =>
        supabase.from("projects").update({ sort_order: i + 1 }).eq("id", p.id)
      )
    );
    setOrderChanged(false);
    setSavingOrder(false);
  };

  const addProject = async (form: ProjectForm) => {
    setSaving(true);
    const nextOrder = projects.length + 1;
    await supabase.from("projects").insert(formToInsert(form, nextOrder));
    await loadProjects();
    setShowAdd(false);
    setSaving(false);
  };

  const updateProject = async (id: number, form: ProjectForm) => {
    setSaving(true);
    const current = projects.find((p) => p.id === id);
    await supabase.from("projects").update(formToInsert(form, current?.sort_order ?? 0)).eq("id", id);
    await loadProjects();
    setEditId(null);
    setSaving(false);
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    loadProjects();
  };

  const deleteGuestbook = async (id: number) => {
    await supabase.from("guestbook").delete().eq("id", id);
    loadGuestbook();
  };

  const logout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-glass-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_6px_rgba(0,255,102,0.8)]" />
          <span className="font-mono text-sm text-white">
            <span className="text-neon-green">admin</span>
            <span className="text-gray-500">@yudiprojects</span>
            <span className="text-gray-400">:~$</span>
          </span>
          <span className="font-mono text-xs text-gray-500 hidden sm:inline">{session.user.email}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 font-mono text-xs text-gray-400 border border-glass-border px-3 py-1.5 rounded hover:text-red-400 hover:border-red-400/50 transition-colors"
        >
          <LogOut size={12} /> logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-glass-border">
          {(["projects", "guestbook", "cv", "access"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono text-xs px-4 py-2 border-b-2 transition-colors ${
                tab === t ? "border-neon-cyan text-neon-cyan" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-mono text-xs text-gray-500">loading...</p>
        ) : (
          <>
            {/* ── Projects Tab ── */}
            {tab === "projects" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-400">
                      {projects.length} project{projects.length !== 1 ? "s" : ""}
                    </span>
                    {orderChanged && (
                      <button
                        onClick={saveOrder}
                        disabled={savingOrder}
                        className="flex items-center gap-1.5 font-mono text-xs text-neon-cyan border border-neon-cyan/50 bg-neon-cyan/10 px-3 py-1.5 rounded hover:bg-neon-cyan hover:text-black transition-colors disabled:opacity-50"
                      >
                        <Save size={12} /> {savingOrder ? "saving..." : "save order"}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowAdd(true); setEditId(null); }}
                    className="flex items-center gap-1.5 font-mono text-xs text-neon-green border border-neon-green/50 bg-neon-green/10 px-3 py-1.5 rounded hover:bg-neon-green hover:text-black transition-colors"
                  >
                    <Plus size={12} /> add project
                  </button>
                </div>

                {showAdd && (
                  <ProjectEditForm
                    initial={emptyForm}
                    onSave={addProject}
                    onCancel={() => setShowAdd(false)}
                    saving={saving}
                  />
                )}

                {projects.length === 0 && !showAdd ? (
                  <p className="font-mono text-xs text-gray-500 text-center py-8">
                    no projects yet — add one above
                  </p>
                ) : (
                  <>
                    {!orderChanged && (
                      <p className="font-mono text-[10px] text-gray-600 flex items-center gap-1.5">
                        <GripVertical size={10} /> drag to reorder
                      </p>
                    )}
                    <Reorder.Group
                      axis="y"
                      values={projects}
                      onReorder={handleReorder}
                      className="flex flex-col gap-3"
                    >
                      {projects.map((p) =>
                        editId === p.id ? (
                          <div key={p.id}>
                            <ProjectEditForm
                              initial={projectToForm(p)}
                              onSave={(f) => updateProject(p.id, f)}
                              onCancel={() => setEditId(null)}
                              saving={saving}
                            />
                          </div>
                        ) : (
                          <DraggableProjectRow
                            key={p.id}
                            project={p}
                            onEdit={() => { setEditId(p.id); setShowAdd(false); }}
                            onDelete={() => deleteProject(p.id)}
                          />
                        )
                      )}
                    </Reorder.Group>
                  </>
                )}
              </div>
            )}

            {/* ── Guestbook Tab ── */}
            {tab === "guestbook" && (
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-gray-400">
                  {guestbook.length} entr{guestbook.length !== 1 ? "ies" : "y"}
                </span>
                {guestbook.map((entry) => (
                  <div key={entry.id} className="border border-glass-border bg-black/20 rounded-lg px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 font-mono text-xs leading-relaxed">
                      <span className="text-neon-cyan font-bold">{entry.username}</span>
                      <span className="text-gray-500 ml-2 text-[10px]">
                        {new Date(entry.created_at).toLocaleString("pt-BR")}
                      </span>
                      <p className="text-gray-300 mt-1">{entry.message}</p>
                    </div>
                    <button onClick={() => deleteGuestbook(entry.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors shrink-0" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {guestbook.length === 0 && (
                  <p className="font-mono text-xs text-gray-500 text-center py-8">no entries yet</p>
                )}
              </div>
            )}

            {/* ── CV Tab ── */}
            {tab === "cv" && <CvTab />}

            {/* ── Access Tab ── */}
            {tab === "access" && <AccessTab />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-xs text-gray-500 animate-pulse">authenticating...</span>
      </div>
    );
  }

  return session ? <AdminPanel session={session} /> : <LoginForm />;
}
