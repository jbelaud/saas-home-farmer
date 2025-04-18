import {
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  createSubscriptionFromStripe,
  getActiveSubscriptionsByUserIdService,
} from '../subscription-service'
import {
  createSubscriptionDao,
  getSubscriptionByIdDao,
  updateSubscriptionDao,
  isPlanExistDao,
  isActivePlanExistDao,
  getActiveSubscriptionsByUserIdDao,
} from '@/db/repositories/subscription-repository'
import {
  getUserByEmailDao,
  getUserByIdDao,
} from '@/db/repositories/user-repository'

import {setupAuthUserMocked} from './helper-service-test'
import {userTest, userTestAdmin} from './service-test-data'
import {AuthorizationError} from '../errors/errors'
import {faker} from '@faker-js/faker'
import {expect, vi, describe, beforeEach, it} from 'vitest'
import {Subscription} from '../types/domain/subscription-types'

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
    userId: userTestAdmin.id,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    quantity: 1,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    endDate: new Date(),
    canceledAt: new Date(),
    trialEndsAt: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeSubscriptionId: 'D',
    priceId: 'null',
    paymentMethodId: 'null',
    metadata: 'null',
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
      userId: userTestAdmin.id,
      plan: 'CODEMAIL_PRO' as const,
      subscriptionType: 'subscription' as const,
      quantity: 1,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
    }
    const result = await createSubscription(createData)

    expect(result).toEqual(subscriptionData)
    expect(createSubscriptionDao).toHaveBeenCalledWith(createData)
  })

  it('should get a subscription by id', async () => {
    const result = await getSubscriptionById(subscriptionId)

    expect(result).toEqual(subscriptionData)
    expect(getSubscriptionByIdDao).toHaveBeenCalledWith(subscriptionId)
  })

  it('should update a subscription', async () => {
    const updateData = {
      id: subscriptionId,
      userId: userTestAdmin.id,
      plan: 'CODEMAIL_LIFETIME' as const,
      status: 'active' as const,
    }
    const result = await updateSubscription(updateData)

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
    userId: authUserId,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    quantity: 1,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    endDate: new Date(),
    canceledAt: new Date(),
    trialEndsAt: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeSubscriptionId: 'null',
    priceId: 'null',
    paymentMethodId: 'null',
    metadata: 'null',
  }

  beforeEach(() => {
    setupAuthUserMocked(userTest)
    vi.clearAllMocks()
    vi.mocked(createSubscriptionDao).mockResolvedValue(subscriptionData)
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue({
      ...subscriptionData,
      userId: 'other-user',
    })
    vi.mocked(updateSubscriptionDao).mockResolvedValue(subscriptionData)
  })

  it('should create own subscription', async () => {
    const createData = {
      userId: authUserId,
      plan: 'CODEMAIL_PRO' as const,
      subscriptionType: 'subscription' as const,
      quantity: 1,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
    }
    const result = await createSubscription(createData)

    expect(result).toEqual(subscriptionData)
    expect(createSubscriptionDao).toHaveBeenCalledWith(createData)
  })

  it("should NOT read another user's subscription", async () => {
    await expect(getSubscriptionById(subscriptionId)).rejects.toThrow(
      AuthorizationError
    )
    expect(getSubscriptionByIdDao).toHaveBeenCalledWith(subscriptionId)
  })

  it("should NOT update another user's subscription", async () => {
    const updateData = {
      id: subscriptionId,
      userId: authUserId,
      plan: 'CODEMAIL_LIFETIME' as const,
    }
    await expect(updateSubscription(updateData)).rejects.toThrow(
      AuthorizationError
    )
    expect(updateSubscriptionDao).not.toHaveBeenCalled()
  })

  it('should read own subscription', async () => {
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue({
      ...subscriptionData,
      userId: authUserId,
    })
    const result = await getSubscriptionById(subscriptionId)
    expect(result).toEqual({...subscriptionData, userId: authUserId})
  })

  it('should update own subscription', async () => {
    vi.mocked(getSubscriptionByIdDao).mockResolvedValue({
      ...subscriptionData,
      userId: authUserId,
    })
    const updateData = {
      id: subscriptionId,
      userId: authUserId,
      plan: 'CODEMAIL_LIFETIME' as const,
    }
    const result = await updateSubscription(updateData)
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
    await expect(getSubscriptionById(subscriptionId)).rejects.toThrow(
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
    userId: userTest.id,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    quantity: 1,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    endDate: new Date(),
    canceledAt: new Date(),
    trialEndsAt: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeSubscriptionId: 'null',
    priceId: 'null',
    paymentMethodId: 'null',
    metadata: 'null',
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

  it('should create PRO subscription when productType is pro', async () => {
    const result = await createSubscriptionFromStripe(
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
        userId: userTest.id,
        plan: 'CODEMAIL_PRO',
        status: 'active',
        subscriptionType: 'payment',
        quantity: 1,
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        startDate: expect.any(Date),

        endDate: null,
        metadata: expect.objectContaining({
          mode: 'payment',
          yearly: false,
        }),
      })
    )
  })

  it('should create ENTERPRISE subscription when productType is enterprise', async () => {
    const result = await createSubscriptionFromStripe(
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
        userId: userTest.id,
        plan: 'CODEMAIL_LIFETIME',
        status: 'active',
        subscriptionType: 'payment',
        quantity: 1,
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        startDate: expect.any(Date),

        endDate: null,
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
      createSubscriptionFromStripe(testEmail, 'CODEMAIL_PRO', false)
    ).rejects.toThrow('User already has an active CODEMAIL_PRO subscription')

    expect(createSubscriptionDao).not.toHaveBeenCalled()
  })

  it('should throw error when user email not found', async () => {
    vi.mocked(getUserByEmailDao).mockResolvedValue(undefined)

    await expect(
      createSubscriptionFromStripe(testEmail, 'CODEMAIL_PRO', true)
    ).rejects.toThrow('User not found')

    expect(createSubscriptionDao).not.toHaveBeenCalled()
  })
})

describe('[USER] Active Subscriptions Service', () => {
  const subscriptionData: Subscription = {
    id: faker.string.uuid(),
    userId: userTest.id,
    plan: 'CODEMAIL_PRO',
    subscriptionType: 'subscription',
    status: 'active',
    quantity: 1,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    endDate: new Date(),
    canceledAt: new Date(),
    trialEndsAt: new Date(),
    lastBillingDate: new Date(),
    nextBillingDate: new Date(),
    stripeSubscriptionId: 'null',
    priceId: 'null',
    paymentMethodId: 'null',
    metadata: 'null',
  }

  const activeSubscriptions = [
    {
      ...subscriptionData,
      id: faker.string.uuid(),
      plan: 'CODEMAIL_PRO' as const,
    },
    {
      ...subscriptionData,
      id: faker.string.uuid(),
      plan: 'CODEMAIL_LIFETIME' as const,
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

  it('should get active subscriptions for user', async () => {
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
