import {cache} from 'react'

import {getAuthUser} from '@/services/authentication/auth-service'
import {
  canDeleteProject,
  canUpdateProject,
} from '@/services/authorization/project-authorization'
import {getProjectsWithPaginationService} from '@/services/facades/project-service-facade'
import {PaginatedResponse} from '@/services/types/common-type'
import {Project, ProjectFilters} from '@/services/types/domain/project-types'

// Cache pour optimiser les performances côté serveur
export const getAllProjectsWithPaginationDal = cache(
  async (
    {limit, offset}: {limit: number; offset: number},
    search?: string
  ): Promise<PaginatedResponse<Project>> => {
    const filters: ProjectFilters = search ? {name: search} : {}
    return await getProjectsWithPaginationService({limit, offset}, filters)
  }
)

export const getProjectAdminPermissionsDal = cache(async () => {
  // Pour les permissions générales, on peut passer un organization ID factice
  // ou modifier les fonctions d'autorisation pour supporter des vérifications générales
  const user = await getAuthUser()
  if (!user) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManage: false,
    }
  }

  // Pour l'instant, on considère que si l'utilisateur est connecté,
  // il peut potentiellement avoir des droits (vérification détaillée par organisation)
  return {
    canCreate: true, // Sera vérifié au niveau organisation
    canEdit: true, // Sera vérifié au niveau projet
    canDelete: true, // Sera vérifié au niveau projet
    canManage: true,
  }
})

export async function getProjectPermissions(projectId?: string) {
  if (!projectId) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
    }
  }

  const [canEdit, canDelete] = await Promise.all([
    canUpdateProject(projectId),
    canDeleteProject(projectId),
  ])

  return {
    canCreate: false, // Pas applicable au niveau projet
    canEdit,
    canDelete,
  }
}
