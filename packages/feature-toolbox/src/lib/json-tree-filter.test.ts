import { describe, it, expect } from 'vitest';
import { buildJsonTree } from './json-tree';
import { filterJsonTree } from './json-tree-filter';

describe('filterJsonTree', () => {
  describe('no match', () => {
    it('returns null when nothing matches', () => {
      const tree = buildJsonTree({ name: 'Ada', age: 36 });
      expect(filterJsonTree(tree, 'xyz')).toBeNull();
    });

    it('returns null for a primitive root with no match', () => {
      const tree = buildJsonTree('hello');
      expect(filterJsonTree(tree, 'world')).toBeNull();
    });
  });

  describe('empty query', () => {
    it('returns the node unchanged when query is empty string', () => {
      const tree = buildJsonTree({ name: 'Ada' });
      expect(filterJsonTree(tree, '')).toBe(tree);
    });
  });

  describe('root match', () => {
    it('includes the whole root object when a key matches', () => {
      const tree = buildJsonTree({ name: 'Ada', age: 36 });
      const result = filterJsonTree(tree, 'name');
      expect(result).not.toBeNull();
      expect(result!.children).toHaveLength(1);
      expect(result!.children![0].key).toBe('name');
    });

    it('includes the whole root object when a value matches', () => {
      const tree = buildJsonTree({ name: 'Ada', age: 36 });
      const result = filterJsonTree(tree, 'Ada');
      expect(result).not.toBeNull();
      expect(result!.children).toHaveLength(1);
      expect(result!.children![0].value).toBe('Ada');
    });
  });

  describe('nested match', () => {
    it('retains full parent path to a matching nested key', () => {
      const tree = buildJsonTree({ user: { name: 'Bob', email: 'bob@example.com' } });
      const result = filterJsonTree(tree, 'email');
      expect(result).not.toBeNull();
      // root is kept, user is kept, only email child retained
      expect(result!.children).toHaveLength(1);
      const userNode = result!.children![0];
      expect(userNode.key).toBe('user');
      expect(userNode.children).toHaveLength(1);
      expect(userNode.children![0].key).toBe('email');
    });

    it('retains full parent path to a matching nested value', () => {
      const tree = buildJsonTree({ user: { name: 'Bob', age: 42 } });
      const result = filterJsonTree(tree, '42');
      expect(result).not.toBeNull();
      const userNode = result!.children![0];
      expect(userNode.children).toHaveLength(1);
      expect(userNode.children![0].key).toBe('age');
    });
  });

  describe('array match', () => {
    it('filters array items by value', () => {
      const tree = buildJsonTree({ tags: ['admin', 'core', 'beta'] });
      const result = filterJsonTree(tree, 'admin');
      expect(result).not.toBeNull();
      const tags = result!.children![0];
      expect(tags.kind).toBe('array');
      expect(tags.children).toHaveLength(1);
      expect(tags.children![0].value).toBe('admin');
    });

    it('filters array items by index key', () => {
      const tree = buildJsonTree(['alpha', 'beta', 'gamma']);
      // Arrays use numeric keys — searching for a value works
      const result = filterJsonTree(tree, 'beta');
      expect(result).not.toBeNull();
      expect(result!.children).toHaveLength(1);
      expect(result!.children![0].value).toBe('beta');
    });
  });

  describe('key-only match', () => {
    it('matches when only the key matches (value does not)', () => {
      const tree = buildJsonTree({ foobar: 999 });
      const result = filterJsonTree(tree, 'foobar');
      expect(result).not.toBeNull();
      expect(result!.children![0].key).toBe('foobar');
    });
  });

  describe('value-only match', () => {
    it('matches when only the value matches (key does not)', () => {
      const tree = buildJsonTree({ xyz: 'needle' });
      const result = filterJsonTree(tree, 'needle');
      expect(result).not.toBeNull();
      expect(result!.children![0].value).toBe('needle');
    });
  });

  describe('deeply nested match', () => {
    it('finds a match 4 levels deep and keeps full ancestry', () => {
      const tree = buildJsonTree({
        level1: {
          level2: {
            level3: {
              target: 'found-it',
              other: 'not-me',
            },
          },
        },
      });
      const result = filterJsonTree(tree, 'found-it');
      expect(result).not.toBeNull();
      const l1 = result!.children![0];
      const l2 = l1.children![0];
      const l3 = l2.children![0];
      expect(l3.children).toHaveLength(1);
      expect(l3.children![0].key).toBe('target');
    });
  });

  describe('case insensitivity', () => {
    it('matches case-insensitively on keys', () => {
      const tree = buildJsonTree({ UserName: 'Ada' });
      const result = filterJsonTree(tree, 'username');
      expect(result).not.toBeNull();
    });

    it('matches case-insensitively on values', () => {
      const tree = buildJsonTree({ name: 'Ada' });
      const result = filterJsonTree(tree, 'ADA');
      expect(result).not.toBeNull();
    });
  });

  describe('container key match includes all children', () => {
    it('includes all children when a container key matches', () => {
      const tree = buildJsonTree({ metadata: { a: 1, b: 2, c: 3 } });
      const result = filterJsonTree(tree, 'metadata');
      expect(result).not.toBeNull();
      const meta = result!.children![0];
      // Since the container key itself matched, all children are kept
      expect(meta.children).toHaveLength(3);
    });
  });

  describe('primitive root match', () => {
    it('returns the root primitive when its value matches', () => {
      const tree = buildJsonTree('hello world');
      const result = filterJsonTree(tree, 'hello');
      expect(result).not.toBeNull();
      expect(result!.value).toBe('hello world');
    });
  });

  describe('boolean and null matching', () => {
    it('matches boolean value true', () => {
      const tree = buildJsonTree({ active: true, name: 'test' });
      const result = filterJsonTree(tree, 'true');
      expect(result).not.toBeNull();
      expect(result!.children).toHaveLength(1);
      expect(result!.children![0].value).toBe(true);
    });

    it('matches null value', () => {
      const tree = buildJsonTree({ deleted: null, name: 'test' });
      const result = filterJsonTree(tree, 'null');
      expect(result).not.toBeNull();
      expect(result!.children).toHaveLength(1);
      expect(result!.children![0].key).toBe('deleted');
    });
  });
});
