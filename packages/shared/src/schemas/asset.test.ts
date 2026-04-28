import { describe, test, expect } from 'vitest';
import { CreateAssetSchema, UpdateAssetSchema } from './asset';

describe('CreateAssetSchema', () => {
  test('accepts base fields without collectionIds', () => {
    const result = CreateAssetSchema.safeParse({ type: 'SNIPPET', title: 'My Snippet' });
    expect(result.success).toBe(true);
  });

  test('accepts collectionIds as string array', () => {
    const result = CreateAssetSchema.safeParse({
      type: 'NOTE',
      title: 'My Note',
      collectionIds: ['coll1', 'coll2'],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.collectionIds).toEqual(['coll1', 'coll2']);
  });

  test('collectionIds is undefined when omitted', () => {
    const result = CreateAssetSchema.safeParse({ type: 'LINK', title: 'My Link' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.collectionIds).toBeUndefined();
  });
});

describe('UpdateAssetSchema', () => {
  test('accepts collectionIds as string array', () => {
    const result = UpdateAssetSchema.safeParse({ title: 'Updated', collectionIds: ['c1'] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.collectionIds).toEqual(['c1']);
  });

  test('accepts empty collectionIds array to clear all collections', () => {
    const result = UpdateAssetSchema.safeParse({ collectionIds: [] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.collectionIds).toEqual([]);
  });
});
