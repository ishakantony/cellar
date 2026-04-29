import {
  Code,
  FileText,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  StickyNote,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { ASSET_TYPES, type AssetType } from '@cellar/shared';
import { cn } from '@cellar/ui';

interface FilterTab {
  value: AssetType | null;
  label: string;
  icon: LucideIcon;
}

const TYPE_META: Record<AssetType, { label: string; icon: LucideIcon }> = {
  SNIPPET: { label: 'Snippets', icon: Code },
  PROMPT: { label: 'Prompts', icon: Terminal },
  NOTE: { label: 'Notes', icon: StickyNote },
  LINK: { label: 'Links', icon: LinkIcon },
  IMAGE: { label: 'Images', icon: ImageIcon },
  FILE: { label: 'Files', icon: FileText },
};

const TABS: FilterTab[] = [
  { value: null, label: 'All', icon: Layers },
  ...ASSET_TYPES.map(type => ({
    value: type,
    label: TYPE_META[type].label,
    icon: TYPE_META[type].icon,
  })),
];

export interface AssetsFilterTabsProps {
  selectedType: AssetType | null;
  onTypeChange: (type: AssetType | null) => void;
  className?: string;
}

/**
 * In-page filter strip for the assets list. One tab per asset type plus an
 * "All" tab. Selection is delegated upstream so callers can drive the URL via
 * `nuqs` (or any other state mechanism). Tabs use `role="tab"` + `aria-selected`
 * so assistive tech identifies the active filter.
 */
export function AssetsFilterTabs({ selectedType, onTypeChange, className }: AssetsFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter assets by type"
      className={cn('flex items-center gap-1 overflow-x-auto', className)}
    >
      {TABS.map(tab => {
        const isActive = selectedType === tab.value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value ?? 'all'}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTypeChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded',
              'text-[10px] font-bold uppercase tracking-widest whitespace-nowrap',
              'transition-all cursor-pointer',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-outline hover:text-on-surface-variant hover:bg-surface-container'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
