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

// Fonction simple pour authentification par token
export function withAuthToken(
  handler: StaticRouteHandler,
  requiredRole?: Roles
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Récupérer le token depuis les headers
      const authHeader = request.headers.get('Authorization')
      const apiKeyHeader = request.headers.get('X-API-Key')
      const authTokenHeader = request.headers.get('X-Auth-Token')

      let token: string | null = null

      // Vérifier différents formats de token
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      } else if (apiKeyHeader) {
        token = apiKeyHeader
      } else if (authTokenHeader) {
        token = authTokenHeader
      }

      if (!token) {
        return NextResponse.json({error: 'Token manquant'}, {status: 401})
      }

      // Valider le token avec better-auth
      const tokenHeaders = new Headers()
      tokenHeaders.set('authorization', `Bearer ${token}`)

      const session = await auth.api.getSession({
        headers: tokenHeaders,
      })

      if (!session?.session?.userId) {
        return NextResponse.json({error: 'Token invalide'}, {status: 401})
      }

      // Récupérer l'utilisateur complet
      const authUser = await getAuthUser()
      if (!authUser) {
        return NextResponse.json(
          {error: 'Utilisateur non trouvé'},
          {status: 404}
        )
      }

      // Vérifier le rôle si requis
      if (requiredRole) {
        const hasRole = hasRequiredRole(authUser, requiredRole)
        if (!hasRole) {
          return NextResponse.json({error: 'Non autorisé'}, {status: 403})
        }
      }

      // Exécuter le handler
      return await handler(request, authUser)
    } catch (error) {
      console.error('Erreur API Auth Token:', error)
      return NextResponse.json(
        {error: "Erreur d'authentification par token"},
        {status: 500}
      )
    }
  }
}
