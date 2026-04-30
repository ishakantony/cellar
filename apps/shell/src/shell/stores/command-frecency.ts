import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const COMMAND_FRECENCY_KEY = 'cellar:command-frecency';

interface CommandUsage {
  count: number;
  lastUsed: number; // epoch ms
}

interface CommandFrecencyState {
  usage: Record<string, CommandUsage>;
  record: (commandId: string) => void;
}

// Halves the effective score every ~7 days (ln(2) / 0.1 ≈ 6.9)
const DECAY_RATE = 0.1; // per day
const MAX_ENTRIES = 50;

export function frecencyScore(usage: Record<string, CommandUsage>, commandId: string): number {
  const entry = usage[commandId];
  if (!entry) return 0;
  const daysSince = (Date.now() - entry.lastUsed) / 86_400_000;
  return entry.count * Math.exp(-DECAY_RATE * daysSince);
}

export const useCommandFrecency = create<CommandFrecencyState>()(
  persist(
    set => ({
      usage: {},

      record: (commandId: string) =>
        set(state => {
          const prev = state.usage[commandId];
          const updated: Record<string, CommandUsage> = {
            ...state.usage,
            [commandId]: { count: (prev?.count ?? 0) + 1, lastUsed: Date.now() },
          };
          const entries = Object.entries(updated);
          if (entries.length <= MAX_ENTRIES) return { usage: updated };
          // Drop lowest-scoring entries when the cap is exceeded
          const now = Date.now();
          entries.sort(
            ([, a], [, b]) =>
              b.count * Math.exp(-DECAY_RATE * ((now - b.lastUsed) / 86_400_000)) -
              a.count * Math.exp(-DECAY_RATE * ((now - a.lastUsed) / 86_400_000))
          );
          return { usage: Object.fromEntries(entries.slice(0, MAX_ENTRIES)) };
        }),
    }),
    {
      name: COMMAND_FRECENCY_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
