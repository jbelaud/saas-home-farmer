import {vi} from 'vitest'

// Mock le module db
vi.mock('@/db/models/db', () => ({
  default: {},
}))

vi.mock('../authentication/auth-service', () => ({
  getAuthUser: vi.fn(),
  getSessionAuth: vi.fn(),
  getSessionReferenceId: vi.fn(),
  getActiveSubscriptions: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db/repositories/user-repository', () => ({
  getUserByIdDao: vi.fn(() => Promise.resolve()),
}))
