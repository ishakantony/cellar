import { Menu } from 'lucide-react';
import { IconButton } from '@cellar/ui';

export interface MobileMenuToggleProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuToggle({ onClick, className }: MobileMenuToggleProps) {
  return <IconButton icon={Menu} onClick={onClick} label="Open menu" className={className} />;
}
