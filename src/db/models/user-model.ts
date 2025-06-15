import {relations} from 'drizzle-orm'

//import type {AdapterAccount} from 'next-auth/adapters'
import {account, member, roleEnum, user} from './auth-model'

export const usersRelations = relations(user, ({one, many}) => ({
  account: one(account, {
    fields: [user.id],
    references: [account.userId],
  }),

  members: many(member, {
    relationName: 'userToOrganizations',
  }),
  // userOrganizations: many(userOrganizations, {
  //   relationName: 'userToOrganizations',
  // }),
  // finances: many(finance),
}))

export type UserModel = typeof user.$inferSelect
export type AddUserModel = typeof user.$inferInsert
export type UpdateUserModel = typeof user.$inferInsert

// export type RoleModel = typeof roles.$inferSelect
// export type AddRoleModel = typeof roles.$inferInsert
// export type UpdateRoleModel = typeof roles.$inferInsert

// export type UserRoleModel = typeof userRoles.$inferSelect
// export type AddUserRoleModel = typeof userRoles.$inferInsert
export type RoleEnumModel = (typeof roleEnum.enumValues)[number]
