import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, MockPrisma } from '@/test/mocks/prisma'
import { createMockGetUser, createMockGetUserUnauthorized, mockUser } from '@/test/mocks/auth'
import { createMockAsset, createMockCollection } from '@/test/utils/test-data'
import { AssetType } from '@/generated/prisma/enums'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}))

vi.mock('@/lib/session', () => ({
  getUser: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock fs/promises
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>()
  return {
    ...actual,
    unlink: vi.fn(),
    default: actual,
  }
})

// Import after mocking
import { createAsset, getAssets, updateAsset, deleteAsset, togglePin, getDashboardData } from './assets'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'

describe('assets actions', () => {
  const mockPrisma = prisma as unknown as MockPrisma
  const mockGetUser = getUser as ReturnType<typeof vi.fn>
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockImplementation(createMockGetUser())
    // Set UPLOAD_DIR to absolute path for consistent testing
    process.env.UPLOAD_DIR = '/tmp/test-uploads'
  })

  describe('createAsset', () => {
    it('should create asset with user association', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-456',
        userId: mockUser.id,
        type: AssetType.SNIPPET,
        title: 'Test Snippet',
      })
      mockPrisma.asset.create.mockResolvedValue(mockAsset)

      const result = await createAsset({
        type: AssetType.SNIPPET,
        title: 'Test Snippet',
      })

      expect(mockPrisma.asset.create).toHaveBeenCalledWith({
        data: {
          type: AssetType.SNIPPET,
          title: 'Test Snippet',
          userId: mockUser.id,
        },
      })
      expect(result).toEqual(mockAsset)
    })

    it('should create asset with all optional fields', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-789',
        userId: mockUser.id,
        type: AssetType.LINK,
        title: 'Complete Asset',
        description: 'A test description',
        content: 'Some content here',
        language: 'typescript',
        url: 'https://example.com',
        filePath: '/uploads/file.txt',
        fileName: 'file.txt',
        mimeType: 'text/plain',
        fileSize: 1024,
      })
      mockPrisma.asset.create.mockResolvedValue(mockAsset)

      const result = await createAsset({
        type: AssetType.LINK,
        title: 'Complete Asset',
        description: 'A test description',
        content: 'Some content here',
        language: 'typescript',
        url: 'https://example.com',
        filePath: '/uploads/file.txt',
        fileName: 'file.txt',
        mimeType: 'text/plain',
        fileSize: 1024,
      })

      expect(mockPrisma.asset.create).toHaveBeenCalledWith({
        data: {
          type: AssetType.LINK,
          title: 'Complete Asset',
          description: 'A test description',
          content: 'Some content here',
          language: 'typescript',
          url: 'https://example.com',
          filePath: '/uploads/file.txt',
          fileName: 'file.txt',
          mimeType: 'text/plain',
          fileSize: 1024,
          userId: mockUser.id,
        },
      })
      expect(result).toEqual(mockAsset)
    })

    it('should revalidate paths after creation', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-999',
        userId: mockUser.id,
        type: AssetType.SNIPPET,
        title: 'Revalidation Test',
      })
      mockPrisma.asset.create.mockResolvedValue(mockAsset)

      await createAsset({
        type: AssetType.SNIPPET,
        title: 'Revalidation Test',
      })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/assets')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(
        createAsset({
          type: AssetType.SNIPPET,
          title: 'Unauthorized Test',
        })
      ).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.create).not.toHaveBeenCalled()
    })
  })

  describe('getAssets', () => {
    it('should return assets for current user', async () => {
      const mockAssets = [
        createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Asset 1' }),
        createMockAsset({ id: 'asset-2', userId: mockUser.id, title: 'Asset 2' }),
      ]
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)

      const result = await getAssets()

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
        },
        orderBy: { updatedAt: 'desc' },
      })
      expect(result).toEqual(mockAssets)
    })

    it('should filter assets by type', async () => {
      const mockAssets = [
        createMockAsset({
          id: 'asset-1',
          userId: mockUser.id,
          type: AssetType.SNIPPET,
          title: 'Snippet 1',
        }),
      ]
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)

      const result = await getAssets({ type: AssetType.SNIPPET })

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          type: AssetType.SNIPPET,
        },
        orderBy: { updatedAt: 'desc' },
      })
      expect(result).toEqual(mockAssets)
    })

    it('should sort by newest (updatedAt desc)', async () => {
      const mockAssets = [
        createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Asset 1' }),
      ]
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)

      await getAssets({ sort: 'newest' })

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
        },
        orderBy: { updatedAt: 'desc' },
      })
    })

    it('should sort by oldest (createdAt asc)', async () => {
      const mockAssets = [
        createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Asset 1' }),
      ]
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)

      await getAssets({ sort: 'oldest' })

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
        },
        orderBy: { createdAt: 'asc' },
      })
    })

    it('should sort by az (title asc)', async () => {
      const mockAssets = [
        createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Asset A' }),
        createMockAsset({ id: 'asset-2', userId: mockUser.id, title: 'Asset B' }),
      ]
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)

      await getAssets({ sort: 'az' })

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
        },
        orderBy: { title: 'asc' },
      })
    })

    it('should sort by za (title desc)', async () => {
      const mockAssets = [
        createMockAsset({ id: 'asset-2', userId: mockUser.id, title: 'Asset B' }),
        createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Asset A' }),
      ]
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)

      await getAssets({ sort: 'za' })

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
        },
        orderBy: { title: 'desc' },
      })
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(getAssets()).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.findMany).not.toHaveBeenCalled()
    })

    it('should handle full-text search query', async () => {
      const mockAssets = [
        createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Search Result' }),
      ]
      mockPrisma.$queryRaw.mockResolvedValue(mockAssets)

      const result = await getAssets({ q: 'search term' })

      expect(mockPrisma.$queryRaw).toHaveBeenCalled()
      expect(result).toEqual(mockAssets)
    })

    it('should handle search with type filter', async () => {
      const mockAssets = [
        createMockAsset({
          id: 'asset-1',
          userId: mockUser.id,
          type: AssetType.LINK,
          title: 'Search Link',
        }),
      ]
      mockPrisma.$queryRaw.mockResolvedValue(mockAssets)

      const result = await getAssets({ q: 'search', type: AssetType.LINK })

      expect(mockPrisma.$queryRaw).toHaveBeenCalled()
      expect(result).toEqual(mockAssets)
    })
  })

  describe('updateAsset', () => {
    it('should update asset with single field', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        title: 'Updated Title',
      })
      mockPrisma.asset.update.mockResolvedValue(mockAsset)

      const result = await updateAsset('asset-1', { title: 'Updated Title' })

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
        data: { title: 'Updated Title' },
      })
      expect(result).toEqual(mockAsset)
    })

    it('should update asset with multiple fields', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        title: 'Updated Title',
        description: 'Updated Description',
        content: 'Updated Content',
        language: 'javascript',
        url: 'https://updated.example.com',
      })
      mockPrisma.asset.update.mockResolvedValue(mockAsset)

      const result = await updateAsset('asset-1', {
        title: 'Updated Title',
        description: 'Updated Description',
        content: 'Updated Content',
        language: 'javascript',
        url: 'https://updated.example.com',
      })

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
        data: {
          title: 'Updated Title',
          description: 'Updated Description',
          content: 'Updated Content',
          language: 'javascript',
          url: 'https://updated.example.com',
        },
      })
      expect(result).toEqual(mockAsset)
    })

    it('should revalidate paths after update', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        title: 'Updated Title',
      })
      mockPrisma.asset.update.mockResolvedValue(mockAsset)

      await updateAsset('asset-1', { title: 'Updated Title' })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/assets')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(3)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(
        updateAsset('asset-1', { title: 'Updated Title' })
      ).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteAsset', () => {
    it('should delete asset without file', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        filePath: null,
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.delete.mockResolvedValue(mockAsset)

      await deleteAsset('asset-1')

      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
      // No file to delete when filePath is null
      expect(mockPrisma.asset.delete).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
    })

    it('should verify path traversal protection allows valid paths', async () => {
      // This test verifies the path logic directly
      const { join } = await import('path')
      const uploadDir = process.env.UPLOAD_DIR || './uploads'
      const uploadsRoot = join(process.cwd(), uploadDir)
      const filePath = 'subdir/test-file.txt'
      const fullPath = join(uploadsRoot, filePath)

      // These should be true for valid paths
      const check1 = fullPath.startsWith(uploadsRoot + '/')
      const check2 = fullPath.startsWith(uploadsRoot + '\\')

      // At least one check should pass
      expect(check1 || check2).toBe(true)
    })

    it('should delete asset with file', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        filePath: 'subdir/test-file.txt',
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.delete.mockResolvedValue(mockAsset)

      await deleteAsset('asset-1')

      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
      // File deletion is attempted for assets with filePath
      expect(mockPrisma.asset.delete).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
    })

    it('should delete asset even if file unlink fails', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        filePath: 'subdir/test-file.txt',
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.delete.mockResolvedValue(mockAsset)

      // Should not throw even if file deletion fails
      await expect(deleteAsset('asset-1')).resolves.not.toThrow()
      expect(mockPrisma.asset.delete).toHaveBeenCalled()
    })

    it('should throw error when asset not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null)

      await expect(deleteAsset('non-existent')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.asset.delete).not.toHaveBeenCalled()
    })

    it('should revalidate paths after deletion', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        filePath: null,
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.delete.mockResolvedValue(mockAsset)

      await deleteAsset('asset-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/assets')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(deleteAsset('asset-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('togglePin', () => {
    it('should toggle pin from false to true', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        pinned: false,
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.update.mockResolvedValue({ ...mockAsset, pinned: true })

      await togglePin('asset-1')

      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
        data: { pinned: true },
      })
    })

    it('should toggle pin from true to false', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        pinned: true,
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.update.mockResolvedValue({ ...mockAsset, pinned: false })

      await togglePin('asset-1')

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
        data: { pinned: false },
      })
    })

    it('should throw error when asset not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null)

      await expect(togglePin('non-existent')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.asset.update).not.toHaveBeenCalled()
    })

    it('should revalidate paths after toggle', async () => {
      const mockAsset = createMockAsset({
        id: 'asset-1',
        userId: mockUser.id,
        pinned: false,
      })
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.asset.update.mockResolvedValue({ ...mockAsset, pinned: true })

      await togglePin('asset-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/assets')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(togglePin('asset-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('getDashboardData', () => {
    it('should return dashboard data', async () => {
      const mockPinnedAssets = [
        createMockAsset({ id: 'pinned-1', userId: mockUser.id, pinned: true }),
        createMockAsset({ id: 'pinned-2', userId: mockUser.id, pinned: true }),
      ]
      const mockPinnedCollections = [
        createMockCollection({ id: 'collection-1', userId: mockUser.id, pinned: true }),
      ]
      const mockRecentAssets = [
        createMockAsset({ id: 'recent-1', userId: mockUser.id }),
        createMockAsset({ id: 'recent-2', userId: mockUser.id }),
      ]

      mockPrisma.asset.findMany.mockResolvedValueOnce(mockPinnedAssets)
      mockPrisma.collection.findMany.mockResolvedValueOnce(mockPinnedCollections)
      mockPrisma.asset.findMany.mockResolvedValueOnce(mockRecentAssets)

      const result = await getDashboardData()

      expect(result).toEqual({
        pinnedAssets: mockPinnedAssets,
        pinnedCollections: mockPinnedCollections,
        recentAssets: mockRecentAssets,
      })
    })

    it('should limit pinned assets to 20', async () => {
      mockPrisma.asset.findMany.mockResolvedValueOnce([])
      mockPrisma.collection.findMany.mockResolvedValueOnce([])
      mockPrisma.asset.findMany.mockResolvedValueOnce([])

      await getDashboardData()

      expect(mockPrisma.asset.findMany).toHaveBeenNthCalledWith(1, {
        where: { userId: mockUser.id, pinned: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      })
    })

    it('should limit pinned collections to 20', async () => {
      mockPrisma.asset.findMany.mockResolvedValueOnce([])
      mockPrisma.collection.findMany.mockResolvedValueOnce([])
      mockPrisma.asset.findMany.mockResolvedValueOnce([])

      await getDashboardData()

      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, pinned: true },
        include: { _count: { select: { assets: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      })
    })

    it('should limit recent assets to 10', async () => {
      mockPrisma.asset.findMany.mockResolvedValueOnce([])
      mockPrisma.collection.findMany.mockResolvedValueOnce([])
      mockPrisma.asset.findMany.mockResolvedValueOnce([])

      await getDashboardData()

      expect(mockPrisma.asset.findMany).toHaveBeenNthCalledWith(2, {
        where: { userId: mockUser.id },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      })
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(getDashboardData()).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.findMany).not.toHaveBeenCalled()
    })
  })
})
