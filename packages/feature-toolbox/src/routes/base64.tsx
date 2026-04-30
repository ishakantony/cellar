import { useState, useCallback } from 'react';
import { Button, Textarea } from '@cellar/ui';
import { ArrowRightLeft, ClipboardCopy, Trash2, Unlock, Lock } from 'lucide-react';
import { encodeBase64, decodeBase64 } from '../lib/base64';

export interface Base64ViewProps {
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  onOutputChange?: (value: string) => void;
}

export function Base64View({ input, output, onInputChange, onOutputChange }: Base64ViewProps) {
  const [error, setError] = useState<string | null>(null);

  const handleEncode = useCallback(() => {
    setError(null);
    onOutputChange?.(encodeBase64(input));
  }, [input, onOutputChange]);

  const handleDecode = useCallback(() => {
    setError(null);
    const result = decodeBase64(input);
    if (result.ok) {
      onOutputChange?.(result.value);
    } else {
      setError(result.error);
      onOutputChange?.('');
    }
  }, [input, onOutputChange]);

  const handleSwap = useCallback(() => {
    onInputChange(output);
    onOutputChange?.('');
  }, [output, onInputChange, onOutputChange]);

  const handleClear = useCallback(() => {
    onInputChange('');
    onOutputChange?.('');
    setError(null);
  }, [onInputChange, onOutputChange]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
  }, [output]);

  return (
    <section
      role="region"
      aria-label="Base64"
      className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden bg-surface"
    >
      <header>
        <h1 className="text-xl font-semibold text-on-surface">Base64 Encoder / Decoder</h1>
        <p className="mt-1 max-w-2xl text-sm text-outline">
          Encode text to Base64 or decode Base64 back to text.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-[1] flex-col">
          <Textarea
            value={input}
            onChange={onInputChange}
            placeholder="Enter text or Base64…"
            aria-label="Input"
            className="min-h-[120px] flex-1 resize-none font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleEncode} disabled={!input.trim()}>
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
            Encode
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDecode} disabled={!input.trim()}>
            <Unlock aria-hidden="true" className="h-3.5 w-3.5" />
            Decode
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleSwap} disabled={!output}>
            <ArrowRightLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Swap
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input && !output}>
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
            <ClipboardCopy aria-hidden="true" className="h-3.5 w-3.5" />
            Copy
          </Button>
        </div>

        <div className="flex min-h-0 flex-[1] flex-col">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
            >
              <p className="font-bold uppercase tracking-widest text-[10px]">Decode Error</p>
              <p className="mt-1 font-mono text-xs">{error}</p>
            </div>
          ) : (
            <Textarea
              value={output}
              onChange={onOutputChange ?? (() => {})}
              placeholder="Output will appear here…"
              aria-label="Output"
              disabled={!output}
              className="min-h-[120px] flex-1 resize-none font-mono text-sm"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export function Base64Page() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  return (
    <div className="h-full min-h-0 w-full">
      <Base64View
        input={input}
        output={output}
        onInputChange={setInput}
        onOutputChange={setOutput}
      />
    </div>
  );
}
