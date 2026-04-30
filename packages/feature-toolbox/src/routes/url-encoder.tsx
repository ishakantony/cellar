import { useState, useCallback } from 'react';
import { Button, Textarea } from '@cellar/ui';
import { ArrowRightLeft, ClipboardCopy, Trash2, Unlock, Lock } from 'lucide-react';

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

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-[1] flex-col">
          <Textarea
            value={input}
            onChange={setInput}
            placeholder="Enter text or URL…"
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwap}
            disabled={output.kind !== 'result'}
          >
            <ArrowRightLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Swap
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!input && output.kind === 'idle'}
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={output.kind !== 'result'}
          >
            <ClipboardCopy aria-hidden="true" className="h-3.5 w-3.5" />
            Copy
          </Button>
        </div>

        <div className="flex min-h-0 flex-[1] flex-col">
          {output.kind === 'error' ? (
            <div
              role="alert"
              aria-label="Invalid encoding"
              className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
            >
              <p className="font-bold uppercase tracking-widest text-[10px]">Invalid encoding</p>
              <p className="mt-1 font-mono text-xs">{output.message}</p>
            </div>
          ) : (
            <Textarea
              value={output.kind === 'result' ? output.value : ''}
              onChange={() => {}}
              placeholder="Result will appear here…"
              aria-label="Output"
              disabled={output.kind !== 'result'}
              className="min-h-[120px] flex-1 resize-none font-mono text-sm"
            />
          )}
        </div>
      </div>
    </section>
  );
}
