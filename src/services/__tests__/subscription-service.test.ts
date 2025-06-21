import {faker} from '@faker-js/faker'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {
  createSubscriptionDao,
  getActiveSubscriptionsByUserIdDao,
  getSubscriptionByIdDao,
  isActivePlanExistDao,
  isPlanExistDao,
  updateSubscriptionDao,
} from '@/db/repositories/subscription-repository'
import {
  getUserByEmailDao,
  getUserByIdDao,
} from '@/db/repositories/user-repository'

import {AuthorizationError} from '../errors/authorization-error'
import {
  createSubscriptionFromStripeService,
  createSubscriptionService,
  getActiveSubscriptionsByUserIdService,
  getSubscriptionByIdService,
  updateSubscriptionService,
} from '../subscription-service'
import {Subscription} from '../types/domain/subscription-types'
import {setupAuthUserMocked} from './helper-service-test'
import {userTest, userTestAdmin} from './service-test-data'

// Mock repositories
vi.mock('@/db/repositories/subscription-repository', () => ({
  createSubscriptionDao: vi.fn(),
  getSubscriptionByIdDao: vi.fn(),
  updateSubscriptionDao: vi.fn(),
  isPlanExistDao: vi.fn(),
  isActivePlanExistDao: vi.fn(),
  getActiveSubscriptionsByUserIdDao: vi.fn(),
}))

vi.mock('@/db/repositories/user-repository', () => ({
  getUserByEmailDao: vi.fn(),
  getUserByIdDao: vi.fn(),
}))

describe('[ADMIN] CRUD : Subscription Service', () => {
  const subscriptionId = faker.string.uuid()
  const subscriptionData: Subscription = {
    id: subscriptionId,
    referenceId: userTestAdmin.id,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    periodStart: new Date(),
    periodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    canceledAt: new Date(),
    trialStart: new Date(),
    trialEnd: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: 'sub_123',
    priceId: 'price_123',
    paymentMethodId: 'pm_123',
    cancelAtPeriodEnd: false,
    seats: 1,
    metadata: {},
  }

  beforeEach(() => {
    setupAuthUserMocked(userTestAdmin)
    vi.clearAllMocks()
    vi.mocked(createSubscriptionDao).mockResolvedValue(subscriptionData)
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue(subscriptionData)
    vi.mocked(updateSubscriptionDao).mockResolvedValue(subscriptionData)
  })

  it('should create a new subscription', async () => {
    const createData = {
      referenceId: userTestAdmin.id,
      plan: 'CODEMAIL_PRO',
      subscriptionType: 'subscription' as const,
      status: 'active',
      periodStart: new Date(),
      periodEnd: new Date(),
    }
    const result = await createSubscriptionService(createData)

    expect(result).toEqual(subscriptionData)
    expect(createSubscriptionDao).toHaveBeenCalledWith(createData)
  })

  it('should get a subscription by id', async () => {
    const result = await getSubscriptionByIdService(subscriptionId)

    expect(result).toEqual(subscriptionData)
    expect(getSubscriptionByIdDao).toHaveBeenCalledWith(subscriptionId)
  })

  it('should update a subscription', async () => {
    const updateData = {
      id: subscriptionId,
      referenceId: userTestAdmin.id,
      plan: 'CODEMAIL_LIFETIME',
      status: 'active',
    }
    const result = await updateSubscriptionService(updateData)

    expect(result).toEqual(subscriptionData)
    expect(updateSubscriptionDao).toHaveBeenCalledWith(
      subscriptionId,
      updateData
    )
  })
})

describe('[USER] CRUD : Subscription Service', () => {
  const subscriptionId = faker.string.uuid()
  const authUserId = userTest.id
  const subscriptionData: Subscription = {
    id: subscriptionId,
    referenceId: authUserId,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    periodStart: new Date(),
    periodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    canceledAt: new Date(),
    trialStart: new Date(),
    trialEnd: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: 'sub_123',
    priceId: 'price_123',
    paymentMethodId: 'pm_123',
    cancelAtPeriodEnd: false,
    seats: 1,
    metadata: {},
  }

  beforeEach(() => {
    setupAuthUserMocked(userTest)
    vi.clearAllMocks()
    vi.mocked(createSubscriptionDao).mockResolvedValue(subscriptionData)
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue({
      ...subscriptionData,
      referenceId: 'other-user',
    })
    vi.mocked(updateSubscriptionDao).mockResolvedValue(subscriptionData)
  })

  it('should create own subscription', async () => {
    const createData = {
      referenceId: authUserId,
      plan: 'CODEMAIL_PRO',
      subscriptionType: 'subscription' as const,
      status: 'active',
      periodStart: new Date(),
      periodEnd: new Date(),
    }
    const result = await createSubscriptionService(createData)

    expect(result).toEqual(subscriptionData)
    expect(createSubscriptionDao).toHaveBeenCalledWith(createData)
  })

  it("should NOT read another user's subscription", async () => {
    await expect(getSubscriptionByIdService(subscriptionId)).rejects.toThrow(
      AuthorizationError
    )
    expect(getSubscriptionByIdDao).toHaveBeenCalledWith(subscriptionId)
  })

  it("should NOT update another user's subscription", async () => {
    const updateData = {
      id: subscriptionId,
      referenceId: authUserId,
      plan: 'CODEMAIL_LIFETIME',
    }
    await expect(updateSubscriptionService(updateData)).rejects.toThrow(
      AuthorizationError
    )
    expect(updateSubscriptionDao).not.toHaveBeenCalled()
  })

  it.skip('should read own subscription', async () => {
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue({
      ...subscriptionData,
      referenceId: authUserId,
    })
    const result = await getSubscriptionByIdService(subscriptionId)
    expect(result).toEqual({...subscriptionData, referenceId: authUserId})
  })

  it.skip('should update own subscription', async () => {
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue({
      ...subscriptionData,
      referenceId: authUserId,
    })
    const updateData = {
      id: subscriptionId,
      referenceId: authUserId,
      plan: 'CODEMAIL_LIFETIME',
    }
    const result = await updateSubscriptionService(updateData)
    expect(result).toEqual(subscriptionData)
    expect(updateSubscriptionDao).toHaveBeenCalledWith(
      subscriptionId,
      updateData
    )
  })
})

describe('[PUBLIC] CRUD : Subscription Service', () => {
  const subscriptionId = faker.string.uuid()

  beforeEach(() => {
    setupAuthUserMocked()
    vi.clearAllMocks()
  })

  it('should NOT access subscriptions', async () => {
    await expect(getSubscriptionByIdService(subscriptionId)).rejects.toThrow(
      AuthorizationError
    )
    expect(getSubscriptionByIdDao).not.toHaveBeenCalled()
  })
})

describe('[STRIPE] Webhook Subscription Service', () => {
  const subscriptionId = faker.string.uuid()
  const testEmail = 'test@example.com'
  const subscriptionData: Subscription = {
    id: subscriptionId,
    referenceId: userTest.id,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    periodStart: new Date(),
    periodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    canceledAt: new Date(),
    trialStart: new Date(),
    trialEnd: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: 'sub_123',
    priceId: 'price_123',
    paymentMethodId: 'pm_123',
    cancelAtPeriodEnd: false,
    seats: 1,
    metadata: {},
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserByEmailDao).mockResolvedValue({
      ...userTest,
      email: testEmail,
    })
    vi.mocked(createSubscriptionDao).mockResolvedValue(subscriptionData)
    vi.mocked(isPlanExistDao).mockResolvedValue(false)
    vi.mocked(isActivePlanExistDao).mockResolvedValue(false)
  })

  it.skip('should create PRO subscription when productType is pro', async () => {
    const result = await createSubscriptionFromStripeService(
      testEmail,
      'CODEMAIL_PRO',
      false
    )

    expect(result).toEqual(subscriptionData)
    expect(getUserByEmailDao).toHaveBeenCalledWith(testEmail)
    expect(isActivePlanExistDao).toHaveBeenCalledWith(
      userTest.id,
      'CODEMAIL_PRO'
    )
    expect(createSubscriptionDao).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceId: userTest.id,
        plan: 'CODEMAIL_PRO',
        status: 'active',
        subscriptionType: 'payment',
        periodStart: expect.any(Date),
        periodEnd: expect.any(Date),
        metadata: expect.objectContaining({
          mode: 'payment',
          yearly: false,
        }),
      })
    )
  })

  it.skip('should create ENTERPRISE subscription when productType is enterprise', async () => {
    const result = await createSubscriptionFromStripeService(
      testEmail,
      'CODEMAIL_LIFETIME',
      true
    )

    expect(result).toEqual(subscriptionData)
    expect(getUserByEmailDao).toHaveBeenCalledWith(testEmail)
    expect(isActivePlanExistDao).toHaveBeenCalledWith(
      userTest.id,
      'CODEMAIL_LIFETIME'
    )
    expect(createSubscriptionDao).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceId: userTest.id,
        plan: 'CODEMAIL_LIFETIME',
        status: 'active',
        subscriptionType: 'payment',
        periodStart: expect.any(Date),
        periodEnd: expect.any(Date),
        metadata: expect.objectContaining({
          mode: 'payment',
          yearly: true,
        }),
      })
    )
  })

  it('should throw error when plan already exists', async () => {
    vi.mocked(isActivePlanExistDao).mockResolvedValue(true)

    await expect(
      createSubscriptionFromStripeService(testEmail, 'CODEMAIL_PRO', false)
    ).rejects.toThrow('User already has an active CODEMAIL_PRO subscription')

    expect(createSubscriptionDao).not.toHaveBeenCalled()
  })

  it('should throw error when user email not found', async () => {
    vi.mocked(getUserByEmailDao).mockResolvedValue(undefined)

    await expect(
      createSubscriptionFromStripeService(testEmail, 'CODEMAIL_PRO', true)
    ).rejects.toThrow('User not found')

    expect(createSubscriptionDao).not.toHaveBeenCalled()
  })
})

describe('[USER] Active Subscriptions Service', () => {
  const subscriptionData: Subscription = {
    id: faker.string.uuid(),
    referenceId: userTest.id,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    periodStart: new Date(),
    periodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    canceledAt: new Date(),
    trialStart: new Date(),
    trialEnd: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: 'sub_123',
    priceId: 'price_123',
    paymentMethodId: 'pm_123',
    cancelAtPeriodEnd: false,
    seats: 1,
    metadata: {},
  }

  const activeSubscriptions = [
    {
      ...subscriptionData,
      id: faker.string.uuid(),
      plan: 'CODEMAIL_PRO',
    },
    {
      ...subscriptionData,
      id: faker.string.uuid(),
      plan: 'CODEMAIL_LIFETIME',
    },
  ]

  beforeEach(() => {
    setupAuthUserMocked(userTest)
    vi.clearAllMocks()
    vi.mocked(getUserByIdDao).mockResolvedValue(userTest)
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue(subscriptionData)
    vi.mocked(getActiveSubscriptionsByUserIdDao).mockResolvedValue(
      activeSubscriptions
    )
  })

  it.skip('should get active subscriptions for user', async () => {
    const result = await getActiveSubscriptionsByUserIdService(userTest.id)

    expect(result).toEqual(activeSubscriptions)
    expect(getActiveSubscriptionsByUserIdDao).toHaveBeenCalledWith(userTest.id)
  })

  it('should throw error when user not found', async () => {
    vi.mocked(getUserByIdDao).mockResolvedValue(undefined)

    await expect(
      getActiveSubscriptionsByUserIdService('non-existent-id')
    ).rejects.toThrow('User not found')

    expect(getActiveSubscriptionsByUserIdDao).not.toHaveBeenCalled()
  })

  it('should throw error when user has no permission', async () => {
    setupAuthUserMocked() // Utilisateur non connecté

    await expect(
      getActiveSubscriptionsByUserIdService(userTest.id)
    ).rejects.toThrow(AuthorizationError)
  })

  it('should return empty array when user has no active subscriptions', async () => {
    vi.mocked(getActiveSubscriptionsByUserIdDao).mockResolvedValue([])

    const result = await getActiveSubscriptionsByUserIdService(userTest.id)

    expect(result).toEqual([])
    expect(getActiveSubscriptionsByUserIdDao).toHaveBeenCalledWith(userTest.id)
  })
})
