import {
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  FolderPlus,
  LogOut,
  PanelLeftClose,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AssetType } from '@cellar/shared';

// ---------------------------------------------------------------------------
// Ctx — the side-effect surface exposed to each action's run() handler
// ---------------------------------------------------------------------------

export interface CommandPaletteCtx {
  /** Open the asset drawer in create mode for a given type */
  createAsset: (type: AssetType) => void;
  /** Open the collection modal in create mode */
  createCollection: () => void;
  /** Sign out and redirect to /sign-in */
  signOut: () => void;
  /** Toggle the sidebar collapsed state */
  toggleSidebar: () => void;
}

// ---------------------------------------------------------------------------
// ActionRegistryEntry
// ---------------------------------------------------------------------------

export interface ActionRegistryEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  group: 'actions';
  keywords: string[];
  run: (ctx: CommandPaletteCtx) => void;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const commandPaletteActions: ActionRegistryEntry[] = [
  {
    id: 'new-snippet',
    label: 'New Snippet',
    icon: Code,
    group: 'actions',
    keywords: ['create', 'snippet', 'code', 'snip'],
    run: ctx => ctx.createAsset('SNIPPET'),
  },
  {
    id: 'new-prompt',
    label: 'New Prompt',
    icon: Terminal,
    group: 'actions',
    keywords: ['create', 'prompt', 'ai', 'llm'],
    run: ctx => ctx.createAsset('PROMPT'),
  },
  {
    id: 'new-link',
    label: 'New Link',
    icon: LinkIcon,
    group: 'actions',
    keywords: ['create', 'link', 'url', 'bookmark'],
    run: ctx => ctx.createAsset('LINK'),
  },
  {
    id: 'new-note',
    label: 'New Note',
    icon: StickyNote,
    group: 'actions',
    keywords: ['create', 'note', 'text', 'markdown'],
    run: ctx => ctx.createAsset('NOTE'),
  },
  {
    id: 'new-image',
    label: 'New Image',
    icon: ImageIcon,
    group: 'actions',
    keywords: ['create', 'image', 'photo', 'picture'],
    run: ctx => ctx.createAsset('IMAGE'),
  },
  {
    id: 'new-file',
    label: 'New File',
    icon: FileText,
    group: 'actions',
    keywords: ['create', 'file', 'upload', 'document'],
    run: ctx => ctx.createAsset('FILE'),
  },
  {
    id: 'new-collection',
    label: 'New Collection',
    icon: FolderPlus,
    group: 'actions',
    keywords: ['create', 'collection', 'folder', 'group'],
    run: ctx => ctx.createCollection(),
  },
  {
    id: 'sign-out',
    label: 'Sign out',
    icon: LogOut,
    group: 'actions',
    keywords: ['sign', 'out', 'logout', 'exit'],
    run: ctx => ctx.signOut(),
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle sidebar',
    icon: PanelLeftClose,
    group: 'actions',
    keywords: ['toggle', 'sidebar', 'collapse', 'expand'],
    run: ctx => ctx.toggleSidebar(),
  },
];
