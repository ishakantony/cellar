import { useState, useCallback } from 'react';
import { Copy, ExternalLink, Download, X, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { AssetType } from '@cellar/shared';
import { MarkdownPreview } from '../common/markdown-preview';
import { IconButton, Modal, cn, CodeMirrorEditor } from '@cellar/ui';
interface AssetContentRendererProps {
  asset: {
    type: AssetType;
    content: string | null;
    language: string | null;
    url: string | null;
    filePath: string | null;
    fileName: string | null;
    mimeType: string | null;
    fileSize: number | null;
  };
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SnippetRenderer({
  content,
  language,
}: {
  content: string | null;
  language: string | null;
}) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content || '');
    toast.success('Copied to clipboard');
  }, [content]);

  return (
    <div className="rounded-lg bg-surface-container overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
          {language || 'plaintext'}
        </span>
        <IconButton icon={Copy} size="sm" onClick={handleCopy} label="Copy code" />
      </div>
      <div className="h-[400px]">
        <CodeMirrorEditor value={content || ''} language={language || 'plaintext'} readOnly />
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string | null }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');

  return (
    <div className="rounded-lg bg-surface-container overflow-hidden">
      <div className="flex items-center gap-1 border-b border-outline-variant/10 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all',
            activeTab === 'preview'
              ? 'bg-primary/10 text-primary'
              : 'text-outline hover:text-on-surface-variant'
          )}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('source')}
          className={cn(
            'px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all',
            activeTab === 'source'
              ? 'bg-primary/10 text-primary'
              : 'text-outline hover:text-on-surface-variant'
          )}
        >
          Source
        </button>
      </div>

      {activeTab === 'preview' ? (
        <div className="p-6">
          <MarkdownPreview content={content || ''} />
        </div>
      ) : (
        <div className="h-[400px]">
          <CodeMirrorEditor value={content || ''} language="markdown" readOnly />
        </div>
      )}
    </div>
  );
}

function LinkRenderer({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="rounded-lg bg-surface-container p-6 text-center">
        <p className="text-sm text-outline">No URL provided</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-container p-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 text-primary hover:underline"
      >
        <ExternalLink className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{url}</span>
      </a>
      <div className="mt-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </a>
      </div>
    </div>
  );
}

function ImageRenderer({
  filePath,
  fileName,
}: {
  filePath: string | null;
  fileName: string | null;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!filePath) {
    return (
      <div className="rounded-lg bg-surface-container p-6 text-center">
        <p className="text-sm text-outline">No image uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-[min(500px,70vh)] w-full rounded-lg bg-surface-container overflow-hidden cursor-zoom-in group"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={`/api/vault/files/${filePath}`}
          alt={fileName || 'Asset image'}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ZoomIn className="h-8 w-8 text-white" />
        </div>
      </div>

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        size="md"
        ariaLabel="Image preview"
      >
        <div className="relative h-[80vh] w-full">
          <img
            src={`/api/vault/files/${filePath}`}
            alt={fileName || 'Asset image'}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain rounded-lg"
          />
          <IconButton
            icon={X}
            size="sm"
            onClick={() => setLightboxOpen(false)}
            label="Close"
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
          />
        </div>
      </Modal>
    </>
  );
}

function FileRenderer({
  filePath,
  fileName,
  mimeType,
  fileSize,
}: {
  filePath: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
}) {
  if (!filePath) {
    return (
      <div className="rounded-lg bg-surface-container p-6 text-center">
        <p className="text-sm text-outline">No file uploaded</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-container p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center">
          <Download className="h-6 w-6 text-outline" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {fileName || 'Unnamed file'}
          </p>
          <p className="text-[10px] text-outline mt-0.5">
            {mimeType || 'Unknown type'} • {formatFileSize(fileSize)}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <a
          href={`/api/vault/files/${filePath}`}
          download={fileName || true}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>
    </div>
  );
}

export function AssetContentRenderer({ asset }: AssetContentRendererProps) {
  switch (asset.type) {
    case 'SNIPPET':
      return <SnippetRenderer content={asset.content} language={asset.language} />;
    case 'PROMPT':
    case 'NOTE':
      return <MarkdownRenderer content={asset.content} />;
    case 'LINK':
      return <LinkRenderer url={asset.url} />;
    case 'IMAGE':
      return <ImageRenderer filePath={asset.filePath} fileName={asset.fileName} />;
    case 'FILE':
      return (
        <FileRenderer
          filePath={asset.filePath}
          fileName={asset.fileName}
          mimeType={asset.mimeType}
          fileSize={asset.fileSize}
        />
      );
    default:
      return (
        <div className="rounded-lg bg-surface-container p-6 text-center">
          <p className="text-sm text-outline">Unsupported asset type</p>
        </div>
      );
  }
}
