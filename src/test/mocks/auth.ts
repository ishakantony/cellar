import { vi } from 'vitest'

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  image: null,
}

export function createMockGetUser(user = mockUser) {
  return vi.fn(() => Promise.resolve(user))
}

export function createMockGetUserUnauthorized() {
  return vi.fn(() => Promise.reject(new Error('Unauthorized')))
}
