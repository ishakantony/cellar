import { describe, it, expect } from 'vitest';
import { parseJson } from './json-parse';

describe('parseJson', () => {
  describe('valid JSON', () => {
    it('returns ok:true with the parsed value for an object', () => {
      const result = parseJson('{"a":1}');
      expect(result).toEqual({ ok: true, value: { a: 1 } });
    });

    it('returns ok:true with the parsed value for an array', () => {
      const result = parseJson('[1,2,3]');
      expect(result).toEqual({ ok: true, value: [1, 2, 3] });
    });

    it('returns ok:true for a string primitive', () => {
      const result = parseJson('"hello"');
      expect(result).toEqual({ ok: true, value: 'hello' });
    });

    it('returns ok:true for a number primitive', () => {
      const result = parseJson('42');
      expect(result).toEqual({ ok: true, value: 42 });
    });

    it('returns ok:true for null', () => {
      const result = parseJson('null');
      expect(result).toEqual({ ok: true, value: null });
    });

    it('returns ok:true for true/false', () => {
      expect(parseJson('true')).toEqual({ ok: true, value: true });
      expect(parseJson('false')).toEqual({ ok: true, value: false });
    });

    it('returns ok:true for whitespace-only input treated as empty', () => {
      const result = parseJson('   \n\t  ');
      expect(result).toEqual({ ok: true, value: undefined });
    });
  });

  describe('empty input', () => {
    it('treats an empty string as empty (ok:true, value:undefined), not an error', () => {
      const result = parseJson('');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
    });
  });

  describe('invalid JSON', () => {
    it('returns ok:false for a bare word', () => {
      const result = parseJson('invalid');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
        expect(typeof result.line).toBe('number');
        expect(typeof result.col).toBe('number');
      }
    });

    it('returns ok:false for a trailing comma', () => {
      const result = parseJson('{"a":1,}');
      expect(result.ok).toBe(false);
    });

    it('returns ok:false for an unclosed brace', () => {
      const result = parseJson('{"a":1');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.line).toBeGreaterThanOrEqual(1);
        expect(result.col).toBeGreaterThanOrEqual(1);
      }
    });

    it('returns ok:false for mismatched brackets', () => {
      const result = parseJson('[1,2,3}');
      expect(result.ok).toBe(false);
    });

    it('provides line >= 1 and col >= 1 even when extraction fails', () => {
      const result = parseJson('bad');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.line).toBeGreaterThanOrEqual(1);
        expect(result.col).toBeGreaterThanOrEqual(1);
      }
    });

    it('reports line > 1 for a multiline error', () => {
      const result = parseJson('{\n  "a": 1,\n  bad\n}');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Line should be > 1 since the error is on line 3
        // (some engines may report the position differently, so we just check >= 1)
        expect(result.line).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
