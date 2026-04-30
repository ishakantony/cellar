import { useState, useCallback } from 'react';
import { Button, SplitPane, Textarea } from '@cellar/ui';
import { ArrowRightLeft, ClipboardCopy, Trash2, Unlock, Lock } from 'lucide-react';
import { encodeBase64, decodeBase64 } from '../lib/base64';

const PANE_RATIO_KEY = 'cellar:base64:pane-ratio';

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

      <div className="min-h-0 flex-1">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-inner">
          <div
            role="toolbar"
            aria-label="Base64 actions"
            className="flex h-11 shrink-0 items-center gap-1 border-b border-outline-variant/20 bg-surface-container-low/80 px-2 py-1"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEncode}
              disabled={!input.trim()}
              className="h-6 px-2 py-0 normal-case tracking-normal"
              title="Encode to Base64"
            >
              <Lock aria-hidden="true" className="h-3 w-3" />
              Encode
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDecode}
              disabled={!input.trim()}
              className="h-6 px-2 py-0 normal-case tracking-normal"
              title="Decode from Base64"
            >
              <Unlock aria-hidden="true" className="h-3 w-3" />
              Decode
            </Button>
            <div className="mx-1 h-4 w-px bg-outline-variant/30" aria-hidden="true" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSwap}
              disabled={!output}
              className="h-6 px-2 py-0 normal-case tracking-normal"
              title="Swap output back to input"
            >
              <ArrowRightLeft aria-hidden="true" className="h-3 w-3" />
              Swap
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!input && !output}
              className="h-6 px-2 py-0 normal-case tracking-normal"
              title="Clear all"
            >
              <Trash2 aria-hidden="true" className="h-3 w-3" />
              Clear
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className="h-6 px-2 py-0 normal-case tracking-normal"
              title="Copy output to clipboard"
            >
              <ClipboardCopy aria-hidden="true" className="h-3 w-3" />
              Copy
            </Button>
          </div>

          <SplitPane
            persistKey={PANE_RATIO_KEY}
            defaultRatio={0.5}
            className="min-h-0 flex-1"
            left={
              <section
                role="region"
                aria-label="Input"
                className="flex h-full w-full flex-col overflow-hidden"
              >
                <div className="flex h-8 shrink-0 items-center border-b border-outline-variant/10 px-4">
                  <span className="select-none text-[11px] font-medium uppercase tracking-widest text-outline/70">
                    Input
                  </span>
                </div>
                <Textarea
                  value={input}
                  onChange={onInputChange}
                  placeholder="Enter text or Base64…"
                  aria-label="Input"
                  className="min-h-0 flex-1 resize-none rounded-none bg-transparent font-mono text-sm focus:ring-0"
                />
              </section>
            }
            right={
              <section
                role="region"
                aria-label="Output"
                className="flex h-full w-full flex-col overflow-hidden bg-surface-container-lowest"
              >
                <div className="flex h-8 shrink-0 items-center border-b border-outline-variant/10 px-4">
                  <span className="select-none text-[11px] font-medium uppercase tracking-widest text-outline/70">
                    Output
                  </span>
                </div>
                {error ? (
                  <div className="flex-1 overflow-auto p-3">
                    <div
                      role="alert"
                      className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Decode Error
                      </p>
                      <p className="mt-1 font-mono text-xs">{error}</p>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={output}
                    onChange={onOutputChange ?? (() => {})}
                    placeholder="Output will appear here…"
                    aria-label="Output"
                    disabled={!output}
                    className="min-h-0 flex-1 resize-none rounded-none bg-transparent font-mono text-sm focus:ring-0"
                  />
                )}
              </section>
            }
          />
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
