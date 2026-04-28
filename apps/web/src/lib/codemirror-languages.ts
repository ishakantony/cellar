import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';

export function getLanguageExtension(language: string): Extension {
  switch (language) {
    case 'javascript':
      return javascript({ jsx: true });
    case 'typescript':
      return javascript({ typescript: true, jsx: true });
    case 'python':
      return python();
    case 'rust':
      return rust();
    case 'java':
      return java();
    case 'c':
    case 'cpp':
      return cpp();
    case 'php':
      return php();
    case 'sql':
      return sql();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'xml':
      return xml();
    case 'markdown':
      return markdown();
    default:
      return [];
  }
}

/** Languages that Prettier can format. Maps language key → Prettier parser name. */
export const PRETTIER_PARSERS: Record<string, string> = {
  javascript: 'babel',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'markdown',
  yaml: 'yaml',
};

export function getPrettierParser(language: string): string | null {
  return PRETTIER_PARSERS[language] ?? null;
}
