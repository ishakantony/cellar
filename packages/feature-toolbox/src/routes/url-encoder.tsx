import { useState, useCallback } from 'react';
import { Button, SplitPane, Textarea } from '@cellar/ui';
import { ArrowRightLeft, ClipboardCopy, Trash2, Unlock, Lock } from 'lucide-react';

const PANE_RATIO_KEY = 'cellar:url-encoder:pane-ratio';

type OutputState =
  | { kind: 'idle' }
  | { kind: 'result'; value: string }
  | { kind: 'error'; message: string };

export function UrlEncoderPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputState>({ kind: 'idle' });

  const handleEncode = useCallback(() => {
    setOutput({ kind: 'result', value: encodeURIComponent(input) });
  }, [input]);

  const handleDecode = useCallback(() => {
    try {
      setOutput({ kind: 'result', value: decodeURIComponent(input) });
    } catch {
      setOutput({
        kind: 'error',
        message: 'URI malformed — input contains an invalid percent-sequence.',
      });
    }
  }, [input]);

  const handleSwap = useCallback(() => {
    if (output.kind !== 'result') return;
    setInput(output.value);
    setOutput({ kind: 'idle' });
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput({ kind: 'idle' });
  }, []);

  const handleCopy = useCallback(async () => {
    if (output.kind !== 'result') return;
    await navigator.clipboard.writeText(output.value);
  }, [output]);

  return (
    <section
      role="region"
      aria-label="URL Encoder"
      className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden bg-surface"
    >
      <header>
        <h1 className="text-xl font-semibold text-on-surface">URL Encoder / Decoder</h1>
        <p className="mt-1 max-w-2xl text-sm text-outline">
          Encode or decode text using <code className="font-mono text-xs">encodeURIComponent</code>{' '}
          / <code className="font-mono text-xs">decodeURIComponent</code>.
        </p>
      </header>

      <div className="min-h-0 flex-1">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-inner">
          <div
            role="toolbar"
            aria-label="URL encoder actions"
            className="flex h-11 shrink-0 items-center gap-1 border-b border-outline-variant/20 bg-surface-container-low/80 px-2 py-1"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEncode}
              disabled={!input.trim()}
              className="h-6 px-2 py-0 normal-case tracking-normal"
              title="Encode using encodeURIComponent"
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
              title="Decode using decodeURIComponent"
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
              disabled={output.kind !== 'result'}
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
              disabled={!input && output.kind === 'idle'}
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
              disabled={output.kind !== 'result'}
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
                  onChange={setInput}
                  placeholder="Enter text or URL…"
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
                {output.kind === 'error' ? (
                  <div className="flex-1 overflow-auto p-3">
                    <div
                      role="alert"
                      aria-label="Invalid encoding"
                      className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Invalid encoding
                      </p>
                      <p className="mt-1 font-mono text-xs">{output.message}</p>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={output.kind === 'result' ? output.value : ''}
                    onChange={() => {}}
                    placeholder="Result will appear here…"
                    aria-label="Output"
                    disabled={output.kind !== 'result'}
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
