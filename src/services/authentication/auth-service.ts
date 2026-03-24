import {headers} from 'next/headers'
import {cache} from 'react'

import {getFarmerProfileByOrganizationIdDao} from '@/db/repositories/farmer-repository'
import {auth} from '@/lib/better-auth/auth'
import {getReferenceIdByBillingMode} from '@/lib/helper/subscription-helper'

import {RoleConst} from '../types/domain/auth-types'

/**
 * Récupère l'utilisateur connecté a partir de la session enrichie
 * Attention : expose toutes les données
 * préferer 'getAuthUserDTO' pour exposition aux clients
 * @returns L'utilisateur connecté avec organizations et settings
 */
export const getAuthUser = cache(async () => {
  const session = await getSessionAuth()
  if (!session?.session?.userId) return
  // La session est maintenant enrichie avec customSession, pas besoin d'appel séparé à getUserByIdDao
  return session.user
})

export const getSessionAuth = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  })
  return session
})

export const getSessionActiveOrganizationId = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  })
  return session?.session?.activeOrganizationId
})

export const getSessionReferenceId = cache(async () => {
  const session = await getSessionAuth()
  return getReferenceIdByBillingMode(
    session?.session?.userId,
    session?.session?.activeOrganizationId ?? undefined
  )
})

export const getActiveSubscriptions = cache(async (referenceId: string) => {
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
})
export const isAuthAdmin = async () => {
  const authUser = await getAuthUser()
  return authUser?.role === RoleConst.ADMIN
}

export const getAuthUserId = async () => {
  const user = await getAuthUser()
  if (!user) return
  return user.id
}

/**
 * Résout l'organizationId actif de manière fiable.
 * 1. Utilise session.activeOrganizationId si celui-ci a un profil farmer
 * 2. Sinon, cherche parmi toutes les orgs de l'utilisateur celle avec un profil
 * 3. Fallback sur la première org
 *
 * Utilise le DAO directement (pas le service) pour éviter les dépendances circulaires.
 */
export const getActiveOrganizationId = cache(async (): Promise<string> => {
  const session = await getSessionAuth()
  const user = await getAuthUser()

  // 1. Tenter l'org active de la session
  const sessionOrgId = session?.session?.activeOrganizationId
  if (sessionOrgId) {
    const profile = await getFarmerProfileByOrganizationIdDao(sessionOrgId)
    if (profile) return sessionOrgId
  }

  // 2. Chercher l'org avec un profil farmer parmi toutes les orgs
  if (user?.organizations?.length) {
    for (const orgMember of user.organizations) {
      const orgId = orgMember.organization?.id
      if (orgId && orgId !== sessionOrgId) {
        const profile = await getFarmerProfileByOrganizationIdDao(orgId)
        if (profile) return orgId
      }
    }
  }

  // 3. Fallback sur la première org (cas onboarding)
  const fallbackOrgId =
    sessionOrgId ?? user?.organizations?.[0]?.organization?.id

  if (!fallbackOrgId) {
    throw new Error('Aucune organisation active')
  }
  return fallbackOrgId
})
