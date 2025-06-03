import {
  getOrganizationByIdDao,
  getUserRoleInOrganizationDao,
} from '@/db/repositories/organization-repository'
import {getAuthUser} from '@/services/authentication/auth-utils'
import {UserOrganizationRoleConst} from '@/services/types/domain/organization-types'

import {
  ActionsConst,
  SubjectsConst,
  userCan,
  userCanOnResource,
} from './authorization-service'

/**
 * Système d'autorisation pour les organisations
 *
 * Hiérarchie des rôles dans une organisation :
 * - OWNER : Peut tout faire (modifier, supprimer l'org, gérer tous les membres)
 * - ADMIN : Peut modifier l'org et gérer les membres (sauf autres ADMIN/OWNER)
 * - MEMBER : Peut uniquement lire l'organisation
 *
 * Permissions système :
 * - Utilisateurs avec rôle ADMIN système : Peuvent gérer toutes les organisations
 * - Utilisateurs connectés : Peuvent lire toutes les organisations et en créer
 * - Guests : Peuvent uniquement lire les informations publiques
 *
 * Exemple d'utilisation dans un service :
 * ```typescript
 * export const updateOrganizationService = async (orgId: string, data: UpdateOrganization) => {
 *   const granted = await canUpdateOrganization(orgId)
 *   if (!granted) {
 *     throw new AuthorizationError()
 *   }
 *   return await updateOrganizationDao(data)
 * }
 * ```
 */

/**
 * Vérifie si l'utilisateur connecté peut lire une organisation
 * @param resourceId - ID de l'organisation
 * @returns true si l'accès est autorisé
 */
export const canReadOrganization = async (
  resourceId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Vérification précoce pour performance
  if (!userCan(authUser, ActionsConst.READ, SubjectsConst.ORGANIZATION)) {
    return false
  }

  // Récupération de l'organisation
  const organization = await getOrganizationByIdDao(resourceId)
  if (!organization) return false

  // Les utilisateurs connectés peuvent lire toutes les organisations (info publique)
  return userCanOnResource(
    authUser,
    ActionsConst.READ,
    SubjectsConst.ORGANIZATION,
    {
      id: organization.id,
    }
  )
}

/**
 * Vérifie si l'utilisateur connecté peut créer une organisation
 * @returns true si l'accès est autorisé
 */
export const canCreateOrganization = async (): Promise<boolean> => {
  const authUser = await getAuthUser()

  return userCan(authUser, ActionsConst.CREATE, SubjectsConst.ORGANIZATION)
}

/**
 * Vérifie si l'utilisateur connecté peut mettre à jour une organisation
 * @param resourceId - ID de l'organisation
 * @returns true si l'accès est autorisé
 */
export const canUpdateOrganization = async (
  resourceId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Vérification précoce pour performance
  if (!userCan(authUser, ActionsConst.UPDATE, SubjectsConst.ORGANIZATION)) {
    return false
  }

  // Si admin système, peut tout modifier
  if (
    userCanOnResource(
      authUser,
      ActionsConst.MANAGE,
      SubjectsConst.ORGANIZATION,
      {}
    )
  ) {
    return true
  }

  // Vérifier si l'utilisateur est OWNER ou ADMIN de l'organisation
  if (!authUser?.id) return false

  const userRole = await getUserRoleInOrganizationDao(authUser.id, resourceId)
  return (
    userRole === UserOrganizationRoleConst.OWNER ||
    userRole === UserOrganizationRoleConst.ADMIN
  )
}

/**
 * Vérifie si l'utilisateur connecté peut supprimer une organisation
 * @param resourceId - ID de l'organisation
 * @returns true si l'accès est autorisé
 */
export const canDeleteOrganization = async (
  resourceId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Vérification précoce pour performance
  if (!userCan(authUser, ActionsConst.DELETE, SubjectsConst.ORGANIZATION)) {
    return false
  }

  // Si admin système, peut tout supprimer
  if (
    userCanOnResource(
      authUser,
      ActionsConst.MANAGE,
      SubjectsConst.ORGANIZATION,
      {}
    )
  ) {
    return true
  }

  // Seul le OWNER peut supprimer l'organisation
  if (!authUser?.id) return false

  const userRole = await getUserRoleInOrganizationDao(authUser.id, resourceId)
  return userRole === UserOrganizationRoleConst.OWNER
}

/**
 * Vérifie si l'utilisateur connecté peut gérer les membres d'une organisation
 * @param resourceId - ID de l'organisation
 * @returns true si l'accès est autorisé
 */
export const canManageOrganizationMembers = async (
  resourceId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Si admin système, peut tout gérer
  if (
    userCanOnResource(
      authUser,
      ActionsConst.MANAGE,
      SubjectsConst.ORGANIZATION,
      {}
    )
  ) {
    return true
  }

  // Vérifier si l'utilisateur est OWNER ou ADMIN de l'organisation
  if (!authUser?.id) return false

  const userRole = await getUserRoleInOrganizationDao(authUser.id, resourceId)
  return (
    userRole === UserOrganizationRoleConst.OWNER ||
    userRole === UserOrganizationRoleConst.ADMIN
  )
}

/**
 * Vérifie si l'utilisateur connecté peut inviter des membres dans une organisation
 * @param resourceId - ID de l'organisation
 * @returns true si l'accès est autorisé
 */
export const canInviteToOrganization = async (
  resourceId: string
): Promise<boolean> => {
  // Pour l'invitation, on utilise la même logique que la gestion des membres
  return canManageOrganizationMembers(resourceId)
}

/**
 * Vérifie si l'utilisateur connecté peut retirer un membre d'une organisation
 * @param resourceId - ID de l'organisation
 * @param targetUserId - ID de l'utilisateur à retirer
 * @returns true si l'accès est autorisé
 */
export const canRemoveFromOrganization = async (
  resourceId: string,
  targetUserId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Si admin système, peut tout gérer
  if (
    userCanOnResource(
      authUser,
      ActionsConst.MANAGE,
      SubjectsConst.ORGANIZATION,
      {}
    )
  ) {
    return true
  }

  if (!authUser?.id) return false

  // L'utilisateur peut se retirer lui-même
  if (authUser.id === targetUserId) {
    return true
  }

  // Vérifier le rôle de l'utilisateur connecté
  const userRole = await getUserRoleInOrganizationDao(authUser.id, resourceId)

  // OWNER peut retirer n'importe qui
  if (userRole === UserOrganizationRoleConst.OWNER) {
    return true
  }

  // ADMIN peut retirer les MEMBER mais pas d'autres ADMIN ou OWNER
  if (userRole === UserOrganizationRoleConst.ADMIN) {
    const targetRole = await getUserRoleInOrganizationDao(
      targetUserId,
      resourceId
    )
    return targetRole === UserOrganizationRoleConst.MEMBER
  }

  return false
}

/**
 * Vérifie si l'utilisateur connecté peut changer le rôle d'un membre dans une organisation
 * @param resourceId - ID de l'organisation
 * @param _targetUserId - ID de l'utilisateur dont on veut changer le rôle (pour future logique)
 * @returns true si l'accès est autorisé
 */
export const canChangeOrganizationMemberRole = async (
  resourceId: string,
  _targetUserId: string
): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Si admin système, peut tout gérer
  if (
    userCanOnResource(
      authUser,
      ActionsConst.MANAGE,
      SubjectsConst.ORGANIZATION,
      {}
    )
  ) {
    return true
  }

  if (!authUser?.id) return false

  // Vérifier le rôle de l'utilisateur connecté
  const userRole = await getUserRoleInOrganizationDao(authUser.id, resourceId)

  // Seul le OWNER peut changer les rôles
  return userRole === UserOrganizationRoleConst.OWNER
}
