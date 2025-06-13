/* eslint-disable @typescript-eslint/no-explicit-any */
import {eq, or, sql} from 'drizzle-orm'

import {user as users} from '@/db/models/auth-model'
import db from '@/db/models/db'
import {
  AddOrganizationModel,
  organizations,
  userOrganizations,
} from '@/db/models/organization-model'
import {
  AddUserModel,
  roles,
  UpdateUserModel,
  UserModel,
  userRoles,
} from '@/db/models/user-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'
import {
  RoleConst,
  UserOrganizationRoleConst,
} from '@/services/types/domain/auth-types'
import {User} from '@/services/types/domain/user-types'
// CRUD
export const createUserDao = async (user: AddUserModel) => {
  const row = await db
    .insert(users)
    .values({email: user.email, name: user.name})
    .returning()
  return row[0]
}

export const getUserByIdDao = async (
  uid: string
): Promise<User | undefined> => {
  const row = await db.query.user.findFirst({
    where: (user, {eq}) => eq(user.id, uid),
    with: {
      userRoles: {
        with: {
          role: {
            columns: {
              name: true,
            },
          },
        },
      },
      userOrganizations: {
        with: {
          organization: true,
        },
      },
    },
  })
  const roles = row?.userRoles?.map((r) => r.role.name) ?? []
  const organizations = row?.userOrganizations ?? []

  if (!row) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {userRoles, userOrganizations, ...rest} = row
  return {
    ...rest,
    roles,
    organizations,
  }
}

export const updateUserByUidDao = async (user: UpdateUserModel) => {
  if (!user.id) {
    throw new Error('User ID is required')
  }
  await db
    .update(users)
    .set({...user})
    .where(eq(users.id, user.id))
}

export const deleteUserByIdDao = async (uid: string) => {
  await db.delete(users).where(eq(users.id, uid))
}

// Extra
export const getUserByEmailDao = async (
  email: string
): Promise<User | undefined> => {
  const row = await db.query.user.findFirst({
    where: (user, {eq}) => eq(user.email, email),
    with: {
      userRoles: {
        with: {
          role: {
            columns: {
              name: true,
            },
          },
        },
      },
      userOrganizations: {
        with: {
          organization: true,
        },
      },
    },
  })
  const roles = row?.userRoles?.map((r) => r.role.name) ?? []
  const organizations = row?.userOrganizations ?? []

  if (!row) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {userRoles, userOrganizations, ...rest} = row
  return {
    ...rest,
    roles,
    organizations,
  }
}

export const getPublicUsersWithPaginationDao = async (
  pagination: Pagination
): Promise<PaginatedResponse<UserModel>> => {
  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(eq(users.visibility, 'public'))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(users)
      .where(eq(users.visibility, 'public')),
  ])

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {
      rowCount: count,
      pageSize: pagination.limit,
    },
  }
}

export const getAllUsersWithPaginationDao = async (
  pagination: Pagination,
  search?: string
): Promise<PaginatedResponse<User>> => {
  // Construire la clause WHERE pour la recherche
  let searchCondition: any = undefined
  if (search && search.trim()) {
    const searchTerm = search.trim()
    searchCondition = or(
      sql`${users.name} ILIKE ${`%${searchTerm}%`}`,
      sql`${users.email} ILIKE ${`%${searchTerm}%`}`
    )
  }

  // Récupérer les utilisateurs de base
  const [baseUsers, [{count}]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(searchCondition)
      .limit(pagination.limit)
      .offset(pagination.offset)
      .orderBy(sql`${users.createdAt} DESC`),
    db
      .select({count: sql<number>`count(*)`})
      .from(users)
      .where(searchCondition),
  ])

  // Transformer en User avec rôles et organisations (simplifié pour l'admin)
  const transformedUsers: User[] = baseUsers.map((user) => ({
    ...user,
    roles: [], // Les rôles seront chargés à la demande si nécessaire
    organizations: [], // Les organisations seront chargées à la demande si nécessaire
  }))

  return {
    data: transformedUsers,
    pagination: {
      rowCount: count,
      pageSize: pagination.limit,
    },
  }
}

export const updateUserSafeByUidDao = async (
  user: UpdateUserModel,
  uid: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {id, email, /* password,*/ emailVerified, createdAt, ...rest} = user
  rest.updatedAt = new Date()
  await db
    .update(users)
    .set({...rest})
    .where(eq(users.id, uid))
}

export const createUserAndOrganizationTxnDao = async (
  userData: AddUserModel,
  organizationData: AddOrganizationModel
): Promise<{user: User; organizationId: string}> => {
  return await db.transaction(async (tx) => {
    // 1. Créer l'utilisateur
    const [newUser] = await tx
      .insert(users)
      .values({
        email: userData.email,
        name: userData.name,
        //password: userData.password,
        visibility: userData.visibility,
      })
      .returning()

    // 2. Récupérer le rôle 'user'
    const [userRole] = await tx
      .select()
      .from(roles)
      .where(eq(roles.name, RoleConst.USER))
      .limit(1)

    if (!userRole) {
      throw new Error('Role "user" not found')
    }

    // 3. Assigner le rôle 'user' à l'utilisateur
    await tx.insert(userRoles).values({
      userId: newUser.id,
      roleId: userRole.id,
      assignedAt: new Date(),
    })

    // 4. Créer l'organisation
    const [newOrganization] = await tx
      .insert(organizations)
      .values({
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description,
        image: organizationData.image,
      })
      .returning()

    // 5. Créer la relation user-organization avec le rôle OWNER
    await tx.insert(userOrganizations).values({
      userId: newUser.id,
      organizationId: newOrganization.id,
      role: UserOrganizationRoleConst.OWNER,
    })

    // 6. Retourner les données créées
    return {
      user: {
        ...newUser,
        roles: [RoleConst.USER],
        organizations: [],
      },
      organizationId: newOrganization.id,
    }
  })
}

export const createUserRoleAndOrganizationTxnDao = async (
  userId: string,
  organizationData: AddOrganizationModel
): Promise<{user: User; organizationId: string}> => {
  return await db.transaction(async (tx) => {
    // 1. Récupérer l'utilisateur existant
    const existingUser = await tx.query.user.findFirst({
      where: eq(users.id, userId),
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    // 2. Récupérer le rôle 'user'
    const [userRole] = await tx
      .select()
      .from(roles)
      .where(eq(roles.name, RoleConst.USER))
      .limit(1)

    if (!userRole) {
      throw new Error('Role "user" not found')
    }

    // 3. Assigner le rôle 'user' à l'utilisateur
    await tx.insert(userRoles).values({
      userId: existingUser.id,
      roleId: userRole.id,
      assignedAt: new Date(),
    })

    // 4. Créer l'organisation
    const [newOrganization] = await tx
      .insert(organizations)
      .values({
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description,
        image: organizationData.image,
      })
      .returning()

    // 5. Créer la relation user-organization avec le rôle OWNER
    await tx.insert(userOrganizations).values({
      userId: existingUser.id,
      organizationId: newOrganization.id,
      role: UserOrganizationRoleConst.OWNER,
    })

    const existingUserWithRoles = await tx.query.user.findFirst({
      where: eq(users.id, userId),
      with: {
        userRoles: {
          with: {
            role: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
    })
    // 4. Retourner les données créées
    const roles_ =
      existingUserWithRoles?.userRoles?.map((r) => r.role.name) ?? []
    return {
      user: {
        ...existingUser,
        roles: roles_,
        organizations: [],
      },
      organizationId: newOrganization.id,
    }
  })
}

/**
 * Recherche des utilisateurs par nom ou email (LIKE/ILIKE),
 * possibilité d'exclure ceux déjà membres d'une organisation.
 */
export const searchUsersDao = async (
  query: string,
  excludeOrganizationId?: string
): Promise<UserModel[]> => {
  let whereClause: any
  if (excludeOrganizationId) {
    const userOrgs = await db
      .select({userId: userOrganizations.userId})
      .from(userOrganizations)
      .where(eq(userOrganizations.organizationId, excludeOrganizationId))
    const excludedUserIds = userOrgs.map((uo) => uo.userId)

    whereClause = (
      fields: typeof users._.columns,
      {ilike, or, notInArray, and}: any
    ) =>
      and(
        or(ilike(fields.name, `%${query}%`), ilike(fields.email, `%${query}%`)),
        notInArray(fields.id, excludedUserIds.length ? excludedUserIds : [''])
      )
  } else {
    whereClause = (fields: typeof users._.columns, {ilike, or}: any) =>
      or(ilike(fields.name, `%${query}%`), ilike(fields.email, `%${query}%`))
  }

  const rows = await db.query.user.findMany({
    where: whereClause,
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      image: true,
      //password: true,
      visibility: true,
    },
  })
  return rows
}

/**
 * Vérifie si un email existe déjà dans la base de données
 */
export const isEmailExistsDao = async (email: string): Promise<boolean> => {
  const user = await db.query.user.findFirst({
    where: eq(users.email, email),
  })
  return !!user
}
