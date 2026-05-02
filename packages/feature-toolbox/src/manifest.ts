import { Wrench, Braces, FileJson, Binary, Link } from 'lucide-react';
import type { FeatureManifest, PaletteCommand } from '@cellar/shell-contract';

export const toolboxStaticCommands: PaletteCommand[] = [
  {
    id: 'toolbox-open-json-explorer',
    label: 'Open JSON Explorer',
    icon: Braces,
    group: 'Toolbox',
    kind: 'navigate',
    href: '/toolbox/json-explorer',
  },
  {
    id: 'toolbox-format-json',
    label: 'Format JSON',
    icon: FileJson,
    group: 'Toolbox',
    kind: 'navigate',
    href: '/toolbox/json-explorer',
  },
  {
    id: 'toolbox-open-base64',
    label: 'Open Base64 Encoder/Decoder',
    icon: Binary,
    group: 'Toolbox',
    kind: 'navigate',
    href: '/toolbox/base64',
  },
  {
    id: 'toolbox-open-url-encoder',
    label: 'Open URL Encoder',
    icon: Link,
    group: 'Toolbox',
    kind: 'navigate',
    href: '/toolbox/url-encoder',
  },
];

export const manifest: FeatureManifest = {
  id: 'toolbox',
  label: 'Toolbox',
  icon: Wrench,
  basePath: '/toolbox',
  rail: true,
  accent: 'var(--color-toolbox-accent)',
  staticCommands: toolboxStaticCommands,
};

export default manifest;
