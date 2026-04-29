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

type PluginLoader = () => Promise<unknown>;

const PRETTIER_PLUGIN_LOADERS: Record<string, PluginLoader[]> = {
  javascript: [() => import('prettier/plugins/babel'), () => import('prettier/plugins/estree')],
  typescript: [
    () => import('prettier/plugins/typescript'),
    () => import('prettier/plugins/estree'),
  ],
  json: [() => import('prettier/plugins/babel'), () => import('prettier/plugins/estree')],
  html: [() => import('prettier/plugins/html')],
  css: [() => import('prettier/plugins/postcss')],
  markdown: [() => import('prettier/plugins/markdown')],
  yaml: [() => import('prettier/plugins/yaml')],
};

export function getPrettierPluginLoaders(language: string): PluginLoader[] {
  return PRETTIER_PLUGIN_LOADERS[language] ?? [];
}
