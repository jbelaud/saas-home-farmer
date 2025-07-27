import 'server-only'

import {cache} from 'react'

import {getAuthUser} from '@/services/authentication/auth-service'
import {
  canCreatePost,
  canReadAllPosts,
} from '@/services/authorization/post-authorization'
import {AuthorizationError} from '@/services/errors/authorization-error'
import {
  getAllCategoriesPublicService,
  getAllHashtagsService,
  getPostBySlugAndLanguageService,
  getPostsWithPaginationService,
  getPostsWithTranslationsAndPaginationService,
  getPublishedPostBySlugAndLanguageService,
  getPublishedPostsWithTranslationsService,
} from '@/services/facades/post-service-facade'
import {Pagination} from '@/services/types/common-type'
import {
  CategoryDTO,
  Hashtag,
  PostData,
  PostFilters,
  PostModel,
  SupportedLanguage,
} from '@/services/types/domain/post-types'

/**
 * Récupérer un post par slug et langue (avec cache)
 */
export const getPostBySlugAndLanguageDal = cache(
  async (slug: string, language: SupportedLanguage): Promise<PostData> => {
    return await getPostBySlugAndLanguageService(slug, language)
  }
)

/**
 * Récupérer tous les posts avec pagination (avec cache)
 */
export const getPostsWithPaginationDal = cache(
  async (
    pagination: Pagination,
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
      'fr',
      filters
    )
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
export const getAllCategoriesDal = cache(async (): Promise<CategoryDTO[]> => {
  return await getAllCategoriesPublicService()
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

// ===== FONCTIONS PUBLIQUES (SANS AUTORISATION) =====

/**
 * Récupérer les posts publiés avec traductions et pagination (VERSION PUBLIQUE)
 */
export const getPublishedPostsWithTranslationsAndPaginationDal = cache(
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
    return await getPublishedPostsWithTranslationsService(
      pagination,
      language,
      filters
    )
  }
)

/**
 * Récupérer un post publié par slug et langue (VERSION PUBLIQUE)
 */
export const getPublishedPostBySlugAndLanguageDal = cache(
  async (slug: string, language: SupportedLanguage): Promise<PostData> => {
    return await getPublishedPostBySlugAndLanguageService(slug, language)
  }
)
