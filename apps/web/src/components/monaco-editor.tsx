import { lazy, Suspense } from 'react';

const Editor = lazy(() => import('@monaco-editor/react').then(mod => ({ default: mod.default })));

const Loading = () => (
  <div className="flex h-full items-center justify-center bg-surface-container-lowest rounded-b-xl">
    <p className="text-xs text-outline animate-pulse">Loading editor...</p>
  </div>
);

export function MonacoEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={val => onChange?.(val ?? '')}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 1.7,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          scrollbar: {
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </Suspense>
  );
}
