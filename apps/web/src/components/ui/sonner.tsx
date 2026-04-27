import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface-container-high)',
          border: '1px solid var(--color-outline-variant)',
          color: 'var(--color-on-surface)',
          fontSize: '13px',
          borderRadius: '6px',
        },
      }}
    />
  );
}
