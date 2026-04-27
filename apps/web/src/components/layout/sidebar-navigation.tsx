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
import { NavSection } from './nav-section';
import { cn } from '@cellar/ui';

export interface SidebarNavigationProps {
  activePath: string;
  searchParams?: { get: (key: string) => string | null };
  className?: string;
}

const generalNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assets', icon: Package, label: 'All Items' },
  { href: '/collections', icon: Folder, label: 'All Collections' },
];

const assetNav = [
  { href: '/assets?type=SNIPPET', icon: Code, label: 'Snippets', type: 'SNIPPET' },
  { href: '/assets?type=PROMPT', icon: Terminal, label: 'Prompts', type: 'PROMPT' },
  { href: '/assets?type=LINK', icon: LinkIcon, label: 'Links', type: 'LINK' },
  { href: '/assets?type=NOTE', icon: StickyNote, label: 'Notes', type: 'NOTE' },
  { href: '/assets?type=IMAGE', icon: Image, label: 'Images', type: 'IMAGE' },
  { href: '/assets?type=FILE', icon: FileText, label: 'Files', type: 'FILE' },
];

export function SidebarNavigation({ activePath, searchParams, className }: SidebarNavigationProps) {
  return (
    <nav className={cn('flex-1 overflow-y-auto space-y-1', className)}>
      <NavSection
        title="General"
        items={generalNav}
        activePath={activePath}
        searchParams={searchParams}
      />
      <NavSection
        title="Assets"
        items={assetNav}
        activePath={activePath}
        searchParams={searchParams}
        className="mt-4"
      />
    </nav>
  );
}
