"use client";

import { useState, useEffect } from "react";
import {
  X,
  Pencil,
  Trash2,
  Save,
  Copy,
  ExternalLink,
  Eye,
  Code,
  Download,
} from "lucide-react";
import {
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  Braces,
} from "lucide-react";
import { AssetType } from "@/generated/prisma/enums";
import { MonacoEditor } from "./monaco-editor";
import { MarkdownPreview } from "./markdown-preview";
import { FileDropzone } from "./file-dropzone";
import { createAsset, updateAsset } from "@/app/actions/assets";

const TYPE_CONFIG: Record<
  AssetType,
  {
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    iconWrap: string;
    defaultLanguage: string;
  }
> = {
  SNIPPET: {
    icon: Braces,
    badge: "text-primary bg-primary/10",
    iconWrap: "bg-primary/10 text-primary",
    defaultLanguage: "javascript",
  },
  PROMPT: {
    icon: Terminal,
    badge: "text-tertiary bg-tertiary/10",
    iconWrap: "bg-tertiary-container/20 text-tertiary",
    defaultLanguage: "markdown",
  },
  NOTE: {
    icon: StickyNote,
    badge: "text-amber-400 bg-amber-500/10",
    iconWrap: "bg-amber-500/10 text-amber-400",
    defaultLanguage: "markdown",
  },
  LINK: {
    icon: LinkIcon,
    badge: "text-cyan-400 bg-cyan-500/10",
    iconWrap: "bg-cyan-500/10 text-cyan-400",
    defaultLanguage: "plaintext",
  },
  IMAGE: {
    icon: ImageIcon,
    badge: "text-rose-400 bg-rose-500/10",
    iconWrap: "bg-rose-500/10 text-rose-400",
    defaultLanguage: "plaintext",
  },
  FILE: {
    icon: FileText,
    badge: "text-violet-400 bg-violet-500/10",
    iconWrap: "bg-violet-500/10 text-violet-400",
    defaultLanguage: "plaintext",
  },
};

type Asset = {
  id: string;
  type: AssetType;
  title: string;
  description?: string | null;
  content?: string | null;
  language?: string | null;
  url?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  updatedAt: Date;
};

export function AssetDrawer({
  open,
  onClose,
  asset,
  mode,
  defaultType,
  onSaved,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  asset?: Asset | null;
  mode: "view" | "edit" | "create";
  defaultType?: AssetType;
  onSaved?: () => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(mode === "edit" || mode === "create");
  const [title, setTitle] = useState(asset?.title ?? "");
  const [content, setContent] = useState(asset?.content ?? "");
  const [language, setLanguage] = useState(asset?.language ?? "javascript");
  const [url, setUrl] = useState(asset?.url ?? "");
  const [type, setType] = useState<AssetType>(
    asset?.type ?? defaultType ?? "SNIPPET"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // File upload state
  const [fileData, setFileData] = useState<{
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null>(null);

  useEffect(() => {
    if (asset) {
      setTitle(asset.title);
      setContent(asset.content ?? "");
      setLanguage(asset.language ?? "javascript");
      setUrl(asset.url ?? "");
      setType(asset.type);
    } else {
      setTitle("");
      setContent("");
      setLanguage("javascript");
      setUrl("");
      setType(defaultType ?? "SNIPPET");
      setFileData(null);
    }
    setEditing(mode === "edit" || mode === "create");
    setShowPreview(false);
  }, [asset, mode, defaultType]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      if (mode === "create") {
        await createAsset({
          type,
          title,
          content: ["SNIPPET", "PROMPT", "NOTE"].includes(type)
            ? content
            : undefined,
          language: type === "SNIPPET" ? language : undefined,
          url: type === "LINK" ? url : undefined,
          filePath: fileData?.filePath,
          fileName: fileData?.fileName,
          mimeType: fileData?.mimeType,
          fileSize: fileData?.fileSize,
        });
      } else if (asset) {
        await updateAsset(asset.id, {
          title,
          content: ["SNIPPET", "PROMPT", "NOTE"].includes(type)
            ? content
            : undefined,
          language: type === "SNIPPET" ? language : undefined,
          url: type === "LINK" ? url : undefined,
        });
      }
      setEditing(false);
      onSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (mode === "create") {
      onClose();
    } else {
      setEditing(false);
      setTitle(asset?.title ?? "");
      setContent(asset?.content ?? "");
      setLanguage(asset?.language ?? "javascript");
      setUrl(asset?.url ?? "");
    }
  }

  if (!open) return null;

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const isTextType = ["SNIPPET", "PROMPT", "NOTE"].includes(type);
  const isFileType = ["IMAGE", "FILE"].includes(type);
  const isLink = type === "LINK";
  const isMarkdown = type === "PROMPT" || type === "NOTE";
  const editorLanguage =
    type === "SNIPPET" ? language : isMarkdown ? "markdown" : "plaintext";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        style={{ backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[680px] flex flex-col z-50 bg-surface-container-low shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconWrap}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-base font-bold text-slate-100 border-none focus:ring-0 focus:outline-none p-0 placeholder:text-outline/50"
                  placeholder="Asset title..."
                  autoFocus
                />
              ) : (
                <h2 className="text-base font-bold text-slate-100 truncate leading-tight">
                  {title}
                </h2>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {mode === "create" ? (
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="SNIPPET">Snippet</option>
                    <option value="PROMPT">Prompt</option>
                    <option value="NOTE">Note</option>
                    <option value="LINK">Link</option>
                    <option value="IMAGE">Image</option>
                    <option value="FILE">File</option>
                  </select>
                ) : (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config.badge}`}
                  >
                    {type}
                  </span>
                )}
                {type === "SNIPPET" && editing && (
                  <input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-surface-container border border-white/5 text-outline w-24 focus:ring-1 focus:ring-primary/50"
                    placeholder="language"
                  />
                )}
                {type === "SNIPPET" && !editing && asset?.language && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline bg-surface-container px-2 py-0.5 rounded border border-white/5">
                    {asset.language}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4 shrink-0">
            {mode !== "create" && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all border border-transparent hover:border-white/10"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {mode !== "create" && onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-outline hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isTextType && (
            <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6 pt-2">
              {/* Preview toggle for markdown types */}
              {isMarkdown && (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                      !showPreview
                        ? "text-primary bg-primary/10"
                        : "text-outline hover:text-on-surface-variant"
                    }`}
                  >
                    <Code className="h-3 w-3" />
                    Code
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                      showPreview
                        ? "text-primary bg-primary/10"
                        : "text-outline hover:text-on-surface-variant"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                </div>
              )}
              <div
                className="flex-1 overflow-hidden rounded-xl flex flex-col"
                style={{ minHeight: 0 }}
              >
                {/* Mac-style editor chrome */}
                <div className="flex items-center gap-2 px-4 h-9 bg-surface-bright border-b border-white/5 rounded-t-xl select-none shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
                  </div>
                  <span className="flex-1 text-center text-[11px] text-outline font-mono">
                    {title || "untitled"}
                  </span>
                  <span className="text-[10px] text-outline/60 font-mono">
                    {editorLanguage}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden rounded-b-xl bg-surface-container-lowest">
                  {showPreview && isMarkdown ? (
                    <MarkdownPreview content={content} />
                  ) : (
                    <MonacoEditor
                      value={content}
                      onChange={editing ? setContent : undefined}
                      language={editorLanguage}
                      readOnly={!editing}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {isLink && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <LinkIcon className="h-7 w-7" />
              </div>
              <div className="text-center w-full max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
                  URL
                </p>
                {editing ? (
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-surface-container ghost-border rounded-lg px-4 py-3 text-sm font-mono text-slate-200 focus:ring-1 focus:ring-primary/50 border-none"
                    placeholder="https://example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 bg-surface-container ghost-border rounded-lg px-4 py-3">
                    <LinkIcon className="h-4 w-4 text-outline shrink-0" />
                    <p className="text-sm font-mono text-slate-200 break-all text-left flex-1">
                      {url}
                    </p>
                  </div>
                )}
              </div>
              {!editing && url && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container ghost-border rounded text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary/20 hover:bg-primary-container/40 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Link
                  </a>
                </div>
              )}
            </div>
          )}

          {isFileType && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
              {mode === "create" || (!asset?.filePath && editing) ? (
                <FileDropzone
                  onUpload={setFileData}
                  accept={type === "IMAGE" ? "image/*" : undefined}
                />
              ) : asset?.filePath ? (
                <>
                  {type === "IMAGE" && asset.mimeType?.startsWith("image/") ? (
                    <img
                      src={`/api/files/${asset.filePath}`}
                      alt={asset.title}
                      className="max-h-80 max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      {asset.fileName}
                    </p>
                    <p className="text-[10px] text-outline">
                      {asset.mimeType}
                      {asset.fileSize &&
                        ` • ${(asset.fileSize / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                  <a
                    href={`/api/files/${asset.filePath}`}
                    download={asset.fileName}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary/20 hover:bg-primary-container/40 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Edit/Create footer */}
        {editing && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0 gap-2">
            {saveError ? (
              <p className="text-xs text-error">{saveError}</p>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container/30 hover:bg-primary-container/50 border border-primary/30 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
