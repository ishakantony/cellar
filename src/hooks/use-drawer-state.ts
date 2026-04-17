'use client';

import { useState, useCallback } from 'react';

export interface UseDrawerStateOptions {
  onSaved?: () => void;
}

export interface DrawerState<T> {
  open: boolean;
  selected: T | null;
  mode: 'view' | 'edit' | 'create';
  openView: (item: T) => void;
  openEdit: (item: T) => void;
  openCreate: (defaultItem?: Partial<T>) => void;
  close: () => void;
  setMode: (mode: 'view' | 'edit' | 'create') => void;
  setSelected: (item: T | null) => void;
}

export function useDrawerState<T>(options?: UseDrawerStateOptions): DrawerState<T> {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');

  const openView = useCallback((item: T) => {
    setSelected(item);
    setMode('view');
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setSelected(item);
    setMode('edit');
    setOpen(true);
  }, []);

  const openCreate = useCallback((defaultItem?: Partial<T>) => {
    setSelected((defaultItem as T) || null);
    setMode('create');
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSelected(null);
    setMode('view');
    options?.onSaved?.();
  }, [options]);

  return {
    open,
    selected,
    mode,
    openView,
    openEdit,
    openCreate,
    close,
    setMode,
    setSelected,
  };
}
