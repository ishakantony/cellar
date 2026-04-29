import type { PaletteItem, PaletteProvider } from '@cellar/shell-contract';

/** A provider keyed by id (typically the feature id). */
export interface NamedPaletteProvider {
  id: string;
  provider: PaletteProvider;
}

export type PaletteGroupStatus = 'ok' | 'error';

export interface PaletteGroupResult {
  providerId: string;
  items: PaletteItem[];
  status: PaletteGroupStatus;
  error?: unknown;
}

/**
 * Run every provider's `search` in parallel and return one group per provider
 * with its own status. A failing provider yields an empty `items` array and
 * `status: 'error'` — it never rejects the whole aggregation. Aborting the
 * shared `signal` cancels in-flight provider work where supported.
 */
export async function aggregatePaletteResults(
  query: string,
  signal: AbortSignal,
  providers: NamedPaletteProvider[]
): Promise<PaletteGroupResult[]> {
  const results = await Promise.all(
    providers.map(async ({ id, provider }): Promise<PaletteGroupResult> => {
      try {
        const items = await provider.search(query, signal);
        return { providerId: id, items, status: 'ok' };
      } catch (error) {
        return { providerId: id, items: [], status: 'error', error };
      }
    })
  );
  return results;
}
