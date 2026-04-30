import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from './base64';

describe('encodeBase64', () => {
  it('encodes a simple ASCII string to standard base64', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });
});

describe('encodeBase64', () => {
  it('encodes empty string to empty string', () => {
    expect(encodeBase64('')).toBe('');
  });

  it('encodes unicode characters', () => {
    expect(encodeBase64('héllo wörld')).toBe('aMOpbGxvIHfDtnJsZA==');
  });
});

describe('decodeBase64', () => {
  it('decodes valid base64 back to the original string', () => {
    expect(decodeBase64('aGVsbG8=')).toEqual({ ok: true, value: 'hello' });
  });

  it('round-trips through encode then decode', () => {
    const original = 'Hello, World! 🌍';
    const encoded = encodeBase64(original);
    expect(decodeBase64(encoded)).toEqual({ ok: true, value: original });
  });

  it('returns an error for invalid base64', () => {
    const result = decodeBase64('!!!not-base64!!!');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('decodes empty string to empty string', () => {
    expect(decodeBase64('')).toEqual({ ok: true, value: '' });
  });
});
