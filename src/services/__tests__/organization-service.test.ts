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
  UserOrganizationRoleConst,
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
    // Admin système peut tout faire
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

describe('[ORGANIZATION OWNER] CRUD : OrganizationService', () => {
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

  const updateData: UpdateOrganization = {
    id: organizationId,
    name: 'Updated Organization',
    slug: 'updated-organization',
    description: 'Description mise à jour',
  }

  beforeEach(() => {
    // Utilisateur qui est OWNER de cette organisation
    const userOwner = {
      ...userTest,
      organizations: [
        {
          userId: userTest.id,
          organizationId,
          role: UserOrganizationRoleConst.OWNER,
          joinedAt: new Date(),
        },
      ],
    }
    setupAuthUserMocked(userOwner)
    vi.clearAllMocks()
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
    vi.mocked(updateOrganizationDao).mockResolvedValue()
    vi.mocked(deleteOrganizationDao).mockResolvedValue()
  })

  it('should update organization as owner', async () => {
    await updateOrganizationService(updateData)

    expect(updateOrganizationDao).toHaveBeenCalledTimes(1)
  })

  it('should delete organization as owner', async () => {
    await deleteOrganizationService(organizationId)

    expect(deleteOrganizationDao).toHaveBeenCalledWith(organizationId)
  })
})

describe('[ORGANIZATION ADMIN] CRUD : OrganizationService', () => {
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

  const updateData: UpdateOrganization = {
    id: organizationId,
    name: 'Updated Organization',
    slug: 'updated-organization',
    description: 'Description mise à jour',
  }

  beforeEach(() => {
    // Utilisateur qui est ADMIN de cette organisation
    const userAdmin = {
      ...userTest,
      organizations: [
        {
          userId: userTest.id,
          organizationId,
          role: UserOrganizationRoleConst.ADMIN,
          joinedAt: new Date(),
        },
      ],
    }
    setupAuthUserMocked(userAdmin)
    vi.clearAllMocks()
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
    vi.mocked(updateOrganizationDao).mockResolvedValue()
    vi.mocked(deleteOrganizationDao).mockResolvedValue()
  })

  it('should update organization as admin', async () => {
    await updateOrganizationService(updateData)

    expect(updateOrganizationDao).toHaveBeenCalledTimes(1)
  })

  it('should NOT delete organization as admin (only owner can)', async () => {
    await expect(deleteOrganizationService(organizationId)).rejects.toThrow(
      AuthorizationError
    )
    expect(deleteOrganizationDao).not.toHaveBeenCalled()
  })
})

describe('[ORGANIZATION MEMBER] CRUD : OrganizationService', () => {
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

  const updateData: UpdateOrganization = {
    id: organizationId,
    name: 'Updated Organization',
    slug: 'updated-organization',
    description: 'Description mise à jour',
  }

  beforeEach(() => {
    // Utilisateur qui est MEMBER de cette organisation
    const userMember = {
      ...userTest,
      organizations: [
        {
          userId: userTest.id,
          organizationId,
          role: UserOrganizationRoleConst.MEMBER,
          joinedAt: new Date(),
        },
      ],
    }
    setupAuthUserMocked(userMember)
    vi.clearAllMocks()
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
    vi.mocked(updateOrganizationDao).mockResolvedValue()
    vi.mocked(deleteOrganizationDao).mockResolvedValue()
  })

  it('should read organization as member', async () => {
    const result = await getOrganizationByIdService(organizationId)

    expect(result).toEqual(organizationData)
    expect(getOrganizationByIdDao).toHaveBeenCalledWith(organizationId)
  })

  it('should NOT update organization as member', async () => {
    await expect(updateOrganizationService(updateData)).rejects.toThrow(
      AuthorizationError
    )
    expect(updateOrganizationDao).not.toHaveBeenCalled()
  })

  it('should NOT delete organization as member', async () => {
    await expect(deleteOrganizationService(organizationId)).rejects.toThrow(
      AuthorizationError
    )
    expect(deleteOrganizationDao).not.toHaveBeenCalled()
  })
})

describe('[USER NOT IN ORGANIZATION] CRUD : OrganizationService', () => {
  const organizationId = faker.string.uuid()
  const otherOrganizationId = faker.string.uuid()
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
    // Utilisateur connecté mais pas membre de cette organisation
    const userNotInOrg = {
      ...userTest,
      organizations: [
        {
          userId: userTest.id,
          organizationId: otherOrganizationId, // Différente organisation
          role: UserOrganizationRoleConst.OWNER,
          joinedAt: new Date(),
        },
      ],
    }
    setupAuthUserMocked(userNotInOrg)
    vi.clearAllMocks()
    vi.mocked(getOrganizationByIdDao).mockResolvedValue(organizationData)
    vi.mocked(updateOrganizationDao).mockResolvedValue()
    vi.mocked(deleteOrganizationDao).mockResolvedValue()
  })

  it('should create a new organization (any user can create)', async () => {
    vi.mocked(createOrganizationDao).mockResolvedValue(organizationData)

    const result = await createOrganizationService(createData)

    expect(result).toEqual(organizationData)
    expect(createOrganizationDao).toHaveBeenCalledTimes(1)
  })

  it('should read organization (general read permission)', async () => {
    const result = await getOrganizationByIdService(organizationId)

    expect(result).toEqual(organizationData)
    expect(getOrganizationByIdDao).toHaveBeenCalledWith(organizationId)
  })

  it('should NOT update organization if not member', async () => {
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

  it('should NOT read organization as guest (authentication required)', async () => {
    await expect(getOrganizationByIdService(organizationId)).rejects.toThrow(
      AuthorizationError
    )
    expect(getOrganizationByIdDao).not.toHaveBeenCalled()
  })
})
