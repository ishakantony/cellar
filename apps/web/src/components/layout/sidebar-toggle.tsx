import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { IconButton } from '@cellar/ui';

export interface SidebarToggleProps {
  onClick: () => void;
  collapsed?: boolean;
  className?: string;
}

export function SidebarToggle({ onClick, collapsed = false, className }: SidebarToggleProps) {
  return (
    <IconButton
      icon={collapsed ? PanelLeftOpen : PanelLeftClose}
      onClick={onClick}
      label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={className}
    />
  );
}
