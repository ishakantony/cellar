import { Menu } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';

export interface MobileMenuToggleProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuToggle({ onClick, className }: MobileMenuToggleProps) {
  return <IconButton icon={Menu} onClick={onClick} label="Open menu" className={className} />;
}
