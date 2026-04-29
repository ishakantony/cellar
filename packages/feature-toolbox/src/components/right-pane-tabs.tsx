import { Tabs, type TabOption } from '@cellar/ui';

/**
 * Right-pane tab strip for the JSON Explorer. v1 ships a single visible
 * `Tree` tab; the strip is structured so future tabs (Stats, Schema...) can
 * be added without rework.
 */
export interface RightPaneTabsProps {
  activeId: string;
  onChange?: (id: string) => void;
}

const TABS: TabOption[] = [{ value: 'tree', label: 'Tree' }];

export function RightPaneTabs({ activeId, onChange }: RightPaneTabsProps) {
  return (
    <div className="border-b border-outline-variant/20 px-2 py-1">
      <Tabs value={activeId} options={TABS} onChange={next => onChange?.(next ?? 'tree')} />
    </div>
  );
}
