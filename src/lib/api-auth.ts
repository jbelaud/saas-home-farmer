// src/lib/api-auth.ts
import {headers} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'

import {auth} from '@/lib/better-auth/auth'
import {getAuthUser} from '@/services/authentication/auth-service'
import {hasRequiredRole} from '@/services/authentication/auth-util'
import {RoleConst} from '@/services/types/domain/auth-types'
import {Roles, User} from '@/services/types/domain/user-types'

// Types pour les handlers
export type StaticRouteHandler = (
  request: NextRequest,
  authUser: User
) => Promise<NextResponse>

export type DynamicRouteHandler = (
  request: NextRequest,
  authUser: User,
  context: {params: Promise<Record<string, string>>}
) => Promise<NextResponse>

// Fonction de base pour routes statiques
export function withAuth(handler: StaticRouteHandler, requiredRole?: Roles) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Vérifier la session
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session?.session?.userId) {
        return NextResponse.json({error: 'Non authentifié'}, {status: 401})
      }

      // Récupérer l'utilisateur complet
      const authUser = await getAuthUser()
      if (!authUser) {
        return NextResponse.json(
          {error: 'Utilisateur non trouvé'},
          {status: 404}
        )
      }
      const hasRole = hasRequiredRole(
        authUser,
        requiredRole ? (requiredRole as Roles) : RoleConst.USER
      )
      if (!hasRole) {
        return NextResponse.json({error: 'Non autorisé'}, {status: 403})
      }

      // Exécuter le handler avec l'utilisateur seulement
      return await handler(request, authUser)
    } catch (error) {
      console.error('Erreur API Auth:', error)
      return NextResponse.json(
        {error: "Erreur d'authentification"},
        {status: 500}
      )
    }
  }
}

// Fonction de base pour routes dynamiques
export function withDynamicAuth(
  handler: DynamicRouteHandler,
  requiredRole?: Roles
) {
  return async (
    request: NextRequest,
    context: {params: Promise<Record<string, string>>}
  ): Promise<NextResponse> => {
    try {
      // Vérifier la session
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session?.session?.userId) {
        return NextResponse.json({error: 'Non authentifié'}, {status: 401})
      }

      // Récupérer l'utilisateur complet
      const authUser = await getAuthUser()
      if (!authUser) {
        return NextResponse.json(
          {error: 'Utilisateur non trouvé'},
          {status: 404}
        )
      }
      const hasRole = hasRequiredRole(
        authUser,
        requiredRole ? (requiredRole as Roles) : RoleConst.USER
      )
      if (!hasRole) {
        return NextResponse.json({error: 'Non autorisé'}, {status: 403})
      }

      // Exécuter le handler avec l'utilisateur et le contexte
      return await handler(request, authUser, context)
    } catch (error) {
      console.error('Erreur API Auth:', error)
      return NextResponse.json(
        {error: "Erreur d'authentification"},
        {status: 500}
      )
    }
  }
}

// Fonctions par rôle pour routes statiques
export function withUserAuth(handler: StaticRouteHandler) {
  return withAuth(handler, RoleConst.USER)
}

export function withAdminAuth(handler: StaticRouteHandler) {
  return withAuth(handler, RoleConst.ADMIN)
}

export function withRedactorAuth(handler: StaticRouteHandler) {
  return withAuth(handler, RoleConst.REDACTOR)
}

// Fonctions par rôle pour routes dynamiques
export function withDynamicUserAuth(handler: DynamicRouteHandler) {
  return withDynamicAuth(handler, RoleConst.USER)
}

export function withDynamicAdminAuth(handler: DynamicRouteHandler) {
  return withDynamicAuth(handler, RoleConst.ADMIN)
}

export function withDynamicRedactorAuth(handler: DynamicRouteHandler) {
  return withDynamicAuth(handler, RoleConst.REDACTOR)
}
