import { AlignLeft, Minimize2, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

export interface EditorToolbarProps {
  /** Current editor text — used by Copy and the format/minify callbacks. */
  value: string;
  onFormat: () => void;
  onMinify: () => void;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function EditorToolbar({ value, onFormat, onMinify }: EditorToolbarProps) {
  async function handleCopy() {
    const ok = await copyToClipboard(value);
    if (ok) toast.success('Copied to clipboard');
    else toast.error('Could not copy to clipboard');
  }

  return (
    <div
      role="toolbar"
      aria-label="Editor actions"
      className="flex items-center gap-1 border-b border-outline-variant/20 bg-surface-container-lowest px-2 py-1 min-h-[30px]"
    >
      <button
        type="button"
        onClick={onFormat}
        className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-outline hover:bg-surface-container hover:text-on-surface cursor-pointer transition-colors"
        title="Format JSON (2-space indent)"
      >
        <AlignLeft aria-hidden="true" className="h-3 w-3" />
        Format
      </button>

      <button
        type="button"
        onClick={onMinify}
        className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-outline hover:bg-surface-container hover:text-on-surface cursor-pointer transition-colors"
        title="Minify JSON (strip whitespace)"
      >
        <Minimize2 aria-hidden="true" className="h-3 w-3" />
        Minify
      </button>

      <div className="mx-1 h-4 w-px bg-outline-variant/30" aria-hidden="true" />

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-outline hover:bg-surface-container hover:text-on-surface cursor-pointer transition-colors"
        title="Copy editor contents to clipboard"
      >
        <Clipboard aria-hidden="true" className="h-3 w-3" />
        Copy
      </button>
    </div>
  );
}
