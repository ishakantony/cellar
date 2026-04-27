export const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
  '.txt',
  '.md',
  '.json',
  '.csv',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.go',
  '.rs',
  '.rb',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.html',
  '.css',
  '.xml',
  '.yaml',
  '.yml',
  '.toml',
  '.sh',
  '.zip',
  '.tar',
  '.gz',
]);

export const MAGIC_NUMBERS: Record<string, Buffer | null> = {
  '.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  '.jpg': Buffer.from([0xff, 0xd8, 0xff]),
  '.jpeg': Buffer.from([0xff, 0xd8, 0xff]),
  '.gif': Buffer.from([0x47, 0x49, 0x46, 0x38]),
  '.webp': Buffer.from([0x52, 0x49, 0x46, 0x46]),
  '.svg': null,
};

export function validateFileContent(buffer: Buffer, ext: string): boolean {
  const magic = MAGIC_NUMBERS[ext];
  if (!magic) return true;
  return buffer.subarray(0, magic.length).equals(magic);
}

export function validateSvgContent(buffer: Buffer): { valid: boolean; error?: string } {
  const svgContent = buffer.toString('utf-8').toLowerCase();
  const dangerousTags = ['<script', 'onload=', 'onerror=', 'onclick='];
  for (const tag of dangerousTags) {
    if (svgContent.includes(tag)) {
      return { valid: false, error: 'SVG contains potentially dangerous content' };
    }
  }
  return { valid: true };
}

export const INLINE_UNSAFE_EXTENSIONS = new Set(['svg', 'html', 'htm', 'js', 'xml']);

export const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  json: 'application/json',
  txt: 'text/plain',
};
