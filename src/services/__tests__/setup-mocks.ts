import {vi} from 'vitest'

// Mock le module db
vi.mock('@/db/models/db', () => ({
  default: {},
}))

vi.mock('../authentication/auth-utils', () => ({
  getAuthUser: vi.fn(),
  getSessionAuth: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db/repositories/user-repository', () => ({
  getUserByIdDao: vi.fn(() => Promise.resolve()),
}))
