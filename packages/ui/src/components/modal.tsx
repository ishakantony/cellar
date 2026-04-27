import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { IconButton } from './icon-button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-[360px]',
  md: 'w-[400px]',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  ariaLabel,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        className={cn(
          'bg-surface-container-high rounded-xl p-6 mx-4 shadow-2xl',
          sizeClasses[size]
        )}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
            <IconButton icon={X} size="sm" onClick={onClose} label="Close" />
          </div>
        )}
        {children}
        {actions && <div className="flex items-center justify-end gap-2 mt-6">{actions}</div>}
      </div>
    </div>
  );
}
