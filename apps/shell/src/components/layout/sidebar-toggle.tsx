import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { IconButton, Tooltip } from '@cellar/ui';
import { useSidebarCollapse } from '@/shell/stores/sidebar-collapse';
import { formatShortcut } from '@/shell/format-shortcut';

export interface SidebarToggleProps {
  /**
   * Optional override for tests. Defaults to the persisted sidebar-collapse
   * store so callers in the shell don't need to wire props.
   */
  onClick?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function SidebarToggle({ onClick, collapsed, className }: SidebarToggleProps) {
  const storeCollapsed = useSidebarCollapse(s => s.collapsed);
  const toggle = useSidebarCollapse(s => s.toggle);
  const isCollapsed = collapsed ?? storeCollapsed;
  const handleClick = onClick ?? toggle;

  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const tooltip = `${label} (${formatShortcut('B')})`;

  return (
    <Tooltip content={tooltip} side="bottom">
      <IconButton
        icon={isCollapsed ? PanelLeftOpen : PanelLeftClose}
        onClick={handleClick}
        label={label}
        className={className}
      />
    </Tooltip>
  );
}
