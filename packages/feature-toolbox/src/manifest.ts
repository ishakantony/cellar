import { Wrench, Braces, FileJson } from 'lucide-react';
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
];

export const manifest: FeatureManifest = {
  id: 'toolbox',
  label: 'Toolbox',
  icon: Wrench,
  basePath: '/toolbox',
  rail: true,
  staticCommands: toolboxStaticCommands,
};

export default manifest;
