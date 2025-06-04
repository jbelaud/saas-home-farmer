'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {UserOrganizationRoleConst} from '@/services/types/domain/auth-types'
import {
  Organization,
  UserOrganizationAndOrganization,
} from '@/services/types/domain/organization-types'
import {User} from '@/services/types/domain/user-types'

interface OrganizationContextType {
  // États
  user: User | null
  organizations: UserOrganizationAndOrganization[]
  currentOrganization: Organization | null
  currentUserOrganization: UserOrganizationAndOrganization | null

  // Actions
  setUser: (user: User | null) => void
  setCurrentOrganization: (organizationId: string) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
)

interface OrganizationProviderProps {
  children: React.ReactNode
  initialUser?: User | null
}

export function OrganizationProvider({
  children,
  initialUser = null,
}: OrganizationProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null)

  // Dérivation des organisations depuis l'utilisateur
  const organizations = useMemo(() => user?.organizations || [], [user])

  // Dérivation de l'organisation utilisateur courante
  const currentUserOrganization =
    organizations.find(
      (org) => org.organization.id === currentOrganization?.id
    ) || null

  // Fonction pour changer d'organisation
  const handleSetCurrentOrganization = (organizationId: string) => {
    const userOrg = organizations.find(
      (org) => org.organization.id === organizationId
    )
    if (userOrg) {
      setCurrentOrganization(userOrg.organization)
      // Stocker la sélection dans localStorage pour la persistance
      localStorage.setItem('selectedOrganizationId', organizationId)
    }
  }

  // Initialiser l'organisation courante lors du chargement
  useEffect(() => {
    if (organizations.length > 0) {
      // Essayer de récupérer la dernière organisation sélectionnée
      const savedOrganizationId = localStorage.getItem('selectedOrganizationId')

      if (savedOrganizationId) {
        const savedOrg = organizations.find(
          (org) => org.organization.id === savedOrganizationId
        )
        if (savedOrg) {
          setCurrentOrganization(savedOrg.organization)
          return
        }
      }

      // Par défaut, sélectionner la première organisation
      setCurrentOrganization(organizations[0].organization)
    }
  }, [organizations])

  const value: OrganizationContextType = {
    // États
    user,
    organizations,
    currentOrganization,
    currentUserOrganization,

    // Actions
    setUser,
    setCurrentOrganization: handleSetCurrentOrganization,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte
export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    )
  }
  return context
}

// Hook utilitaire pour vérifier les permissions dans l'organisation courante
export function useOrganizationRole() {
  const {currentUserOrganization} = useOrganization()

  const isOwner =
    currentUserOrganization?.role === UserOrganizationRoleConst.OWNER
  const isAdmin =
    currentUserOrganization?.role === UserOrganizationRoleConst.ADMIN || isOwner
  const isMember =
    currentUserOrganization?.role === UserOrganizationRoleConst.MEMBER ||
    isAdmin

  return {
    role: currentUserOrganization?.role,
    isOwner,
    isAdmin,
    isMember,
  }
}
