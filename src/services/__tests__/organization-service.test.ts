import {faker} from '@faker-js/faker'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {
  createOrganizationDao,
  deleteOrganizationDao,
  getOrganizationByIdDao,
  getOrganizationsByUserIdDao,
  getOrganizationsDao,
  updateOrganizationDao,
} from '@/db/repositories/organization-repository'

import {AuthorizationError} from '../errors/authorization-error'
import {
  createOrganizationService,
  deleteOrganizationService,
  getOrganizationByIdService,
  getOrganizationsByUserIdService,
  getOrganizationsService,
  updateOrganizationService,
} from '../organization-service'
import {Pagination} from '../types/common-type'
import {
  CreateOrganization,
  Organization,
  UpdateOrganization,
} from '../types/domain/organization-types'
import {setupAuthUserMocked} from './helper-service-test'
import {userTest, userTestAdmin} from './service-test-data'

// Mock des DAOs
vi.mock('@/db/repositories/organization-repository')

describe('[ADMIN] CRUD : OrganizationService', () => {
  const organizationId = faker.string.uuid()
  const organizationData: Organization = {
    id: organizationId,
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'Description de test',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createData: CreateOrganization = {
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'Description de test',
  }

  const updateData: UpdateOrganization = {
    id: organizationId,
    name: 'Updated Organization',
    slug: 'updated-organization',
    description: 'Description mise à jour',
  }

  const pagination: Pagination = {
    limit: 10,
    offset: 0,
  }

  beforeEach(() => {
    const user = {
      ...userTestAdmin,
    }
    setupAuthUserMocked(user)
    vi.clearAllMocks()
    vi.mocked(createOrganizationDao).mockResolvedValue(organizationData)
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
    vi.mocked(getOrganizationsDao).mockResolvedValue({
      data: [organizationData],
      pagination: {rowCount: 1, pageSize: 10},
    })
    vi.mocked(getOrganizationsByUserIdDao).mockResolvedValue([organizationData])
    vi.mocked(updateOrganizationDao).mockResolvedValue()
    vi.mocked(deleteOrganizationDao).mockResolvedValue()
  })

  it('should create a new organization', async () => {
    const result = await createOrganizationService(createData)

    expect(result).toEqual(organizationData)
    expect(createOrganizationDao).toHaveBeenCalledTimes(1)
  })

  it('should get an organization by id', async () => {
    const result = await getOrganizationByIdService(organizationId)

    expect(result).toEqual(organizationData)
    expect(getOrganizationByIdDao).toHaveBeenCalledWith(organizationId)
  })

  it('should update an organization', async () => {
    await updateOrganizationService(updateData)

    expect(updateOrganizationDao).toHaveBeenCalledTimes(1)
  })

  it('should delete an organization', async () => {
    await deleteOrganizationService(organizationId)

    expect(deleteOrganizationDao).toHaveBeenCalledWith(organizationId)
  })

  it('should get all organizations', async () => {
    const result = await getOrganizationsService(pagination)

    expect(result).toEqual({
      data: [organizationData],
      pagination: {rowCount: 1, pageSize: 10},
    })
    expect(getOrganizationsDao).toHaveBeenCalledWith(pagination)
  })

  it('should get organizations by user id', async () => {
    const result = await getOrganizationsByUserIdService(userTestAdmin.id)

    expect(result).toEqual([organizationData])
    expect(getOrganizationsByUserIdDao).toHaveBeenCalledWith(userTestAdmin.id)
  })
})

describe('[USER] CRUD : OrganizationService', () => {
  const organizationId = faker.string.uuid()
  const organizationData: Organization = {
    id: organizationId,
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'Description de test',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createData: CreateOrganization = {
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'Description de test',
  }

  const updateData: UpdateOrganization = {
    id: organizationId,
    name: 'Updated Organization',
    slug: 'updated-organization',
    description: 'Description mise à jour',
  }

  beforeEach(() => {
    const user = {
      ...userTest,
    }
    setupAuthUserMocked(user)
    vi.clearAllMocks()
    vi.mocked(createOrganizationDao).mockResolvedValue(organizationData)
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
    vi.mocked(updateOrganizationDao).mockResolvedValue()
    vi.mocked(deleteOrganizationDao).mockResolvedValue()
  })

  it('should create a new organization', async () => {
    const result = await createOrganizationService(createData)

    expect(result).toEqual(organizationData)
    expect(createOrganizationDao).toHaveBeenCalledTimes(1)
  })

  it('should get an organization by id', async () => {
    const result = await getOrganizationByIdService(organizationId)

    expect(result).toEqual(organizationData)
    expect(getOrganizationByIdDao).toHaveBeenCalledWith(organizationId)
  })

  it('should NOT update organization if not owner/admin', async () => {
    // Mock pour simuler que l'utilisateur n'est pas owner/admin de cette org
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)

    await expect(updateOrganizationService(updateData)).rejects.toThrow(
      AuthorizationError
    )
    expect(updateOrganizationDao).not.toHaveBeenCalled()
  })

  it('should NOT delete organization if not owner', async () => {
    await expect(deleteOrganizationService(organizationId)).rejects.toThrow(
      AuthorizationError
    )
    expect(deleteOrganizationDao).not.toHaveBeenCalled()
  })
})

describe('[PUBLIC] OrganizationService', () => {
  const organizationId = faker.string.uuid()
  const organizationData: Organization = {
    id: organizationId,
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'Description de test',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createData: CreateOrganization = {
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'Description de test',
  }

  beforeEach(() => {
    // Pas d'utilisateur connecté (guest)
    setupAuthUserMocked(undefined)
    vi.clearAllMocks()
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
  })

  it('should NOT create organization as guest', async () => {
    await expect(createOrganizationService(createData)).rejects.toThrow(
      AuthorizationError
    )
    expect(createOrganizationDao).not.toHaveBeenCalled()
  })

  it('should NOT get organization by id as guest', async () => {
    await expect(getOrganizationByIdService(organizationId)).rejects.toThrow(
      AuthorizationError
    )
  })
})
