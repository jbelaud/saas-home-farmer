import 'server-only'

import {notFound} from 'next/navigation'
import {cache} from 'react'
import {z} from 'zod'

import {
  getAuthUser,
  getAuthUserId,
} from '@/services/authentication/auth-service'
import {hasRequiredRoles} from '@/services/authentication/auth-util'
import {canManageUsers} from '@/services/authorization/user-authorization'
import {AuthorizationError} from '@/services/errors/authorization-error'
import {
  getActiveSubscriptionsByUserEmailService,
  getSubscriptionByUserIdService,
} from '@/services/facades/subscription-service-facade'
import {
  getAllUsersWithPaginationService,
  getUserByIdService,
} from '@/services/facades/user-service-facade'
import {
  RequireAuthOptions,
  Roles,
  User,
  UserDTO,
} from '@/services/types/domain/user-types'

export const getConnectedUser = cache(async () => {
  const user = await getAuthUser()
  if (!user) return
  return userDTO(user as User)
})

export async function requireActionAuth(options?: RequireAuthOptions) {
  const user = await getAuthUser()

  if (!user) {
    throw new AuthorizationError('Utilisateur non authentifié')
  }
  if (
    options?.roles &&
    !hasRequiredRoles(user, options.roles as unknown as Roles[])
  ) {
    throw new AuthorizationError('Accès interdit')
  }

  return user
}

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

export const getAllUsersWithPaginationDal = cache(
  async (pagination: {limit: number; offset: number}, search?: string) => {
    return await getAllUsersWithPaginationService(pagination, search)
  }
)

export const getUserPermissionsDal = cache(async () => {
  const canManage = await canManageUsers()

  return {
    canCreate: canManage,
    canEdit: canManage,
    canDelete: canManage,
    canManage,
  }
})
