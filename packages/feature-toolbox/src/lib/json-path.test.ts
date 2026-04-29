import { describe, it, expect } from 'vitest';
import { buildJsonPath } from './json-path';

describe('buildJsonPath', () => {
  describe('root', () => {
    it('returns "$" for empty segments', () => {
      expect(buildJsonPath([])).toBe('$');
    });
  });

  describe('object keys (identifier-safe)', () => {
    it('uses dot notation for a single identifier key', () => {
      expect(buildJsonPath(['users'])).toBe('$.users');
    });

    it('chains dot notation for nested identifier keys', () => {
      expect(buildJsonPath(['users', 'address', 'city'])).toBe('$.users.address.city');
    });

    it('treats underscore-prefixed keys as identifiers', () => {
      expect(buildJsonPath(['_meta', '$ref'])).toBe('$._meta.$ref');
    });

    it('allows digits after the first character', () => {
      expect(buildJsonPath(['user1', 'item2'])).toBe('$.user1.item2');
    });
  });

  describe('array indices', () => {
    it('uses bracket notation for an index', () => {
      expect(buildJsonPath(['users', 0])).toBe('$.users[0]');
    });

    it('handles consecutive indices', () => {
      expect(buildJsonPath(['matrix', 0, 2])).toBe('$.matrix[0][2]');
    });

    it('handles a top-level array index', () => {
      expect(buildJsonPath([0])).toBe('$[0]');
    });
  });

  describe('deep nesting', () => {
    it('mixes object keys and array indices', () => {
      expect(buildJsonPath(['a', 'b', 2, 'c', 0, 'd'])).toBe('$.a.b[2].c[0].d');
    });
  });

  describe('special-character keys (bracket notation)', () => {
    it('quotes keys with spaces', () => {
      expect(buildJsonPath(['key with spaces'])).toBe("$['key with spaces']");
    });

    it('quotes keys that contain dots', () => {
      expect(buildJsonPath(['a.b.c'])).toBe("$['a.b.c']");
    });

    it('quotes keys with dashes', () => {
      expect(buildJsonPath(['key-with-dash'])).toBe("$['key-with-dash']");
    });

    it('quotes keys that start with a digit', () => {
      expect(buildJsonPath(['0abc'])).toBe("$['0abc']");
    });

    it('quotes a numeric-string object key', () => {
      // "0" as a string is not an identifier, so it must be bracket-quoted.
      expect(buildJsonPath(['0'])).toBe("$['0']");
    });

    it('quotes empty-string keys', () => {
      expect(buildJsonPath([''])).toBe("$['']");
    });

    it('escapes single quotes inside keys', () => {
      expect(buildJsonPath(["it's"])).toBe("$['it\\'s']");
    });

    it('escapes backslashes inside keys', () => {
      expect(buildJsonPath(['back\\slash'])).toBe("$['back\\\\slash']");
    });

    it('escapes both backslashes and quotes', () => {
      expect(buildJsonPath(["a\\b'c"])).toBe("$['a\\\\b\\'c']");
    });

    it('mixes identifier and bracket-quoted keys', () => {
      expect(buildJsonPath(['users', 'key with spaces', 0])).toBe("$.users['key with spaces'][0]");
    });
  });
});
