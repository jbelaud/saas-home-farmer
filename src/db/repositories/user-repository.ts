import {eq, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {AddUserModel, UpdateUserModel, users} from '@/db/models/user-model'

// CRUD
export const createUserDao = async (user: AddUserModel) => {
  const row = await db
    .insert(users)
    .values({email: user.email, name: user.name})
    .returning()
  return row[0]
}

export const getUserByIdDao = async (uid: string) => {
  const row = await db.query.users.findFirst({
    where: (user, {eq}) => eq(user.id, uid),
  })
  return row
}

export const updateUserByUidDao = async (
  user: UpdateUserModel,
  uid: string
) => {
  await db
    .update(users)
    .set({...user})
    .where(eq(users.id, uid))
}

export const deleteUserByIdDao = async (uid: string) => {
  await db.delete(users).where(eq(users.id, uid))
}

// Extra
export const getUserByEmailDao = async (email: string) => {
  const row = await db.query.users.findFirst({
    where: (user, {eq}) => eq(user.email, email),
  })
  return row
}

export const getPublicUsersWithPaginationDao = async (pagination: {
  limit: number
  offset: number
}) => {
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
  const {id, email, password, role, emailVerified, createdAt, ...rest} = user
  rest.updatedAt = new Date()
  await db
    .update(users)
    .set({...rest})
    .where(eq(users.id, uid))
}
