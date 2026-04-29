import { describe, it, expect } from 'vitest';
import { buildJsonTree } from './json-tree';

describe('buildJsonTree', () => {
  describe('primitives at root', () => {
    it('builds a string root', () => {
      const node = buildJsonTree('hello');
      expect(node).toMatchObject({
        id: 'root',
        kind: 'string',
        value: 'hello',
        key: undefined,
      });
      expect(node.children).toBeUndefined();
      expect(node.count).toBeUndefined();
    });

    it('builds a number root', () => {
      const node = buildJsonTree(42);
      expect(node).toMatchObject({ id: 'root', kind: 'number', value: 42 });
    });

    it('builds a boolean root', () => {
      const node = buildJsonTree(true);
      expect(node).toMatchObject({ id: 'root', kind: 'boolean', value: true });
    });

    it('builds a null root', () => {
      const node = buildJsonTree(null);
      expect(node).toMatchObject({ id: 'root', kind: 'null', value: null });
    });
  });

  describe('empty containers', () => {
    it('builds an empty object', () => {
      const node = buildJsonTree({});
      expect(node.kind).toBe('object');
      expect(node.count).toBe(0);
      expect(node.children).toEqual([]);
    });

    it('builds an empty array', () => {
      const node = buildJsonTree([]);
      expect(node.kind).toBe('array');
      expect(node.count).toBe(0);
      expect(node.children).toEqual([]);
    });
  });

  describe('nested structures', () => {
    it('builds a flat object', () => {
      const node = buildJsonTree({ name: 'Ada', age: 36 });
      expect(node.kind).toBe('object');
      expect(node.count).toBe(2);
      expect(node.children).toHaveLength(2);
      expect(node.children![0]).toMatchObject({
        id: 'root.name',
        key: 'name',
        kind: 'string',
        value: 'Ada',
        segments: ['name'],
      });
      expect(node.children![1]).toMatchObject({
        id: 'root.age',
        key: 'age',
        kind: 'number',
        value: 36,
        segments: ['age'],
      });
    });

    it('builds a flat array', () => {
      const node = buildJsonTree(['a', 'b', 'c']);
      expect(node.kind).toBe('array');
      expect(node.count).toBe(3);
      expect(node.children).toHaveLength(3);
      expect(node.children![0]).toMatchObject({
        id: 'root[0]',
        key: 0,
        kind: 'string',
        value: 'a',
        segments: [0],
      });
      expect(node.children![2]).toMatchObject({ id: 'root[2]', key: 2, kind: 'string' });
    });

    it('builds nested objects + arrays', () => {
      const node = buildJsonTree({
        users: [
          { name: 'Ada', tags: ['admin', 'core'] },
          { name: 'Bob', tags: [] },
        ],
      });

      expect(node.kind).toBe('object');
      expect(node.count).toBe(1);

      const users = node.children![0];
      expect(users.id).toBe('root.users');
      expect(users.kind).toBe('array');
      expect(users.count).toBe(2);

      const user0 = users.children![0];
      expect(user0.id).toBe('root.users[0]');
      expect(user0.kind).toBe('object');
      expect(user0.count).toBe(2);

      const tags0 = user0.children!.find(c => c.key === 'tags')!;
      expect(tags0.id).toBe('root.users[0].tags');
      expect(tags0.kind).toBe('array');
      expect(tags0.count).toBe(2);
      expect(tags0.children![0]).toMatchObject({ id: 'root.users[0].tags[0]', value: 'admin' });
    });
  });

  describe('special keys', () => {
    it('preserves keys with spaces', () => {
      const node = buildJsonTree({ 'key with spaces': 1 });
      const child = node.children![0];
      expect(child.key).toBe('key with spaces');
      expect(child.id).toBe('root.key with spaces');
      expect(child.segments).toEqual(['key with spaces']);
    });

    it('preserves keys that contain dots', () => {
      const node = buildJsonTree({ 'a.b.c': 1 });
      const child = node.children![0];
      expect(child.key).toBe('a.b.c');
      expect(child.segments).toEqual(['a.b.c']);
    });
  });

  describe('count badges', () => {
    it('counts nested object children', () => {
      const node = buildJsonTree({ a: 1, b: 2, c: 3, d: { x: 1 } });
      expect(node.count).toBe(4);
      const d = node.children!.find(c => c.key === 'd')!;
      expect(d.count).toBe(1);
    });

    it('counts deeply nested array children', () => {
      const node = buildJsonTree({ list: [1, 2, [3, 4, 5]] });
      const list = node.children![0];
      expect(list.count).toBe(3);
      const inner = list.children![2];
      expect(inner.kind).toBe('array');
      expect(inner.count).toBe(3);
    });
  });

  describe('id uniqueness', () => {
    it('produces unique ids for every node in a complex tree', () => {
      const node = buildJsonTree({
        a: { b: { c: [1, 2, { d: 'hi' }] } },
        e: [null, null, null],
      });

      const seen = new Set<string>();
      function walk(n: { id: string; children?: unknown[] }) {
        expect(seen.has(n.id)).toBe(false);
        seen.add(n.id);
        if (Array.isArray(n.children)) {
          for (const c of n.children) walk(c as never);
        }
      }
      walk(node);
      expect(seen.size).toBeGreaterThan(5);
    });
  });
});
