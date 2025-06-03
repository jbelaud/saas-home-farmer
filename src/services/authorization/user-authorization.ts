import {getUserByIdDao} from '@/db/repositories/user-repository'
import {getAuthUser} from '@/services/authentication/auth-utils'

import {isUserAdmin, userCanOnResource} from './authorization-service'
import {ActionsConst, SubjectsConst} from './casl-abilities'

export const canReadUser = async (resourceId: string): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Récupérer l'utilisateur cible pour vérifier la visibilité
  const targetUser = await getUserByIdDao(resourceId)
  if (!targetUser) return false

  // Utiliser CASL pour vérifier les permissions avec conditions
  return userCanOnResource(authUser, ActionsConst.READ, SubjectsConst.USER, {
    id: targetUser.id,
    visibility: targetUser.visibility,
  })
}

export const canUpdateUser = async (resourceId: string): Promise<boolean> => {
  const authUser = await getAuthUser()

  // Utiliser CASL pour vérifier les permissions avec condition de propriété
  return userCanOnResource(authUser, ActionsConst.UPDATE, SubjectsConst.USER, {
    id: resourceId,
  })
}

// Fonction de compatibilité - maintenant basée sur CASL
export const isAdmin = async (): Promise<boolean> => {
  const authUser = await getAuthUser()
  return isUserAdmin(authUser)
}
