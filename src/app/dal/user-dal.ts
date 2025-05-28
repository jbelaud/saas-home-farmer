import 'server-only'

import {notFound} from 'next/navigation'
import {cache} from 'react'
import {z} from 'zod'

import {getAuthUser, getAuthUserId} from '@/services/authentication/auth-utils'
import {
  getActiveSubscriptionsByUserEmailService,
  getSubscriptionByUserIdService,
} from '@/services/facades/subscription-service-facade'
import {getUserByIdService} from '@/services/facades/user-service-facade'
import {User, UserDTO} from '@/services/types/domain/user-types'

export const getConnectedUser = cache(async () => {
  const user = await getAuthUser()
  if (!user) return
  return userDTO(user as User)
})

const userIdSchema = z.object({
  id: z.string(),
})

export const getUserByIdDal = cache(async (userId: string) => {
  const validateFields = userIdSchema.safeParse({id: userId})
  if (!validateFields.success) {
    throw new Error('Invalid User')
  }
  const user = await getUserByIdService(userId)
  if (!user) notFound()
  return user
})

export const getUserIdDal = cache(async () => {
  const userId = await getAuthUserId()
  return userId
})

export const getUserDal = cache(async () => {
  const user = await getAuthUser()
  return user
})

export function userDTO(user: User): UserDTO | undefined {
  if (!user) return undefined

  return {
    id: user?.id ?? '',
    email: user?.email ?? '',
    name: user?.name ?? '',
    role: user?.role,
    image: user?.image ?? '',
  }
}

export const getSubscriptionDal = cache(async (userId: string) => {
  const subscription = await getSubscriptionByUserIdService(userId)
  return subscription
})

export const getActiveSubscriptionsByEmailDal = cache(async (email: string) => {
  const subscriptions = await getActiveSubscriptionsByUserEmailService(email)
  return subscriptions
})

export const isPaidUser = cache(async (): Promise<boolean> => {
  try {
    const user = await getUserDal()
    if (!user) return false

    const subscriptions = await getActiveSubscriptionsByEmailDal(user.email)
    return subscriptions?.some(
      (sub) => sub.plan === 'CODEMAIL_LIFETIME' || sub.plan === 'CODEMAIL_PRO'
    )
  } catch (error) {
    console.error('Error checking paid user status:', error)
    return false
  }
})
