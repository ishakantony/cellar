import { useState } from 'react';
import { Select } from '@cellar/ui';
import { CodeMirrorEditor } from '@/components/common/codemirror-editor';
import { getPrettierParser, getPrettierPluginLoaders } from '@/lib/codemirror-languages';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'shell', label: 'Shell' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
];

async function formatWithPrettier(code: string, language: string): Promise<string> {
  const parser = getPrettierParser(language);
  if (!parser) return code;

  const loaders = getPrettierPluginLoaders(language);
  const [prettier, ...plugins] = await Promise.all([
    import('prettier/standalone'),
    ...loaders.map(load => load()),
  ]);

  return prettier.format(code, {
    parser,
    plugins: plugins.map(p => (p as { default?: unknown }).default ?? p),
  });
}

export interface SnippetEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
  height?: number;
}

export function SnippetEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  disabled = false,
  height = 260,
}: SnippetEditorProps) {
  const [formatting, setFormatting] = useState(false);
  const canFormat = getPrettierParser(language) !== null;

  const handleFormat = async () => {
    setFormatting(true);
    try {
      const result = await formatWithPrettier(value, language);
      onChange(result);
    } finally {
      setFormatting(false);
    }
  };

  return (
    <div className="rounded-lg bg-surface-container overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-outline-variant/10">
        <Select
          size="sm"
          value={language}
          options={LANGUAGE_OPTIONS}
          onChange={onLanguageChange}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleFormat}
          disabled={!canFormat || formatting || disabled}
          className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {formatting ? 'Formatting…' : 'Format'}
        </button>
      </div>

      <div style={{ height }}>
        <CodeMirrorEditor value={value} onChange={onChange} language={language} />
      </div>
    </div>
  );
}
