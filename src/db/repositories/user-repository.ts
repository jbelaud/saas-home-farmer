import {eq, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddUserModel,
  UpdateUserModel,
  UserModel,
  users,
} from '@/db/models/user-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'
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
  const row = await db.query.users.findFirst({
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
  const row = await db.query.users.findFirst({
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

export const updateUserSafeByUidDao = async (
  user: UpdateUserModel,
  uid: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {id, email, password, emailVerified, createdAt, ...rest} = user
  rest.updatedAt = new Date()
  await db
    .update(users)
    .set({...rest})
    .where(eq(users.id, uid))
}
