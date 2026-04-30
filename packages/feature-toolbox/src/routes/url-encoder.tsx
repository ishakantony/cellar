import { useState } from 'react';
import { Button, Textarea } from '@cellar/ui';
import { Copy, ArrowUpDown, Check } from 'lucide-react';

type OutputState =
  | { kind: 'idle' }
  | { kind: 'result'; value: string }
  | { kind: 'error'; message: string };

export function UrlEncoderPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputState>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);

  function handleEncode() {
    setOutput({ kind: 'result', value: encodeURIComponent(input) });
  }

  function handleDecode() {
    try {
      setOutput({ kind: 'result', value: decodeURIComponent(input) });
    } catch {
      setOutput({
        kind: 'error',
        message: 'URI malformed — input contains an invalid percent-sequence.',
      });
    }
  }

  function handleCopy() {
    if (output.kind !== 'result') return;
    navigator.clipboard.writeText(output.value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleSwap() {
    if (output.kind !== 'result') return;
    setInput(output.value);
    setOutput({ kind: 'idle' });
  }

  return (
    <section
      role="region"
      aria-label="URL Encoder"
      className="flex h-full min-h-0 w-full flex-col space-y-4 overflow-auto bg-surface"
    >
      <header>
        <h1 className="text-xl font-semibold text-on-surface">URL Encoder / Decoder</h1>
        <p className="mt-1 max-w-2xl text-sm text-outline">
          Encode or decode text using <code className="font-mono text-xs">encodeURIComponent</code>{' '}
          / <code className="font-mono text-xs">decodeURIComponent</code>.
        </p>
      </header>

      <div className="flex max-w-2xl flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url-encoder-input" className="text-xs font-medium text-on-surface/70">
            Input
          </label>
          <Textarea
            id="url-encoder-input"
            value={input}
            onChange={setInput}
            placeholder="Paste text to encode or decode…"
            rows={5}
            className="font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="filled"
            size="sm"
            onClick={handleEncode}
            disabled={input.trim() === ''}
          >
            Encode
          </Button>
          <Button
            type="button"
            variant="outlined"
            size="sm"
            onClick={handleDecode}
            disabled={input.trim() === ''}
          >
            Decode
          </Button>
        </div>

        {output.kind === 'error' && (
          <div
            role="alert"
            aria-label="Invalid encoding"
            className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-error shadow-sm shadow-black/10"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest">Invalid encoding</p>
            <p className="mt-1 text-xs leading-relaxed">{output.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-on-surface/70">Output</label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 py-0 normal-case tracking-normal"
                onClick={handleSwap}
                disabled={output.kind !== 'result'}
                title="Move output to input"
              >
                <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                Swap
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 py-0 normal-case tracking-normal"
                onClick={handleCopy}
                disabled={output.kind !== 'result'}
                title="Copy output"
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-3 w-3 text-primary" />
                ) : (
                  <Copy aria-hidden="true" className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
          <textarea
            readOnly
            value={output.kind === 'result' ? output.value : ''}
            rows={5}
            aria-label="Encoded/decoded output"
            placeholder="Result will appear here…"
            className="w-full resize-y rounded-lg bg-surface-container px-4 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
    </section>
  );
}
