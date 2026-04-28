import {
  LayoutDashboard,
  Package,
  Folder,
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavEntry {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const generalNav: NavEntry[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assets', icon: Package, label: 'All Items' },
  { href: '/collections', icon: Folder, label: 'All Collections' },
];

export const assetNav: NavEntry[] = [
  { href: '/assets?type=SNIPPET', icon: Code, label: 'Snippets' },
  { href: '/assets?type=PROMPT', icon: Terminal, label: 'Prompts' },
  { href: '/assets?type=LINK', icon: LinkIcon, label: 'Links' },
  { href: '/assets?type=NOTE', icon: StickyNote, label: 'Notes' },
  { href: '/assets?type=IMAGE', icon: Image, label: 'Images' },
  { href: '/assets?type=FILE', icon: FileText, label: 'Files' },
];

/** All Go To nav entries in palette order (general + asset types) */
export const allNavEntries: NavEntry[] = [...generalNav, ...assetNav];
