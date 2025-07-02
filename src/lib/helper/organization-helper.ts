import {UserOrganizationRoleConst} from '@/services/types/domain/auth-types'

/**
 * Trie les organisations par rôle : OWNER en premier, puis ADMIN, puis les autres
 * @param organizations - Liste des organisations avec leur rôle
 * @returns Liste triée des organisations
 */
export function sortOrganizationsByRole<T extends {id: string; role: string}>(
  organizations: T[]
): T[] {
  return organizations.sort((a, b) => {
    const roleOrder = {
      [UserOrganizationRoleConst.OWNER]: 0,
      [UserOrganizationRoleConst.ADMIN]: 1,
      [UserOrganizationRoleConst.MEMBER]: 2,
    }

    const aOrder = roleOrder[a.role] ?? 3
    const bOrder = roleOrder[b.role] ?? 3

    return aOrder - bOrder
  })
}
