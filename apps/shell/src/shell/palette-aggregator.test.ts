import { describe, it, expect, vi } from 'vitest';
import type { PaletteItem, PaletteProvider } from '@cellar/shell-contract';
import { aggregatePaletteResults } from './palette-aggregator';

function makeItem(id: string): PaletteItem {
  return { id, label: id, group: 'g' };
}

describe('aggregatePaletteResults', () => {
  it('returns one ok group per resolving provider', async () => {
    const a: PaletteProvider = { search: async () => [makeItem('a1'), makeItem('a2')] };
    const b: PaletteProvider = { search: async () => [makeItem('b1')] };

    const ctrl = new AbortController();
    const groups = await aggregatePaletteResults('q', ctrl.signal, [
      { id: 'a', provider: a },
      { id: 'b', provider: b },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ providerId: 'a', status: 'ok' });
    expect(groups[0]?.items).toHaveLength(2);
    expect(groups[1]).toMatchObject({ providerId: 'b', status: 'ok' });
  });

  it('contains failures: one provider rejecting yields an error group, others still ok', async () => {
    const ok: PaletteProvider = { search: async () => [makeItem('x')] };
    const bad: PaletteProvider = {
      search: async () => {
        throw new Error('nope');
      },
    };

    const ctrl = new AbortController();
    const groups = await aggregatePaletteResults('q', ctrl.signal, [
      { id: 'ok', provider: ok },
      { id: 'bad', provider: bad },
    ]);

    const okGroup = groups.find(g => g.providerId === 'ok');
    const badGroup = groups.find(g => g.providerId === 'bad');
    expect(okGroup?.status).toBe('ok');
    expect(okGroup?.items).toHaveLength(1);
    expect(badGroup?.status).toBe('error');
    expect(badGroup?.items).toEqual([]);
    expect(badGroup?.error).toBeInstanceOf(Error);
  });

  it('forwards the AbortSignal to providers and surfaces an aborted provider as an error group', async () => {
    const seen = vi.fn();
    const slow: PaletteProvider = {
      search: (_query, signal) =>
        new Promise<PaletteItem[]>((_resolve, reject) => {
          seen(signal);
          signal.addEventListener('abort', () => reject(signal.reason ?? new Error('aborted')));
        }),
    };

    const ctrl = new AbortController();
    const promise = aggregatePaletteResults('q', ctrl.signal, [{ id: 'slow', provider: slow }]);
    ctrl.abort(new Error('user cancelled'));

    const groups = await promise;
    expect(seen).toHaveBeenCalledWith(ctrl.signal);
    expect(groups[0]?.status).toBe('error');
  });

  it('returns [] when there are no providers', async () => {
    const ctrl = new AbortController();
    const groups = await aggregatePaletteResults('q', ctrl.signal, []);
    expect(groups).toEqual([]);
  });
});
