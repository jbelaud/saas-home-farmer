import 'server-only'

import {cache} from 'react'

import {getAuthUser} from '@/services/authentication/auth-service'
import {
  canCreatePost,
  canReadAllPosts,
} from '@/services/authorization/post-authorization'
import {AuthorizationError} from '@/services/errors/authorization-error'
import {
  getAllCategoriesService,
  getAllHashtagsService,
  getPostsWithPaginationService,
  getPostsWithTranslationsAndPaginationService,
} from '@/services/facades/post-service-facade'
import {Pagination} from '@/services/types/common-type'
import {
  Category,
  Hashtag,
  PostData,
  PostFilters,
  PostModel,
  SupportedLanguage,
} from '@/services/types/domain/post-types'

/**
 * Récupérer tous les posts avec pagination (avec cache)
 */
export const getPostsWithPaginationDal = cache(
  async (
    pagination: Pagination,
    filters?: PostFilters
  ): Promise<{
    data: PostModel[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }> => {
    return await getPostsWithPaginationService(pagination, filters)
  }
)

/**
 * Récupérer tous les posts avec traductions et pagination (avec cache)
 */
export const getPostsWithTranslationsAndPaginationDal = cache(
  async (
    pagination: Pagination,
    language: SupportedLanguage,
    filters?: PostFilters
  ): Promise<{
    data: PostData[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }> => {
    return await getPostsWithTranslationsAndPaginationService(
      pagination,
      language,
      filters
    )
  }
)

/**
 * Récupérer toutes les catégories (avec cache)
 */
export const getAllCategoriesDal = cache(async (): Promise<Category[]> => {
  return await getAllCategoriesService()
})

/**
 * Récupérer tous les hashtags (avec cache)
 */
export const getAllHashtagsDal = cache(async (): Promise<Hashtag[]> => {
  return await getAllHashtagsService()
})

/**
 * Vérifier les permissions pour les posts (version basique pour client components)
 */
export const getPostPermissionsDal = cache(async () => {
  const user = await getAuthUser()

  const [canCreate, canReadAll] = await Promise.all([
    canCreatePost(),
    canReadAllPosts(),
  ])

  return {
    canCreate,
    canReadAll,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
  }
})

/**
 * Vérifier les permissions CRUD pour les posts (fonction helper)
 */
export const checkPostPermissions = async () => {
  const granted = await canReadAllPosts()
  if (!granted) {
    throw new AuthorizationError('Accès refusé')
  }
}
