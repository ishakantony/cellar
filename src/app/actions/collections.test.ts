import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, MockPrisma } from '@/test/mocks/prisma'
import { createMockGetUser, createMockGetUserUnauthorized, mockUser } from '@/test/mocks/auth'
import { createMockCollection, createMockAsset, createMockAssetCollection } from '@/test/utils/test-data'
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
import { 
  createCollection, 
  updateCollection, 
  deleteCollection,
  getCollections,
  getCollection,
  toggleCollectionPin,
  addAssetToCollection,
  removeAssetFromCollection,
} from './collections'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'

describe('collections actions', () => {
  const mockPrisma = prisma as unknown as MockPrisma
  const mockGetUser = getUser as ReturnType<typeof vi.fn>
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockImplementation(createMockGetUser())
  })

  describe('createCollection', () => {
    it('should create collection with user association', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-456',
        userId: mockUser.id,
        name: 'My Collection',
      })
      mockPrisma.collection.create.mockResolvedValue(mockCollection)

      const result = await createCollection({
        name: 'My Collection',
      })

      expect(mockPrisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'My Collection',
          userId: mockUser.id,
        },
      })
      expect(result).toEqual(mockCollection)
    })

    it('should create collection with all fields', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-789',
        userId: mockUser.id,
        name: 'Complete Collection',
        description: 'A test description',
        color: '#ff0000',
      })
      mockPrisma.collection.create.mockResolvedValue(mockCollection)

      const result = await createCollection({
        name: 'Complete Collection',
        description: 'A test description',
        color: '#ff0000',
      })

      expect(mockPrisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'Complete Collection',
          description: 'A test description',
          color: '#ff0000',
          userId: mockUser.id,
        },
      })
      expect(result).toEqual(mockCollection)
    })

    it('should revalidate paths after creation', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-999',
        userId: mockUser.id,
        name: 'Revalidation Test',
      })
      mockPrisma.collection.create.mockResolvedValue(mockCollection)

      await createCollection({
        name: 'Revalidation Test',
      })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(
        createCollection({
          name: 'Unauthorized Test',
        })
      ).rejects.toThrow('Unauthorized')

      expect(mockPrisma.collection.create).not.toHaveBeenCalled()
    })
  })

  describe('updateCollection', () => {
    it('should update collection with single field', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
        name: 'Updated Collection',
      })
      mockPrisma.collection.update.mockResolvedValue(mockCollection)

      const result = await updateCollection('collection-1', { name: 'Updated Collection' })

      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
        data: { name: 'Updated Collection' },
      })
      expect(result).toEqual(mockCollection)
    })

    it('should update collection with multiple fields', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
        name: 'Updated Collection',
        description: 'Updated Description',
        color: '#00ff00',
      })
      mockPrisma.collection.update.mockResolvedValue(mockCollection)

      const result = await updateCollection('collection-1', {
        name: 'Updated Collection',
        description: 'Updated Description',
        color: '#00ff00',
      })

      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
        data: {
          name: 'Updated Collection',
          description: 'Updated Description',
          color: '#00ff00',
        },
      })
      expect(result).toEqual(mockCollection)
    })

    it('should revalidate paths after update', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
        name: 'Updated Collection',
      })
      mockPrisma.collection.update.mockResolvedValue(mockCollection)

      await updateCollection('collection-1', { name: 'Updated Collection' })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(
        updateCollection('collection-1', { name: 'Updated Collection' })
      ).rejects.toThrow('Unauthorized')

      expect(mockPrisma.collection.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteCollection', () => {
    it('should delete collection', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
      })
      mockPrisma.collection.delete.mockResolvedValue(mockCollection)

      await deleteCollection('collection-1')

      expect(mockPrisma.collection.delete).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
      })
    })

    it('should revalidate paths after deletion', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
      })
      mockPrisma.collection.delete.mockResolvedValue(mockCollection)

      await deleteCollection('collection-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(deleteCollection('collection-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.collection.delete).not.toHaveBeenCalled()
    })
  })

  describe('getCollections', () => {
    it('should return collections with asset counts', async () => {
      const mockCollections = [
        { ...createMockCollection({ id: 'collection-1', userId: mockUser.id, name: 'Collection 1' }), _count: { assets: 5 } },
        { ...createMockCollection({ id: 'collection-2', userId: mockUser.id, name: 'Collection 2' }), _count: { assets: 3 } },
      ]
      mockPrisma.collection.findMany.mockResolvedValue(mockCollections)

      const result = await getCollections()

      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: { _count: { select: { assets: true } } },
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      })
      expect(result).toEqual(mockCollections)
    })

    it('should sort by pinned desc then updatedAt desc', async () => {
      const mockCollections = [
        { ...createMockCollection({ id: 'collection-1', userId: mockUser.id }), _count: { assets: 0 } },
      ]
      mockPrisma.collection.findMany.mockResolvedValue(mockCollections)

      await getCollections()

      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: { _count: { select: { assets: true } } },
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      })
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(getCollections()).rejects.toThrow('Unauthorized')

      expect(mockPrisma.collection.findMany).not.toHaveBeenCalled()
    })
  })

  describe('getCollection', () => {
    it('should return collection with assets', async () => {
      const mockAsset1 = createMockAsset({ id: 'asset-1', userId: mockUser.id, title: 'Asset 1' })
      const mockAsset2 = createMockAsset({ id: 'asset-2', userId: mockUser.id, title: 'Asset 2' })
      const mockCollection = {
        ...createMockCollection({ id: 'collection-1', userId: mockUser.id }),
        assets: [
          { ...createMockAssetCollection({ assetId: 'asset-1', collectionId: 'collection-1' }), asset: mockAsset1 },
          { ...createMockAssetCollection({ assetId: 'asset-2', collectionId: 'collection-1' }), asset: mockAsset2 },
        ],
        _count: { assets: 2 },
      }
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)

      const result = await getCollection('collection-1')

      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
        include: {
          assets: {
            include: { asset: true },
            orderBy: { asset: { updatedAt: 'desc' } },
          },
          _count: { select: { assets: true } },
        },
      })
      expect(result).toEqual(mockCollection)
    })

    it('should return null when collection not found', async () => {
      mockPrisma.collection.findUnique.mockResolvedValue(null)

      const result = await getCollection('non-existent')

      expect(result).toBeNull()
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(getCollection('collection-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.collection.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('toggleCollectionPin', () => {
    it('should toggle pin from false to true', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
        pinned: false,
      })
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.collection.update.mockResolvedValue({ ...mockCollection, pinned: true })

      await toggleCollectionPin('collection-1')

      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
      })
      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
        data: { pinned: true },
      })
    })

    it('should toggle pin from true to false', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
        pinned: true,
      })
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.collection.update.mockResolvedValue({ ...mockCollection, pinned: false })

      await toggleCollectionPin('collection-1')

      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
        data: { pinned: false },
      })
    })

    it('should throw error when collection not found', async () => {
      mockPrisma.collection.findUnique.mockResolvedValue(null)

      await expect(toggleCollectionPin('non-existent')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.collection.update).not.toHaveBeenCalled()
    })

    it('should revalidate paths after toggle', async () => {
      const mockCollection = createMockCollection({
        id: 'collection-1',
        userId: mockUser.id,
        pinned: false,
      })
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.collection.update.mockResolvedValue({ ...mockCollection, pinned: true })

      await toggleCollectionPin('collection-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(toggleCollectionPin('collection-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.collection.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('addAssetToCollection', () => {
    it('should add asset to collection when both exist', async () => {
      const mockAsset = createMockAsset({ id: 'asset-1', userId: mockUser.id })
      const mockCollection = createMockCollection({ id: 'collection-1', userId: mockUser.id })

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.assetCollection.upsert.mockResolvedValue(
        createMockAssetCollection({ assetId: 'asset-1', collectionId: 'collection-1' })
      )

      await addAssetToCollection('asset-1', 'collection-1')

      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
      })
      expect(mockPrisma.assetCollection.upsert).toHaveBeenCalledWith({
        where: { assetId_collectionId: { assetId: 'asset-1', collectionId: 'collection-1' } },
        create: { assetId: 'asset-1', collectionId: 'collection-1' },
        update: {},
      })
    })

    it('should revalidate paths after adding asset', async () => {
      const mockAsset = createMockAsset({ id: 'asset-1', userId: mockUser.id })
      const mockCollection = createMockCollection({ id: 'collection-1', userId: mockUser.id })

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.assetCollection.upsert.mockResolvedValue(
        createMockAssetCollection({ assetId: 'asset-1', collectionId: 'collection-1' })
      )

      await addAssetToCollection('asset-1', 'collection-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1)
    })

    it('should throw error when asset not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null)
      mockPrisma.collection.findUnique.mockResolvedValue(
        createMockCollection({ id: 'collection-1', userId: mockUser.id })
      )

      await expect(addAssetToCollection('non-existent', 'collection-1')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.assetCollection.upsert).not.toHaveBeenCalled()
    })

    it('should throw error when collection not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(
        createMockAsset({ id: 'asset-1', userId: mockUser.id })
      )
      mockPrisma.collection.findUnique.mockResolvedValue(null)

      await expect(addAssetToCollection('asset-1', 'non-existent')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.assetCollection.upsert).not.toHaveBeenCalled()
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(addAssetToCollection('asset-1', 'collection-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.findUnique).not.toHaveBeenCalled()
      expect(mockPrisma.collection.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('removeAssetFromCollection', () => {
    it('should remove asset from collection', async () => {
      const mockAsset = createMockAsset({ id: 'asset-1', userId: mockUser.id })
      const mockCollection = createMockCollection({ id: 'collection-1', userId: mockUser.id })

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.assetCollection.delete.mockResolvedValue(
        createMockAssetCollection({ assetId: 'asset-1', collectionId: 'collection-1' })
      )

      await removeAssetFromCollection('asset-1', 'collection-1')

      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1', userId: mockUser.id },
      })
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'collection-1', userId: mockUser.id },
      })
      expect(mockPrisma.assetCollection.delete).toHaveBeenCalledWith({
        where: {
          assetId_collectionId: { assetId: 'asset-1', collectionId: 'collection-1' },
        },
      })
    })

    it('should revalidate paths after removing asset', async () => {
      const mockAsset = createMockAsset({ id: 'asset-1', userId: mockUser.id })
      const mockCollection = createMockCollection({ id: 'collection-1', userId: mockUser.id })

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection)
      mockPrisma.assetCollection.delete.mockResolvedValue(
        createMockAssetCollection({ assetId: 'asset-1', collectionId: 'collection-1' })
      )

      await removeAssetFromCollection('asset-1', 'collection-1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/collections')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1)
    })

    it('should throw error when asset not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null)
      mockPrisma.collection.findUnique.mockResolvedValue(
        createMockCollection({ id: 'collection-1', userId: mockUser.id })
      )

      await expect(removeAssetFromCollection('non-existent', 'collection-1')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.assetCollection.delete).not.toHaveBeenCalled()
    })

    it('should throw error when collection not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(
        createMockAsset({ id: 'asset-1', userId: mockUser.id })
      )
      mockPrisma.collection.findUnique.mockResolvedValue(null)

      await expect(removeAssetFromCollection('asset-1', 'non-existent')).rejects.toThrow('Resource not found or access denied')

      expect(mockPrisma.assetCollection.delete).not.toHaveBeenCalled()
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockImplementation(createMockGetUserUnauthorized())

      await expect(removeAssetFromCollection('asset-1', 'collection-1')).rejects.toThrow('Unauthorized')

      expect(mockPrisma.asset.findUnique).not.toHaveBeenCalled()
      expect(mockPrisma.collection.findUnique).not.toHaveBeenCalled()
    })
  })
})
