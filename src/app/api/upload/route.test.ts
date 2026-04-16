import { describe, it, expect, vi } from 'vitest'

// Mock the auth module before importing route
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}))

import { validateFileContent, validateSvgContent, MAGIC_NUMBERS } from './route'

describe('upload validation', () => {
  describe('validateFileContent', () => {
    it('should return true for PNG files with valid magic number', () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00])
      expect(validateFileContent(validPng, '.png')).toBe(true)
    })

    it('should return false for PNG files with invalid magic number', () => {
      const invalidPng = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      expect(validateFileContent(invalidPng, '.png')).toBe(false)
    })

    it('should return true for JPG files with valid magic number', () => {
      const validJpg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
      expect(validateFileContent(validJpg, '.jpg')).toBe(true)
      expect(validateFileContent(validJpg, '.jpeg')).toBe(true)
    })

    it('should return false for JPG files with invalid magic number', () => {
      const invalidJpg = Buffer.from([0x00, 0x00, 0x00, 0x00])
      expect(validateFileContent(invalidJpg, '.jpg')).toBe(false)
      expect(validateFileContent(invalidJpg, '.jpeg')).toBe(false)
    })

    it('should return true for GIF files with valid magic number', () => {
      const validGif = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]) // GIF89a
      expect(validateFileContent(validGif, '.gif')).toBe(true)
    })

    it('should return false for GIF files with invalid magic number', () => {
      const invalidGif = Buffer.from([0x00, 0x00, 0x00, 0x00])
      expect(validateFileContent(invalidGif, '.gif')).toBe(false)
    })

    it('should return true for WebP files with valid magic number', () => {
      const validWebp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
      expect(validateFileContent(validWebp, '.webp')).toBe(true)
    })

    it('should return false for WebP files with invalid magic number', () => {
      const invalidWebp = Buffer.from([0x00, 0x00, 0x00, 0x00])
      expect(validateFileContent(invalidWebp, '.webp')).toBe(false)
    })

    it('should return true for SVG files (no magic number check)', () => {
      const svgContent = Buffer.from('<svg></svg>')
      expect(validateFileContent(svgContent, '.svg')).toBe(true)
    })

    it('should return true for extensions without magic numbers', () => {
      const anyContent = Buffer.from('any content')
      expect(validateFileContent(anyContent, '.txt')).toBe(true)
      expect(validateFileContent(anyContent, '.pdf')).toBe(true)
      expect(validateFileContent(anyContent, '.json')).toBe(true)
    })

    it('should detect renamed executable files', () => {
      // Windows executable magic number (MZ header)
      const exeContent = Buffer.from([0x4D, 0x5A, 0x90, 0x00])
      // If someone renames .exe to .png, it should be detected
      expect(validateFileContent(exeContent, '.png')).toBe(false)
    })

    it('should detect HTML file disguised as image', () => {
      const htmlContent = Buffer.from('<html><body>test</body></html>')
      expect(validateFileContent(htmlContent, '.png')).toBe(false)
      expect(validateFileContent(htmlContent, '.jpg')).toBe(false)
    })
  })

  describe('validateSvgContent', () => {
    it('should return valid for safe SVG files', () => {
      const safeSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>')
      const result = validateSvgContent(safeSvg)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should detect script tags in SVG', () => {
      const maliciousSvg = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <script>alert('xss')</script>
        </svg>
      `)
      const result = validateSvgContent(maliciousSvg)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('SVG contains potentially dangerous content')
    })

    it('should detect onload attribute in SVG', () => {
      const maliciousSvg = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" onload="alert('xss')">
        </svg>
      `)
      const result = validateSvgContent(maliciousSvg)
      expect(result.valid).toBe(false)
    })

    it('should detect onerror attribute in SVG', () => {
      const maliciousSvg = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <image href="x" onerror="alert('xss')"/>
        </svg>
      `)
      const result = validateSvgContent(maliciousSvg)
      expect(result.valid).toBe(false)
    })

    it('should detect onclick attribute in SVG', () => {
      const maliciousSvg = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect onclick="alert('xss')"/>
        </svg>
      `)
      const result = validateSvgContent(maliciousSvg)
      expect(result.valid).toBe(false)
    })

    it('should be case-insensitive for dangerous tags', () => {
      const maliciousSvg = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg">
          <SCRIPT>alert('xss')</SCRIPT>
        </svg>
      `)
      const result = validateSvgContent(maliciousSvg)
      expect(result.valid).toBe(false)
    })

    it('should handle empty SVG content', () => {
      const emptySvg = Buffer.from('')
      const result = validateSvgContent(emptySvg)
      expect(result.valid).toBe(true)
    })
  })

  describe('MAGIC_NUMBERS', () => {
    it('should have correct PNG magic number', () => {
      expect(MAGIC_NUMBERS['.png']).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
    })

    it('should have correct JPG/JPEG magic number', () => {
      const expected = Buffer.from([0xFF, 0xD8, 0xFF])
      expect(MAGIC_NUMBERS['.jpg']).toEqual(expected)
      expect(MAGIC_NUMBERS['.jpeg']).toEqual(expected)
    })

    it('should have correct GIF magic number', () => {
      expect(MAGIC_NUMBERS['.gif']).toEqual(Buffer.from([0x47, 0x49, 0x46, 0x38]))
    })

    it('should have correct WebP magic number', () => {
      expect(MAGIC_NUMBERS['.webp']).toEqual(Buffer.from([0x52, 0x49, 0x46, 0x46]))
    })

    it('should have null for SVG magic number', () => {
      expect(MAGIC_NUMBERS['.svg']).toBeNull()
    })
  })
})
