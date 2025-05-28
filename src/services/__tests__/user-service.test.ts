import {beforeEach, describe, expect, it, vi} from 'vitest'

import * as userRepository from '@/db/repositories/user-repository'

import {User} from '../types/domain/user-types'
import {getUserByIdService} from '../user-service'
import {setupAuthUserMocked} from './helper-service-test'

const currentAuthUserId = 'ae760f8e-4aa6-4d71-a4c8-344429b7ae21' //faker.string.uuid()
const differentUserId = 'de760f8e-4aa6-4d71-a4c8-344429b7ae28' //faker.string.uuid()

const userTest = {
  id: currentAuthUserId,
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date(),
  image: null,
  role: 'user',
  visibility: 'private',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User

describe("[getUserById] Lors de l'appel de la fonction", () => {
  const userId = currentAuthUserId
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userRepository.getUserByIdDao).mockResolvedValue(userTest)
  })
  it("[USER] devrait appelé `getUserByIdDao` si l'utilisateur est celui qui est connecté", async () => {
    setupAuthUserMocked(userTest)
    const result = await getUserByIdService(userId)
    expect(result).toEqual(userTest)
    expect(userRepository.getUserByIdDao).toHaveBeenCalledTimes(2)
  })
  it("[USER] devrait levé une erreur si l'utilisateur n'est pas celui connecté et privé", async () => {
    const user = {
      ...userTest,
      id: differentUserId,
    }
    setupAuthUserMocked(user)
    await expect(
      getUserByIdService(currentAuthUserId)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Accès non autorisé.]`
    )
  })
  it("[ADMIN] devrait appelé `getUserByIdDao` si l'utilisateur est un `admin`", async () => {
    const user = {
      ...userTest,
      role: 'admin',
    } satisfies User
    setupAuthUserMocked(user)
    const result = await getUserByIdService(differentUserId)
    expect(result).toEqual(userTest)
    expect(userRepository.getUserByIdDao).toHaveBeenCalledTimes(2)
  })
  it("[PUBLIC] devrait appelé `getUserByIdDao` si l'utilisateur est `public`", async () => {
    const userPublic = {
      ...userTest,
      id: differentUserId,
      visibility: 'public',
    } satisfies User

    setupAuthUserMocked(undefined)
    vi.mocked(userRepository.getUserByIdDao).mockResolvedValue(userPublic)

    const result = await getUserByIdService(differentUserId)
    expect(result).toEqual(userPublic)
    expect(userRepository.getUserByIdDao).toHaveBeenCalledTimes(2)
  })
  it("[PUBLIC] devrait levé une erreur si l'utilisateur est `privé`", async () => {
    const userPrivate = userTest

    setupAuthUserMocked(undefined)
    vi.mocked(userRepository.getUserByIdDao).mockResolvedValue(userPrivate)

    await expect(
      getUserByIdService(differentUserId)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Accès non autorisé.]`
    )
  })
})
