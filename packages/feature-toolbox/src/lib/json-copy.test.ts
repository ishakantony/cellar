import { describe, it, expect } from 'vitest';
import { buildJsonTree } from './json-tree';
import { formatValueForCopy } from './json-copy';

describe('formatValueForCopy', () => {
  it('copies strings without surrounding quotes', () => {
    const root = buildJsonTree({ name: 'Ada' });
    const child = root.children![0];
    expect(formatValueForCopy(child)).toBe('Ada');
  });

  it('copies a root string without quotes', () => {
    const node = buildJsonTree('hello world');
    expect(formatValueForCopy(node)).toBe('hello world');
  });

  it('stringifies numbers directly', () => {
    const root = buildJsonTree({ n: 42 });
    expect(formatValueForCopy(root.children![0])).toBe('42');
  });

  it('stringifies booleans directly', () => {
    const root = buildJsonTree({ a: true, b: false });
    expect(formatValueForCopy(root.children![0])).toBe('true');
    expect(formatValueForCopy(root.children![1])).toBe('false');
  });

  it('serializes null as "null"', () => {
    const root = buildJsonTree({ n: null });
    expect(formatValueForCopy(root.children![0])).toBe('null');
  });

  it('pretty-prints objects with two-space indentation', () => {
    const value = { name: 'Ada', age: 36 };
    const root = buildJsonTree({ user: value });
    const userNode = root.children![0];
    expect(formatValueForCopy(userNode)).toBe(JSON.stringify(value, null, 2));
  });

  it('pretty-prints arrays with two-space indentation', () => {
    const value = [1, 2, { a: 1 }];
    const root = buildJsonTree({ list: value });
    const listNode = root.children![0];
    expect(formatValueForCopy(listNode)).toBe(JSON.stringify(value, null, 2));
  });

  it('pretty-prints the root object', () => {
    const value = { a: 1, b: { c: [true, null, 'x'] } };
    const root = buildJsonTree(value);
    expect(formatValueForCopy(root)).toBe(JSON.stringify(value, null, 2));
  });

  it('pretty-prints an empty object as "{}"', () => {
    const root = buildJsonTree({ empty: {} });
    expect(formatValueForCopy(root.children![0])).toBe('{}');
  });

  it('pretty-prints an empty array as "[]"', () => {
    const root = buildJsonTree({ empty: [] });
    expect(formatValueForCopy(root.children![0])).toBe('[]');
  });

  it('preserves keys with special characters in object output', () => {
    const value = { 'key with spaces': 1, 'a.b': 2 };
    const root = buildJsonTree(value);
    expect(formatValueForCopy(root)).toBe(JSON.stringify(value, null, 2));
  });
});
