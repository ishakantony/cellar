import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, MockPrisma } from '@/test/mocks/prisma'
import { createMockGetUser, createMockGetUserUnauthorized, mockUser } from '@/test/mocks/auth'
import { createMockAsset } from '@/test/utils/test-data'
import { AssetType } from '@/generated/prisma'
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

// Import after mocking
import { createAsset, getAssets } from './assets'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'

describe('assets actions', () => {
  const mockPrisma = prisma as unknown as MockPrisma
  const mockGetUser = getUser as ReturnType<typeof vi.fn>
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockImplementation(createMockGetUser())
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
})
