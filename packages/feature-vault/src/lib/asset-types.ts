import React from 'react';
import {
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  Braces,
} from 'lucide-react';
import { AssetType } from '@cellar/shared';

export const TYPE_CONFIG: Record<
  AssetType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconWrap: string;
    badge: string;
    label: string;
    defaultLanguage: string;
  }
> = {
  SNIPPET: {
    icon: Braces,
    iconWrap: 'bg-primary/10 text-primary',
    badge: 'text-primary bg-primary/10',
    label: 'Snippet',
    defaultLanguage: 'javascript',
  },
  PROMPT: {
    icon: Terminal,
    iconWrap: 'bg-tertiary-container/20 text-tertiary',
    badge: 'text-tertiary bg-tertiary/10',
    label: 'Prompt',
    defaultLanguage: 'markdown',
  },
  NOTE: {
    icon: StickyNote,
    iconWrap: 'bg-amber-500/10 text-amber-400',
    badge: 'text-amber-400 bg-amber-500/10',
    label: 'Note',
    defaultLanguage: 'markdown',
  },
  LINK: {
    icon: LinkIcon,
    iconWrap: 'bg-cyan-500/10 text-cyan-400',
    badge: 'text-cyan-400 bg-cyan-500/10',
    label: 'Link',
    defaultLanguage: 'plaintext',
  },
  IMAGE: {
    icon: ImageIcon,
    iconWrap: 'bg-rose-500/10 text-rose-400',
    badge: 'text-rose-400 bg-rose-500/10',
    label: 'Image',
    defaultLanguage: 'plaintext',
  },
  FILE: {
    icon: FileText,
    iconWrap: 'bg-violet-500/10 text-violet-400',
    badge: 'text-violet-400 bg-violet-500/10',
    label: 'File',
    defaultLanguage: 'plaintext',
  },
};

export const TYPE_TO_SLUG: Record<AssetType, string> = {
  SNIPPET: 'snippets',
  PROMPT: 'prompts',
  LINK: 'links',
  NOTE: 'notes',
  IMAGE: 'images',
  FILE: 'files',
};

export const SLUG_TO_TYPE: Record<string, AssetType> = Object.fromEntries(
  Object.entries(TYPE_TO_SLUG).map(([type, slug]) => [slug, type as AssetType])
);

export const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'SNIPPET', label: 'Snippet' },
  { value: 'PROMPT', label: 'Prompt' },
  { value: 'NOTE', label: 'Note' },
  { value: 'LINK', label: 'Link' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'FILE', label: 'File' },
];
