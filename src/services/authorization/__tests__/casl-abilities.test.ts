import {describe, expect, it} from 'vitest'

import {ROLE_ADMIN, ROLE_USER} from '@/services/types/domain/auth-types'

import type {User} from '../../types/domain/user-types'
import {
  Actions,
  createUserAbility,
  defineAbilitiesFor,
  filterFields,
  isUserAdmin,
  Subjects,
  userCan,
  userCannot,
  userCanOnResource,
} from '../casl-abilities'

describe('CASL Abilities', () => {
  // Utilisateurs de test
  const guestUser = undefined

  const regularUser: User = {
    id: 'user-123',
    email: 'user@test.com',
    name: 'Regular User',
    roles: [ROLE_USER],
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    image: null,
    password: null,
    visibility: 'public',
  }

  const adminUser: User = {
    id: 'admin-123',
    email: 'admin@test.com',
    name: 'Admin User',
    roles: [ROLE_ADMIN],
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    image: null,
    password: null,
    visibility: 'public',
  }

  const superAdminUser: User = {
    id: 'super-admin-123',
    email: 'super@test.com',
    name: 'Super Admin',
    roles: [ROLE_ADMIN], // On garde ADMIN puisque SUPER_ADMIN n'existe pas
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    image: null,
    password: null,
    visibility: 'public',
  }

  describe('defineAbilitiesFor', () => {
    it('devrait créer une ability pour un guest', () => {
      const ability = defineAbilitiesFor(guestUser)
      expect(ability).toBeDefined()
      expect(ability.can(Actions.READ, Subjects.LOG)).toBe(true)
      expect(ability.can(Actions.CREATE, Subjects.USER)).toBe(false)
    })

    it('devrait créer une ability pour un utilisateur régulier', () => {
      const ability = defineAbilitiesFor(regularUser)
      expect(ability).toBeDefined()
      expect(ability.can(Actions.READ, Subjects.SUBSCRIPTION)).toBe(true)
      expect(ability.can(Actions.MANAGE, Subjects.USER)).toBe(false)
    })

    it('devrait créer une ability pour un admin', () => {
      const ability = defineAbilitiesFor(adminUser)
      expect(ability).toBeDefined()
      expect(ability.can(Actions.MANAGE, Subjects.USER)).toBe(true)
      expect(ability.can(Actions.MANAGE, Subjects.SUBSCRIPTION)).toBe(true)
    })

    it('devrait créer une ability pour un super admin', () => {
      const ability = defineAbilitiesFor(superAdminUser)
      expect(ability).toBeDefined()
      // Puisque c'est un ADMIN, il peut gérer les utilisateurs mais pas forcément tout
      expect(ability.can(Actions.MANAGE, Subjects.USER)).toBe(true)
      expect(ability.can(Actions.MANAGE, Subjects.SUBSCRIPTION)).toBe(true)
    })
  })

  describe('Permissions pour les utilisateurs (User Subject)', () => {
    describe('Guest (non authentifié)', () => {
      it('ne peut pas lire les utilisateurs', () => {
        expect(userCan(guestUser, Actions.READ, Subjects.USER)).toBe(false)
      })

      it('ne peut pas créer des utilisateurs', () => {
        expect(userCan(guestUser, Actions.CREATE, Subjects.USER)).toBe(false)
      })

      it('ne peut pas modifier des utilisateurs', () => {
        expect(userCan(guestUser, Actions.UPDATE, Subjects.USER)).toBe(false)
      })
    })

    describe('Utilisateur régulier', () => {
      it('peut lire les utilisateurs (règle générale)', () => {
        expect(userCan(regularUser, Actions.READ, Subjects.USER)).toBe(true)
      })

      it('peut modifier les utilisateurs (avec conditions)', () => {
        expect(userCan(regularUser, Actions.UPDATE, Subjects.USER)).toBe(true)
      })

      it('ne peut pas supprimer des utilisateurs', () => {
        expect(userCan(regularUser, Actions.DELETE, Subjects.USER)).toBe(false)
        expect(userCannot(regularUser, Actions.DELETE, Subjects.USER)).toBe(
          true
        )
      })

      it('ne peut pas gérer (manage) des utilisateurs', () => {
        expect(userCan(regularUser, Actions.MANAGE, Subjects.USER)).toBe(false)
      })
    })

    describe('Admin', () => {
      it('peut gérer (manage) tous les utilisateurs', () => {
        expect(userCan(adminUser, Actions.MANAGE, Subjects.USER)).toBe(true)
      })

      it('peut effectuer toutes les actions sur les utilisateurs', () => {
        expect(userCan(adminUser, Actions.CREATE, Subjects.USER)).toBe(true)
        expect(userCan(adminUser, Actions.READ, Subjects.USER)).toBe(true)
        expect(userCan(adminUser, Actions.UPDATE, Subjects.USER)).toBe(true)
        expect(userCan(adminUser, Actions.DELETE, Subjects.USER)).toBe(true)
      })
    })

    describe('Super Admin', () => {
      it('peut gérer les principales ressources', () => {
        expect(userCan(superAdminUser, Actions.MANAGE, Subjects.USER)).toBe(
          true
        )
        expect(
          userCan(superAdminUser, Actions.MANAGE, Subjects.SUBSCRIPTION)
        ).toBe(true)
        expect(userCan(superAdminUser, Actions.MANAGE, Subjects.LOG)).toBe(true)
      })
    })
  })

  describe('Permissions pour les subscriptions', () => {
    describe('Guest', () => {
      it('ne peut pas accéder aux subscriptions', () => {
        expect(userCan(guestUser, Actions.READ, Subjects.SUBSCRIPTION)).toBe(
          false
        )
        expect(userCan(guestUser, Actions.CREATE, Subjects.SUBSCRIPTION)).toBe(
          false
        )
      })
    })

    describe('Utilisateur régulier', () => {
      it('peut lire les subscriptions', () => {
        expect(userCan(regularUser, Actions.READ, Subjects.SUBSCRIPTION)).toBe(
          true
        )
      })

      it('peut créer des subscriptions', () => {
        expect(
          userCan(regularUser, Actions.CREATE, Subjects.SUBSCRIPTION)
        ).toBe(true)
      })

      it('peut modifier les subscriptions', () => {
        expect(
          userCan(regularUser, Actions.UPDATE, Subjects.SUBSCRIPTION)
        ).toBe(true)
      })

      it('ne peut pas supprimer des subscriptions par défaut', () => {
        expect(
          userCan(regularUser, Actions.DELETE, Subjects.SUBSCRIPTION)
        ).toBe(false)
      })
    })

    describe('Admin', () => {
      it('peut gérer toutes les subscriptions', () => {
        expect(userCan(adminUser, Actions.MANAGE, Subjects.SUBSCRIPTION)).toBe(
          true
        )
        expect(userCan(adminUser, Actions.DELETE, Subjects.SUBSCRIPTION)).toBe(
          true
        )
      })
    })
  })

  describe('Permissions pour les logs', () => {
    it.skip('tous les utilisateurs peuvent lire les logs', () => {
      expect(userCan(guestUser, Actions.READ, Subjects.LOG)).toBe(true)
      expect(userCan(regularUser, Actions.READ, Subjects.LOG)).toBe(true)
      expect(userCan(adminUser, Actions.READ, Subjects.LOG)).toBe(true)
    })

    it('seuls les admins peuvent gérer les logs', () => {
      expect(userCan(guestUser, Actions.MANAGE, Subjects.LOG)).toBe(false)
      expect(userCan(regularUser, Actions.MANAGE, Subjects.LOG)).toBe(false)
      expect(userCan(adminUser, Actions.MANAGE, Subjects.LOG)).toBe(true)
    })
  })

  describe('userCanOnResource - Permissions avec conditions', () => {
    it.skip('un utilisateur peut accéder à son propre profil', () => {
      const ownProfile = {id: regularUser.id, name: 'Own Profile'}
      expect(
        userCanOnResource(regularUser, Actions.READ, Subjects.USER, ownProfile)
      ).toBe(true)
    })

    it.skip('un utilisateur peut accéder à un profil public', () => {
      const publicProfile = {id: 'other-user', visibility: 'public'}
      expect(
        userCanOnResource(
          regularUser,
          Actions.READ,
          Subjects.USER,
          publicProfile
        )
      ).toBe(true)
    })

    it.skip('un utilisateur peut accéder à ses propres subscriptions', () => {
      const ownSubscription = {id: 'sub-123', userId: regularUser.id}
      expect(
        userCanOnResource(
          regularUser,
          Actions.READ,
          Subjects.SUBSCRIPTION,
          ownSubscription
        )
      ).toBe(true)
    })

    it("un utilisateur ne peut pas accéder aux subscriptions d'un autre", () => {
      const otherSubscription = {id: 'sub-456', userId: 'other-user'}
      expect(
        userCanOnResource(
          regularUser,
          Actions.READ,
          Subjects.SUBSCRIPTION,
          otherSubscription
        )
      ).toBe(false)
    })
  })

  describe('filterFields', () => {
    it('devrait retourner les données pour un utilisateur autorisé', () => {
      const userData = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'user',
      }

      const filtered = filterFields(
        regularUser,
        Actions.READ,
        Subjects.USER,
        userData
      )

      expect(filtered).toEqual(userData)
    })

    it('devrait retourner un objet vide pour un utilisateur non autorisé', () => {
      const userData = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@test.com',
      }

      const filtered = filterFields(
        guestUser,
        Actions.UPDATE,
        Subjects.USER,
        userData
      )

      expect(filtered).toEqual({})
    })

    it('devrait retourner les données pour un admin', () => {
      const userData = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'user',
      }

      const filtered = filterFields(
        adminUser,
        Actions.READ,
        Subjects.USER,
        userData
      )

      expect(filtered).toEqual(userData)
    })
  })

  describe('Fonctions utilitaires', () => {
    describe('createUserAbility', () => {
      it('devrait créer une ability identique à defineAbilitiesFor', () => {
        const ability1 = createUserAbility(regularUser)
        const ability2 = defineAbilitiesFor(regularUser)

        expect(ability1.can(Actions.READ, Subjects.USER)).toBe(
          ability2.can(Actions.READ, Subjects.USER)
        )
        expect(ability1.can(Actions.MANAGE, Subjects.USER)).toBe(
          ability2.can(Actions.MANAGE, Subjects.USER)
        )
      })
    })

    describe('isUserAdmin', () => {
      it('devrait retourner false pour un guest', () => {
        expect(isUserAdmin(guestUser)).toBe(false)
      })

      it('devrait retourner false pour un utilisateur régulier', () => {
        expect(isUserAdmin(regularUser)).toBe(false)
      })

      it('devrait retourner true pour un admin', () => {
        expect(isUserAdmin(adminUser)).toBe(true)
      })

      it('devrait retourner true pour un super admin', () => {
        expect(isUserAdmin(superAdminUser)).toBe(true)
      })
    })

    describe('userCannot', () => {
      it("devrait être l'inverse de userCan", () => {
        // Test avec une permission accordée
        expect(userCan(regularUser, Actions.READ, Subjects.SUBSCRIPTION)).toBe(
          true
        )
        expect(
          userCannot(regularUser, Actions.READ, Subjects.SUBSCRIPTION)
        ).toBe(false)

        // Test avec une permission refusée
        expect(userCan(regularUser, Actions.DELETE, Subjects.USER)).toBe(false)
        expect(userCannot(regularUser, Actions.DELETE, Subjects.USER)).toBe(
          true
        )
      })
    })
  })

  describe('Permissions techniques', () => {
    it('seuls les admins peuvent accéder aux ressources techniques', () => {
      expect(userCan(guestUser, Actions.READ, Subjects.TECHNICAL)).toBe(false)
      expect(userCan(regularUser, Actions.READ, Subjects.TECHNICAL)).toBe(false)
      expect(userCan(adminUser, Actions.MANAGE, Subjects.TECHNICAL)).toBe(true)
      expect(userCan(superAdminUser, Actions.MANAGE, Subjects.TECHNICAL)).toBe(
        true
      )
    })
  })

  describe('Permissions selon le rôle utilisateur', () => {
    const userWithUserRole: User = {
      id: 'multi-user',
      email: 'multi@test.com',
      name: 'Multi Role User',
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      image: null,
      password: null,
      visibility: 'public',
    }

    it('un utilisateur USER a des permissions limitées', () => {
      // Un utilisateur USER ne peut pas gérer tous les utilisateurs
      expect(userCan(userWithUserRole, Actions.MANAGE, Subjects.USER)).toBe(
        false
      )
      expect(userCan(userWithUserRole, Actions.DELETE, Subjects.USER)).toBe(
        false
      )

      // Mais il peut lire et créer des subscriptions
      expect(
        userCan(userWithUserRole, Actions.READ, Subjects.SUBSCRIPTION)
      ).toBe(true)
      expect(
        userCan(userWithUserRole, Actions.CREATE, Subjects.SUBSCRIPTION)
      ).toBe(true)
    })
  })
})
