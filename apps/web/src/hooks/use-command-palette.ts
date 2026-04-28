import { create } from 'zustand';

export interface CommandPaletteState {
  open: boolean;
  query: string;
}

export interface CommandPaletteActions {
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
}

const initialState: CommandPaletteState = {
  open: false,
  query: '',
};

export const useCommandPalette = create<CommandPaletteState & CommandPaletteActions>()(set => ({
  ...initialState,

  setOpen: (open: boolean) =>
    set(state => ({
      open,
      // Reset query when closing
      query: open ? state.query : '',
    })),

  setQuery: (query: string) => set({ query }),
}));
