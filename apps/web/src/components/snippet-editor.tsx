import { useState } from 'react';
import { CodeMirrorEditor } from '@/components/codemirror-editor';
import { getPrettierParser } from '@/lib/codemirror-languages';

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

  const [prettier, ...plugins] = await Promise.all([
    import('prettier/standalone'),
    ...(language === 'javascript'
      ? [import('prettier/plugins/babel'), import('prettier/plugins/estree')]
      : language === 'typescript'
        ? [import('prettier/plugins/typescript'), import('prettier/plugins/estree')]
        : language === 'html'
          ? [import('prettier/plugins/html')]
          : language === 'css'
            ? [import('prettier/plugins/postcss')]
            : language === 'json'
              ? [import('prettier/plugins/babel'), import('prettier/plugins/estree')]
              : language === 'markdown'
                ? [import('prettier/plugins/markdown')]
                : language === 'yaml'
                  ? [import('prettier/plugins/yaml')]
                  : []),
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
}

export function SnippetEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  disabled = false,
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
    <div className="rounded-lg overflow-hidden bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-outline-variant/10">
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          disabled={disabled}
          className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-outline focus:outline-none cursor-pointer"
        >
          {LANGUAGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleFormat}
          disabled={!canFormat || formatting || disabled}
          className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {formatting ? 'Formatting…' : 'Format'}
        </button>
      </div>

      <CodeMirrorEditor value={value} onChange={onChange} language={language} />
    </div>
  );
}
