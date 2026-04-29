import { describe, it, expect, vi } from 'vitest';
import type { FeatureModule } from '@cellar/shell-contract';
import { createFeatureLoader } from './feature-loader';

const stubModule: FeatureModule = { routes: [], nav: [] };

describe('createFeatureLoader', () => {
  it('memoizes the in-flight promise so the loader is only invoked once', async () => {
    const loader = vi.fn(async () => stubModule);
    const fl = createFeatureLoader(loader);

    const a = fl.load();
    const b = fl.load();
    expect(a).toBe(b);
    await a;
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('returns the cached module on subsequent calls after resolution', async () => {
    const loader = vi.fn(async () => stubModule);
    const fl = createFeatureLoader(loader);

    await fl.load();
    await fl.load();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('reset() clears cached resolution so the next load re-invokes the loader', async () => {
    const loader = vi.fn(async () => stubModule);
    const fl = createFeatureLoader(loader);

    await fl.load();
    fl.reset();
    await fl.load();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('propagates rejection and lets a fresh call retry without reset', async () => {
    let calls = 0;
    const loader = vi.fn(async () => {
      calls += 1;
      if (calls === 1) throw new Error('boom');
      return stubModule;
    });
    const fl = createFeatureLoader(loader);

    await expect(fl.load()).rejects.toThrow('boom');
    await expect(fl.load()).resolves.toBe(stubModule);
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
