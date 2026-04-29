import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson } from './json-format';

describe('formatJson', () => {
  it('pretty-prints valid JSON with 2-space indent', () => {
    const input = '{"a":1,"b":2}';
    expect(formatJson(input)).toBe(JSON.stringify({ a: 1, b: 2 }, null, 2));
  });

  it('returns the input unchanged when JSON is invalid', () => {
    const invalid = 'not valid json';
    expect(formatJson(invalid)).toBe(invalid);
  });

  it('returns an empty string when input is empty', () => {
    expect(formatJson('')).toBe('');
  });

  it('handles already-formatted JSON without double-formatting', () => {
    const pretty = JSON.stringify({ x: [1, 2, 3] }, null, 2);
    expect(formatJson(pretty)).toBe(pretty);
  });

  it('formats nested objects correctly', () => {
    const input = '{"a":{"b":{"c":1}}}';
    const expected = JSON.stringify({ a: { b: { c: 1 } } }, null, 2);
    expect(formatJson(input)).toBe(expected);
  });

  it('formats arrays correctly', () => {
    const input = '[1,2,{"key":"val"}]';
    const expected = JSON.stringify([1, 2, { key: 'val' }], null, 2);
    expect(formatJson(input)).toBe(expected);
  });

  it('handles JSON with leading/trailing whitespace', () => {
    const input = '  {"a":1}  ';
    expect(formatJson(input)).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('handles JSON null as root', () => {
    expect(formatJson('null')).toBe('null');
  });

  it('handles JSON string as root', () => {
    expect(formatJson('"hello"')).toBe('"hello"');
  });

  it('handles JSON number as root', () => {
    expect(formatJson('42')).toBe('42');
  });
});

describe('minifyJson', () => {
  it('strips whitespace from valid JSON', () => {
    const pretty = JSON.stringify({ a: 1, b: 2 }, null, 2);
    expect(minifyJson(pretty)).toBe('{"a":1,"b":2}');
  });

  it('returns the input unchanged when JSON is invalid', () => {
    const invalid = 'not valid json';
    expect(minifyJson(invalid)).toBe(invalid);
  });

  it('returns an empty string when input is empty', () => {
    expect(minifyJson('')).toBe('');
  });

  it('handles already-minified JSON', () => {
    const compact = '{"x":[1,2,3]}';
    expect(minifyJson(compact)).toBe(compact);
  });

  it('minifies nested objects', () => {
    const input = JSON.stringify({ a: { b: { c: 1 } } }, null, 2);
    expect(minifyJson(input)).toBe('{"a":{"b":{"c":1}}}');
  });

  it('minifies arrays', () => {
    const input = JSON.stringify([1, 2, { key: 'val' }], null, 2);
    expect(minifyJson(input)).toBe('[1,2,{"key":"val"}]');
  });

  it('handles JSON null as root', () => {
    expect(minifyJson('null')).toBe('null');
  });

  it('handles JSON string as root with extra spaces', () => {
    expect(minifyJson('  "hello"  ')).toBe('"hello"');
  });

  it('handles JSON number as root', () => {
    expect(minifyJson('  42  ')).toBe('42');
  });
});
