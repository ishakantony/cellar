export type DecodeOk = { ok: true; value: string };
export type DecodeError = { ok: false; error: string };
export type DecodeResult = DecodeOk | DecodeError;

export function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function decodeBase64(encoded: string): DecodeResult {
  try {
    const value = decodeURIComponent(escape(atob(encoded)));
    return { ok: true, value };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error };
  }
}
