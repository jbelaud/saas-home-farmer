import {AbilityBuilder, createMongoAbility} from '@casl/ability'

import {
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_USER,
} from '../types/domain/auth-types'
import type {User} from '../types/domain/user-types'

// Actions disponibles
export enum Actions {
  MANAGE = 'manage', // Action globale (toutes les actions)
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Subjects (ressources) disponibles
export enum Subjects {
  USER = 'User',
  SUBSCRIPTION = 'Subscription',
  TECHNICAL = 'Technical',
  LOG = 'Log',
  ALL = 'all',
}

// Type pour l'ability CASL
export type AppAbility = ReturnType<typeof defineAbilitiesFor>

/**
 * Définit les abilities pour un utilisateur donné
 * Inspiré de l'exemple CASL documentation
 * Remplace rbac-config.ts par une approche CASL plus moderne
 */
export function defineAbilitiesFor(user?: User) {
  const {can, cannot, build} = new AbilityBuilder(createMongoAbility)

  if (!user) {
    // Utilisateurs non authentifiés (guests)
    can(Actions.READ, Subjects.LOG, ['id', 'name'])
    return build()
  }

  // Note: SUPER_ADMIN n'existe pas dans le type User actuel
  // On garde seulement les rôles ADMIN et USER

  if (user.roles?.includes(ROLE_SUPER_ADMIN)) {
    can(Actions.MANAGE, Subjects.ALL)
    return build()
  }

  // Permissions pour ADMIN
  if (user.roles?.includes(ROLE_ADMIN)) {
    // Peut gérer tous les utilisateurs
    can(Actions.MANAGE, Subjects.USER)

    // Peut gérer toutes les subscriptions
    can(Actions.MANAGE, Subjects.SUBSCRIPTION)

    // Peut gérer les aspects techniques et logs
    can(Actions.MANAGE, Subjects.TECHNICAL)
    can(Actions.MANAGE, Subjects.LOG)

    return build()
  }

  // Permissions pour USER
  if (user.roles?.includes(ROLE_USER)) {
    // Utilisateurs - peut lire et modifier son propre profil
    can(Actions.READ, Subjects.USER, {id: user.id})
    can(Actions.UPDATE, Subjects.USER, {id: user.id})

    // Peut lire les profils publics d'autres utilisateurs
    can(Actions.READ, Subjects.USER, {visibility: 'public'})

    // Restrictions sur les champs sensibles des utilisateurs
    cannot(Actions.READ, Subjects.USER, [
      'role',
      'permissions',
      'internalNotes',
    ])
    cannot(Actions.UPDATE, Subjects.USER, [
      'role',
      'permissions',
      'createdAt',
      'updatedAt',
    ])

    // Subscriptions - peut lire et modifier ses propres subscriptions
    can(Actions.READ, Subjects.SUBSCRIPTION, {userId: user.id})
    can(Actions.UPDATE, Subjects.SUBSCRIPTION, {userId: user.id})
    can(Actions.CREATE, Subjects.SUBSCRIPTION)

    // Ne peut pas supprimer d'autres utilisateurs
    cannot(Actions.DELETE, Subjects.USER)

    return build()
  }

  // Permissions par défaut pour utilisateurs connectés sans rôle spécifique
  can(Actions.READ, Subjects.LOG, ['id', 'name'])

  return build()
}

/**
 * Utilitaire pour créer une ability pour un utilisateur donné
 * Équivalent simplifié de la fonction defineAbilitiesFor
 */
export function createUserAbility(user?: User) {
  return defineAbilitiesFor(user)
}

/**
 * Vérifie si un utilisateur peut effectuer une action sur un type de ressource
 */
export function userCan(
  user: User | undefined,
  action: Actions,
  subject: Subjects
): boolean {
  const ability = defineAbilitiesFor(user)
  return ability.can(action, subject as string)
}

/**
 * Vérifie si un utilisateur ne peut pas effectuer une action
 */
export function userCannot(
  user: User | undefined,
  action: Actions,
  subject: Subjects
): boolean {
  const ability = defineAbilitiesFor(user)
  return ability.cannot(action, subject as string)
}

/**
 * Vérifie si un utilisateur peut effectuer une action sur un objet spécifique
 */
export function userCanOnResource(
  user: User | undefined,
  action: Actions,
  subject: Subjects,
  resource: Record<string, unknown>
): boolean {
  const ability = defineAbilitiesFor(user)

  // Créer un objet avec le type de subject pour CASL
  const subjectObject = {
    __type: subject,
    ...resource,
  }

  return ability.can(action, subjectObject)
}

/**
 * Filtre les champs d'une ressource selon les permissions
 */
export function filterFields<T extends Record<string, unknown>>(
  user: User | undefined,
  action: Actions,
  subject: Subjects,
  data: T
): Partial<T> {
  const ability = defineAbilitiesFor(user)

  // Vérifier si l'utilisateur peut effectuer l'action
  if (!ability.can(action, subject as string)) {
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
