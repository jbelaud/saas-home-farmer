import {beforeEach, describe, expect, it, vi} from 'vitest'

vi.mock('@/db/repositories/user-repository', () => ({
  getUserByIdDao: vi.fn(),
  searchUsersDao: vi.fn(),
}))

import * as userRepository from '@/db/repositories/user-repository'

import {RoleConst} from '../types/domain/auth-types'
import {User} from '../types/domain/user-types'
import {getUserByIdService, searchUsersService} from '../user-service'
import {setupAuthUserMocked} from './helper-service-test'

const currentAuthUserId = 'ae760f8e-4aa6-4d71-a4c8-344429b7ae21' //faker.string.uuid()
const differentUserId = 'de760f8e-4aa6-4d71-a4c8-344429b7ae28' //faker.string.uuid()

const userTest = {
  id: currentAuthUserId,
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  image: null,
  role: RoleConst.USER,
  visibility: 'private',
  banned: null,
  banReason: null,
  banExpires: null,
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
      role: RoleConst.ADMIN,
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

describe('[searchUsersService]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait retourner les utilisateurs correspondant au nom', async () => {
    const users = [
      {...userTest, name: 'Alice'},
      {...userTest, name: 'Alicia', email: 'alicia@example.com'},
    ]
    vi.mocked(userRepository.searchUsersDao).mockResolvedValue(users)
    const result = await searchUsersService('Ali')
    expect(result).toEqual(users)
    expect(userRepository.searchUsersDao).toHaveBeenCalledWith('Ali', undefined)
  })

  it("devrait retourner les utilisateurs correspondant à l'email", async () => {
    const users = [{...userTest, email: 'bob@example.com', name: 'Bob'}]
    vi.mocked(userRepository.searchUsersDao).mockResolvedValue(users)
    const result = await searchUsersService('bob@')
    expect(result).toEqual(users)
    expect(userRepository.searchUsersDao).toHaveBeenCalledWith(
      'bob@',
      undefined
    )
  })

  it("devrait exclure les membres d'une organisation", async () => {
    const users = [
      {...userTest, id: '1', name: 'Charlie'},
      {...userTest, id: '2', name: 'Charlotte'},
    ]
    vi.mocked(userRepository.searchUsersDao).mockResolvedValue(users)
    const result = await searchUsersService('Char', 'org-123')
    expect(result).toEqual(users)
    expect(userRepository.searchUsersDao).toHaveBeenCalledWith(
      'Char',
      'org-123'
    )
  })

  it('devrait lever une erreur si le terme est trop court', async () => {
    await expect(searchUsersService('a')).rejects.toThrow(
      'Le terme de recherche doit contenir au moins 2 caractères.'
    )
  })

  it('devrait retourner un tableau vide si aucun résultat', async () => {
    vi.mocked(userRepository.searchUsersDao).mockResolvedValue([])
    const result = await searchUsersService('zzzz')
    expect(result).toEqual([])
  })
})
