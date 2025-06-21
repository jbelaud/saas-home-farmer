/* eslint-disable @typescript-eslint/no-explicit-any */
import {eq, or, sql} from 'drizzle-orm'

import {
  member,
  organization,
  session,
  user as users,
} from '@/db/models/auth-model'
import db from '@/db/models/db'
import {AddOrganizationModel} from '@/db/models/organization-model'
import {
  AddUserModel,
  AddUserSettingsModel,
  UpdateUserModel,
  UpdateUserSettingsModel,
  UserModel,
  userSettings,
  UserSettingsModel,
} from '@/db/models/user-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'
import {
  RoleConst,
  UserOrganizationRoleConst,
} from '@/services/types/domain/auth-types'
import {User} from '@/services/types/domain/user-types'

export type SessionModel = typeof session.$inferSelect
export type AddSessionModel = typeof session.$inferInsert
export type UpdateSessionModel = typeof session.$inferInsert

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
      members: {
        with: {
          organization: true,
        },
      },
      settings: true,
    },
  })

  const organizations = row?.members ?? []

  if (!row) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {members, ...rest} = row
  return {
    ...rest,
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
    where: (user, {eq}) => eq(user.email, email.toLowerCase()),
    with: {
      members: {
        with: {
          organization: true,
        },
      },
      settings: true,
    },
  })

  const organizations = row?.members ?? []

  if (!row) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {members, ...rest} = row
  return {
    ...rest,
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

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {
      total: count,
      page: page,
      limit: pagination.limit,
      totalPages: totalPages,
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

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: transformedUsers,
    pagination: {
      total: count,
      page: page,
      limit: pagination.limit,
      totalPages: totalPages,
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
        role: RoleConst.USER,
        visibility: userData.visibility,
      })
      .returning()

    // 4. Créer l'organisation
    const [newOrganization] = await tx
      .insert(organization)
      .values({
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description,
        logo: organizationData.logo,
      })
      .returning()

    // 5. Créer la relation user-organization avec le rôle OWNER
    await tx.insert(member).values({
      userId: newUser.id,
      organizationId: newOrganization.id,
      role: UserOrganizationRoleConst.OWNER,
      createdAt: new Date(),
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
): Promise<{user: User; organizationId: string; organizationSlug: string}> => {
  return await db.transaction(async (tx) => {
    // 1. Récupérer l'utilisateur existant
    const existingUser = await tx.query.user.findFirst({
      where: eq(users.id, userId),
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    // 4. Créer l'organisation
    const [newOrganization] = await tx
      .insert(organization)
      .values({
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description,
        logo: organizationData.logo,
      })
      .returning()

    // 5. Créer la relation user-organization avec le rôle OWNER
    await tx.insert(member).values({
      userId: existingUser.id,
      organizationId: newOrganization.id,
      role: UserOrganizationRoleConst.OWNER,
      createdAt: new Date(),
    })

    // 4. Retourner les données créées

    return {
      user: {
        ...existingUser,
        organizations: [],
      },
      organizationId: newOrganization.id,
      organizationSlug: newOrganization.slug ?? '',
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
      .select({userId: member.userId})
      .from(member)
      .where(eq(member.organizationId, excludeOrganizationId))
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
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      visibility: true,
      twoFactorEnabled: true,
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

// CRUD pour les paramètres utilisateur
export const createUserSettingsDao = async (
  settings: AddUserSettingsModel
): Promise<UserSettingsModel> => {
  const [row] = await db.insert(userSettings).values(settings).returning()
  return row
}

export const getUserSettingsByUserIdDao = async (
  userId: string
): Promise<UserSettingsModel | undefined> => {
  const row = await db.query.userSettings.findFirst({
    where: (settings, {eq}) => eq(settings.userId, userId),
  })
  return row
}

export const updateUserSettingsByUserIdDao = async (
  userId: string,
  settings: UpdateUserSettingsModel
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {userId: _, ...rest} = settings
  console.log('rest', rest)
  console.log('userId', userId)
  await db
    .update(userSettings)
    .set({...rest, updatedAt: new Date()})
    .where(eq(userSettings.userId, userId))
}

export const deleteUserSettingsByUserIdDao = async (
  userId: string
): Promise<void> => {
  await db.delete(userSettings).where(eq(userSettings.userId, userId))
}

// Fonction utilitaire pour créer ou mettre à jour les paramètres
export const upsertUserSettingsDao = async (
  userId: string,
  settings: AddUserSettingsModel
): Promise<UserSettingsModel> => {
  const existingSettings = await getUserSettingsByUserIdDao(userId)

  if (existingSettings) {
    await updateUserSettingsByUserIdDao(userId, settings)
    return {...existingSettings, ...settings, updatedAt: new Date()}
  } else {
    return await createUserSettingsDao({...settings, userId})
  }
}

// CRUD Session by userId
export const getSessionsByUserIdDao = async (
  userId: string
): Promise<SessionModel[]> => {
  return await db.query.session.findMany({
    where: (sess, {eq}) => eq(sess.userId, userId),
  })
}

export const getSessionByIdDao = async (
  sessionId: string
): Promise<SessionModel | undefined> => {
  return await db.query.session.findFirst({
    where: (sess, {eq}) => eq(sess.id, sessionId),
  })
}

export const createSessionDao = async (
  sessionData: AddSessionModel
): Promise<SessionModel> => {
  const [row] = await db.insert(session).values(sessionData).returning()
  return row
}

export const updateSessionByIdDao = async (
  sessionId: string,
  sessionData: UpdateSessionModel
): Promise<void> => {
  await db
    .update(session)
    .set({...sessionData, updatedAt: new Date()})
    .where(eq(session.id, sessionId))
}

export const deleteSessionByIdDao = async (
  sessionId: string
): Promise<void> => {
  await db.delete(session).where(eq(session.id, sessionId))
}

export const deleteSessionsByUserIdDao = async (
  userId: string
): Promise<void> => {
  await db.delete(session).where(eq(session.userId, userId))
}
