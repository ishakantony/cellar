import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '@cellar/ui';

export interface JsonTreeContextMenuProps {
  x: number;
  y: number;
  onCopyPath: () => void;
  onCopyValue: () => void;
  onClose: () => void;
}

export function JsonTreeContextMenu({
  x,
  y,
  onCopyPath,
  onCopyValue,
  onClose,
}: JsonTreeContextMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useClickOutside(ref, onClose);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const menu = (
    <div
      ref={ref}
      role="menu"
      aria-label="Tree row actions"
      className="fixed z-50 min-w-[160px] rounded-md border border-outline-variant bg-surface-container py-1 text-xs shadow-lg"
      style={{ top: y, left: x }}
    >
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center px-3 py-1.5 text-left text-on-surface hover:bg-surface-container-high cursor-pointer"
        onClick={() => {
          onCopyPath();
          onClose();
        }}
      >
        Copy path
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center px-3 py-1.5 text-left text-on-surface hover:bg-surface-container-high cursor-pointer"
        onClick={() => {
          onCopyValue();
          onClose();
        }}
      >
        Copy value
      </button>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(menu, document.body);
}
