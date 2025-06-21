// src/lib/api-auth.ts
import {headers} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'

import {auth} from '@/lib/better-auth/auth'
import {getAuthUser} from '@/services/authentication/auth-service'
import {hasRequiredRole} from '@/services/authentication/auth-util'
import {RoleConst} from '@/services/types/domain/auth-types'
import {Roles, User} from '@/services/types/domain/user-types'

export type ProtectedApiHandler = (
  request: NextRequest,
  authUser?: User,
  context?: {params: Record<string, string>}
) => Promise<NextResponse>

export function withApiAuth(
  handler: ProtectedApiHandler,
  requiredRole?: Roles
) {
  return async (
    request: NextRequest,
    context?: {params: Record<string, string>}
  ) => {
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

// Wrapper functions pour les rôles courants
export function withApiAdminAuth(handler: ProtectedApiHandler) {
  return withApiAuth(handler, RoleConst.ADMIN)
}

export function withApiRedactorAuth(handler: ProtectedApiHandler) {
  return withApiAuth(handler, RoleConst.REDACTOR)
}

export function withApiUserAuth(handler: ProtectedApiHandler) {
  return withApiAuth(handler, RoleConst.USER)
}
