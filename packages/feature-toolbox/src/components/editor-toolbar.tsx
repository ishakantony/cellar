import { AlignLeft, Minimize2, Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@cellar/ui';

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
      className="flex min-h-[34px] items-center gap-1 border-b border-outline-variant/20 bg-surface-container-low/80 px-2 py-1"
    >
      <Button
        type="button"
        onClick={onFormat}
        variant="ghost"
        size="sm"
        className="h-6 px-2 py-0 normal-case tracking-normal"
        title="Format JSON (2-space indent)"
      >
        <AlignLeft aria-hidden="true" className="h-3 w-3" />
        Format
      </Button>

      <Button
        type="button"
        onClick={onMinify}
        variant="ghost"
        size="sm"
        className="h-6 px-2 py-0 normal-case tracking-normal"
        title="Minify JSON (strip whitespace)"
      >
        <Minimize2 aria-hidden="true" className="h-3 w-3" />
        Minify
      </Button>

      <div className="mx-1 h-4 w-px bg-outline-variant/30" aria-hidden="true" />

      <Button
        type="button"
        onClick={handleCopy}
        variant="ghost"
        size="sm"
        className="h-6 px-2 py-0 normal-case tracking-normal"
        title="Copy editor contents to clipboard"
      >
        <Clipboard aria-hidden="true" className="h-3 w-3" />
        Copy
      </Button>
    </div>
  );
}
