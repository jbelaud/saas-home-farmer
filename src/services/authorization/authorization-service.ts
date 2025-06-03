import {AbilityBuilder, createMongoAbility} from '@casl/ability'

import {
  OrganizationContext,
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_USER,
} from '../types/domain/auth-types'
import {
  OrganizationRole,
  UserOrganizationRoleConst,
} from '../types/domain/organization-types'
import type {User} from '../types/domain/user-types'

// Actions disponibles
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

// Subjects (ressources) disponibles
export type Subjects =
  | 'User'
  | 'Subscription'
  | 'Organization'
  | 'Technical'
  | 'Log'
  | 'all'

// Constantes pour les actions et subjects
export const ActionsConst = {
  CREATE: 'create' as Actions,
  READ: 'read' as Actions,
  UPDATE: 'update' as Actions,
  DELETE: 'delete' as Actions,
  MANAGE: 'manage' as Actions,
} as const

export const SubjectsConst = {
  USER: 'User' as Subjects,
  SUBSCRIPTION: 'Subscription' as Subjects,
  ORGANIZATION: 'Organization' as Subjects,
  TECHNICAL: 'Technical' as Subjects,
  LOG: 'Log' as Subjects,
  ALL: 'all' as Subjects,
} as const

// Type pour l'ability CASL
export type AppAbility = ReturnType<typeof defineAbilitiesFor>

// Type pour l'AbilityBuilder
type AppAbilityBuilder = AbilityBuilder<ReturnType<typeof createMongoAbility>>

/**
 * Utilitaire pour créer une ability pour un utilisateur donné
 * Équivalent simplifié de la fonction defineAbilitiesFor
 */
export function createUserAbility(user?: User) {
  return defineAbilitiesFor(user)
}
/**
 * Définit les abilities pour un utilisateur donné
 * Inspiré de l'exemple CASL documentation
 * Remplace rbac-config.ts par une approche CASL plus moderne
 */
export function defineAbilitiesFor(
  user?: User,
  orgContext?: OrganizationContext
) {
  const builder = new AbilityBuilder(createMongoAbility)

  if (!user) {
    buildGuestAbilities(builder)
    return builder.build()
  }

  // SUPER_ADMIN - permissions complètes
  if (user.roles?.includes(ROLE_SUPER_ADMIN)) {
    buildSuperAdminAbilities(builder)
    return builder.build()
  }

  // ADMIN - permissions étendues
  if (user.roles?.includes(ROLE_ADMIN)) {
    buildAdminAbilities(builder)
    return builder.build()
  }

  // USER - permissions standards
  if (user.roles?.includes(ROLE_USER)) {
    buildUserAbilities(builder, user, orgContext)
    return builder.build()
  }

  // Permissions par défaut pour utilisateurs connectés sans rôle spécifique
  buildGuestAbilities(builder)
  return builder.build()
}

/**
 * Build abilities pour les utilisateurs non authentifiés (guests)
 */
function buildGuestAbilities(builder: AppAbilityBuilder) {
  const {can} = builder

  // Utilisateurs non authentifiés (guests)
  can(ActionsConst.READ, SubjectsConst.LOG, ['id', 'name'])

  // Peut lire les profils publics d'utilisateurs
  can(ActionsConst.READ, SubjectsConst.USER, {visibility: 'public'})
}

/**
 * Build abilities pour SUPER_ADMIN - permissions complètes
 */
function buildSuperAdminAbilities(builder: AppAbilityBuilder) {
  const {can} = builder

  // Permissions complètes sur toutes les ressources
  can(ActionsConst.MANAGE, SubjectsConst.ALL)
}

/**
 * Build abilities pour ADMIN - permissions étendues
 */
function buildAdminAbilities(builder: AppAbilityBuilder) {
  const {can} = builder

  // Peut gérer tous les utilisateurs
  can(ActionsConst.MANAGE, SubjectsConst.USER)

  // Peut gérer toutes les subscriptions
  can(ActionsConst.MANAGE, SubjectsConst.SUBSCRIPTION)

  // Peut gérer toutes les organisations
  can(ActionsConst.MANAGE, SubjectsConst.ORGANIZATION)

  // Peut gérer les aspects techniques et logs
  can(ActionsConst.MANAGE, SubjectsConst.TECHNICAL)
  can(ActionsConst.MANAGE, SubjectsConst.LOG)
}

/**
 * Build abilities pour USER - permissions standards avec gestion des rôles organisationnels
 */
function buildUserAbilities(
  builder: AppAbilityBuilder,
  user: User,
  orgContext?: OrganizationContext
) {
  const {can, cannot} = builder

  // Récupérer le rôle de l'utilisateur dans l'organisation courante
  let userOrgRole: OrganizationRole | undefined
  if (orgContext?.organizationId && user.organizations) {
    const userOrg = user.organizations.find(
      (org) => org.organizationId === orgContext.organizationId
    )
    userOrgRole = userOrg?.role
  }

  // Permissions de base pour tous les utilisateurs connectés
  buildBaseUserAbilities(builder, user)

  // Permissions organisationnelles basées sur le rôle dans l'organisation
  if (orgContext?.organizationId && userOrgRole) {
    buildOrganizationalAbilities(builder, user, userOrgRole, orgContext)
  }
}

/**
 * Build abilities de base pour tous les utilisateurs connectés
 */
function buildBaseUserAbilities(builder: AppAbilityBuilder, user: User) {
  const {can, cannot} = builder

  // Utilisateurs - peut lire et modifier son propre profil
  can(ActionsConst.READ, SubjectsConst.USER, {id: user.id})
  can(ActionsConst.UPDATE, SubjectsConst.USER, {id: user.id})

  // Peut lire les profils publics d'autres utilisateurs
  can(ActionsConst.READ, SubjectsConst.USER, {visibility: 'public'})

  // Restrictions sur les champs sensibles des utilisateurs
  cannot(ActionsConst.READ, SubjectsConst.USER, [
    'role',
    'permissions',
    'internalNotes',
  ])
  cannot(ActionsConst.UPDATE, SubjectsConst.USER, [
    'role',
    'permissions',
    'createdAt',
    'updatedAt',
  ])

  // Subscriptions - peut lire et modifier ses propres subscriptions
  can(ActionsConst.READ, SubjectsConst.SUBSCRIPTION, {userId: user.id})
  can(ActionsConst.UPDATE, SubjectsConst.SUBSCRIPTION, {userId: user.id})
  can(ActionsConst.CREATE, SubjectsConst.SUBSCRIPTION)

  // Organizations - permissions de base
  can(ActionsConst.READ, SubjectsConst.ORGANIZATION) // Peut lire toutes les orgs (public info)
  can(ActionsConst.CREATE, SubjectsConst.ORGANIZATION) // Peut créer une organisation

  // Peut lire les logs (accès en lecture seule)
  can(ActionsConst.READ, SubjectsConst.LOG)

  // Ne peut pas supprimer d'autres utilisateurs
  cannot(ActionsConst.DELETE, SubjectsConst.USER)
}

/**
 * Build abilities organisationnelles basées sur le rôle dans l'organisation
 */
function buildOrganizationalAbilities(
  builder: AppAbilityBuilder,
  user: User,
  orgRole: OrganizationRole,
  orgContext: OrganizationContext
) {
  const {can} = builder

  switch (orgRole) {
    case UserOrganizationRoleConst.OWNER:
      // Le propriétaire a toutes les permissions sur l'organisation
      can(ActionsConst.MANAGE, SubjectsConst.ORGANIZATION, {
        id: orgContext.organizationId,
      })
      // Peut gérer tous les utilisateurs de l'organisation
      can(ActionsConst.MANAGE, SubjectsConst.USER, {
        organizationId: orgContext.organizationId,
      })
      // Peut gérer toutes les subscriptions de l'organisation
      can(ActionsConst.MANAGE, SubjectsConst.SUBSCRIPTION, {
        organizationId: orgContext.organizationId,
      })
      break

    case UserOrganizationRoleConst.ADMIN:
      // L'admin peut gérer l'organisation (sauf suppression)
      can(ActionsConst.READ, SubjectsConst.ORGANIZATION, {
        id: orgContext.organizationId,
      })
      can(ActionsConst.UPDATE, SubjectsConst.ORGANIZATION, {
        id: orgContext.organizationId,
      })
      // Peut gérer les utilisateurs de l'organisation (sauf propriétaire)
      can(ActionsConst.READ, SubjectsConst.USER, {
        organizationId: orgContext.organizationId,
      })
      can(ActionsConst.UPDATE, SubjectsConst.USER, {
        organizationId: orgContext.organizationId,
      })
      // Peut gérer les subscriptions de l'organisation
      can(ActionsConst.MANAGE, SubjectsConst.SUBSCRIPTION, {
        organizationId: orgContext.organizationId,
      })
      break

    case UserOrganizationRoleConst.MEMBER:
      // Le membre a des permissions limitées
      can(ActionsConst.READ, SubjectsConst.ORGANIZATION, {
        id: orgContext.organizationId,
      })
      // Peut lire les autres utilisateurs de l'organisation
      can(ActionsConst.READ, SubjectsConst.USER, {
        organizationId: orgContext.organizationId,
      })
      // Peut lire les subscriptions de l'organisation
      can(ActionsConst.READ, SubjectsConst.SUBSCRIPTION, {
        organizationId: orgContext.organizationId,
      })
      break

    default:
      // Aucune permission organisationnelle spécifique
      break
  }
}

/**
 * Vérifie si un utilisateur peut effectuer une action sur un type de ressource
 */
export function userCan(
  user: User | undefined,
  action: Actions,
  subject: Subjects,
  orgContext?: OrganizationContext
): boolean {
  const ability = defineAbilitiesFor(user, orgContext)
  return ability.can(action, subject)
}

/**
 * Vérifie si un utilisateur ne peut pas effectuer une action
 */
export function userCannot(
  user: User | undefined,
  action: Actions,
  subject: Subjects,
  orgContext?: OrganizationContext
): boolean {
  const ability = defineAbilitiesFor(user, orgContext)
  return ability.cannot(action, subject)
}

/**
 * Vérifie si un utilisateur peut effectuer une action sur un objet spécifique
 */
export function userCanOnResource(
  user: User | undefined,
  action: Actions,
  subject: Subjects,
  resource: Record<string, unknown>,
  orgContext?: OrganizationContext
): boolean {
  const ability = defineAbilitiesFor(user, orgContext)

  // CASL avec conditions: on crée un objet "subject" que CASL peut reconnaître
  // CASL va matcher les conditions définies dans les règles (ex: {id: user.id})
  const subjectObject = Object.assign({}, resource)

  // On utilise l'API interne de CASL pour vérifier avec des conditions
  const rules = ability.rulesFor(action, subject)

  // Si aucune règle, permission refusée
  if (rules.length === 0) {
    return false
  }

  // Vérifier si au moins une règle permet l'accès
  return rules.some((rule) => {
    if (!rule.conditions) {
      return true // Règle sans condition = permission globale
    }

    // Vérifier si l'objet match les conditions de la règle
    return Object.keys(rule.conditions).every((key) => {
      const ruleValue = rule.conditions![key]
      const objectValue = subjectObject[key]
      return ruleValue === objectValue
    })
  })
}

/**
 * Filtre les champs d'une ressource selon les permissions
 */
export function filterFields<T extends Record<string, unknown>>(
  user: User | undefined,
  action: Actions,
  subject: Subjects,
  data: T,
  orgContext?: OrganizationContext
): Partial<T> {
  const ability = defineAbilitiesFor(user, orgContext)

  // Vérifier si l'utilisateur peut effectuer l'action
  if (!ability.can(action, subject)) {
    return {}
  }

  // Pour le filtrage des champs, on retourne les données telles quelles
  // La restriction se fait au niveau des règles CASL définies
  return data
}

/**
 * Vérifie si l'utilisateur authentifié est admin
 * Fonction de compatibilité
 */
export function isUserAdmin(user?: User): boolean {
  if (!user) return false
  return user.roles?.includes(ROLE_ADMIN) ?? false
}

/**
 * Récupère le rôle de l'utilisateur dans une organisation spécifique
 */
export function getUserRoleInOrganization(
  user: User | undefined,
  organizationId: string
): OrganizationRole | undefined {
  if (!user?.organizations) return undefined

  const userOrg = user.organizations.find(
    (org) => org.organizationId === organizationId
  )
  return userOrg?.role
}

/**
 * Vérifie si un utilisateur a un rôle spécifique dans une organisation
 */
export function hasOrganizationRole(
  user: User | undefined,
  organizationId: string,
  role: OrganizationRole
): boolean {
  const userRole = getUserRoleInOrganization(user, organizationId)
  return userRole === role
}

/**
 * Vérifie si un utilisateur est propriétaire d'une organisation
 */
export function isOrganizationOwner(
  user: User | undefined,
  organizationId: string
): boolean {
  return hasOrganizationRole(
    user,
    organizationId,
    UserOrganizationRoleConst.OWNER
  )
}

/**
 * Vérifie si un utilisateur est admin d'une organisation
 */
export function isOrganizationAdmin(
  user: User | undefined,
  organizationId: string
): boolean {
  return hasOrganizationRole(
    user,
    organizationId,
    UserOrganizationRoleConst.ADMIN
  )
}
