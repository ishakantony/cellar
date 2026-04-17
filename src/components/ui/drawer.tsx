'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './icon-button';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg';
}

const widthClasses: Record<string, string> = {
  md: 'w-full md:w-[480px]',
  lg: 'w-full md:w-[680px]',
};

export function Drawer({ open, onClose, title, children, footer, width = 'lg' }: DrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 flex flex-col z-50 bg-surface-container-low shadow-2xl',
          widthClasses[width]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
            <div className="flex-1">{title}</div>
            <div className="flex items-center gap-2">
              <IconButton icon={X} onClick={onClose} label="Close drawer" />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
        {footer && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0 gap-2">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
