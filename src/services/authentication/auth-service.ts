import {headers} from 'next/headers'

import {getUserByIdDao} from '@/db/repositories/user-repository'
import {auth} from '@/lib/better-auth/auth'
import {getReferenceIdByBillingMode} from '@/lib/helper/subscription-helper'

import {RoleConst} from '../types/domain/auth-types'

export const getAuthUser = async () => {
  const session = await getSessionAuth()
  if (!session?.session?.userId) return
  const user = await getUserByIdDao(session.session.userId)
  return user
}

export const getSessionAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  })
  return session
}

export const getSessionActiveOrganizationId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  })
  return session?.session?.activeOrganizationId
}

export const getSessionReferenceId = async () => {
  const session = await getSessionAuth()
  return getReferenceIdByBillingMode(
    session?.session?.userId,
    session?.session?.activeOrganizationId ?? undefined
  )
}

export const getActiveSubscriptions = async (referenceId: string) => {
  try {
    const subscriptions = await auth.api.listActiveSubscriptions({
      headers: await headers(),
      query: {
        referenceId,
      },
    })
    return subscriptions
  } catch (error) {
    console.error('Error fetching active subscriptions:', error)
    return []
  }
}
export const isAuthAdmin = async () => {
  const authUser = await getAuthUser()
  return authUser?.role === RoleConst.ADMIN
}

export const getAuthUserId = async () => {
  const user = await getAuthUser()
  if (!user) return
  return user.id
}
