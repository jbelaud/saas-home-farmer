import {and, eq} from 'drizzle-orm'

import {roles, user as users, userRoles} from '@/db/models/auth-model'
import db from '@/db/models/db'
import {
  type AddRoleModel,
  type AddUserRoleModel,
  RoleEnumModel,
  type RoleModel,
  type UpdateRoleModel,
  type UserModel,
  type UserRoleModel,
} from '@/db/models/user-model'

// Gestion des rôles
export const createRoleDao = async (role: AddRoleModel): Promise<RoleModel> => {
  const row = await db.insert(roles).values(role).returning()
  return row[0]
}

export const getAllRolesDao = async (): Promise<RoleModel[]> => {
  return await db.select().from(roles)
}

export const getRoleByIdDao = async (
  roleId: string
): Promise<RoleModel | undefined> => {
  const row = await db.query.roles.findFirst({
    where: (role, {eq}) => eq(role.id, roleId),
  })
  return row
}

export const getRoleByNameDao = async (
  name: RoleEnumModel
): Promise<RoleModel | undefined> => {
  const row = await db.query.roles.findFirst({
    where: (role, {eq}) => eq(role.name, name),
  })
  return row
}

export const updateRoleDao = async (role: UpdateRoleModel): Promise<void> => {
  if (!role.id) {
    throw new Error('Role ID is required')
  }
  await db
    .update(roles)
    .set({...role, updatedAt: new Date()})
    .where(eq(roles.id, role.id))
}

export const deleteRoleDao = async (roleId: string): Promise<void> => {
  await db.delete(roles).where(eq(roles.id, roleId))
}

// Gestion des assignations de rôles aux utilisateurs
export const assignRoleToUserDao = async (
  assignment: AddUserRoleModel
): Promise<UserRoleModel> => {
  const row = await db.insert(userRoles).values(assignment).returning()
  return row[0]
}

export const removeRoleFromUserDao = async (
  userId: string,
  roleId: string
): Promise<void> => {
  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
}

export const getUserRolesDao = async (userId: string): Promise<RoleModel[]> => {
  const result = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))

  return result
}

export const getUsersWithRoleDao = async (
  roleId: string
): Promise<UserModel[]> => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      image: users.image,
      //password: users.password,
      visibility: users.visibility,
    })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .where(eq(userRoles.roleId, roleId))

  return result
}

export const hasUserRoleDao = async (
  userId: string,
  roleName: RoleEnumModel
): Promise<boolean> => {
  const result = await db
    .select({count: userRoles.userId})
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.name, roleName)))
    .limit(1)

  return result.length > 0
}

export const getUserWithRolesDao = async (
  userId: string
): Promise<(UserModel & {roles: RoleModel[]}) | undefined> => {
  const user = await db.query.user.findFirst({
    where: (user, {eq}) => eq(user.id, userId),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  })

  if (!user) return undefined

  return {
    ...user,
    roles: user.userRoles.map((ur) => ur.role),
  }
}

export const bulkAssignRolesToUserDao = async (
  userId: string,
  roleIds: string[],
  assignedBy?: string
): Promise<UserRoleModel[]> => {
  const assignments = roleIds.map((roleId) => ({
    userId,
    roleId,
    assignedBy,
  }))

  const result = await db.insert(userRoles).values(assignments).returning()
  return result
}

export const replaceUserRolesDao = async (
  userId: string,
  roleIds: string[],
  assignedBy?: string
): Promise<UserRoleModel[]> => {
  // Supprimer tous les rôles existants
  await db.delete(userRoles).where(eq(userRoles.userId, userId))

  // Assigner les nouveaux rôles
  if (roleIds.length === 0) {
    return []
  }

  return await bulkAssignRolesToUserDao(userId, roleIds, assignedBy)
}
