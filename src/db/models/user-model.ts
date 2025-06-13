import {relations} from 'drizzle-orm'

//import type {AdapterAccount} from 'next-auth/adapters'
import {account, member, roleEnum, roles, user, userRoles} from './auth-model'

// //uuid_generate_v4() : CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
// /**
//  * @deprecated This table is deprecated and will be removed in a future version.
//  * Please use the new auth schema from auth-schema.ts instead.
//  */
// export const nextauthUsers = pgTable('nextauth_user', {
//   id: uuid('id')
//     .default(sql`uuid_generate_v4()`)
//     .primaryKey(),
//   name: text('name').notNull(),
//   email: text('email').notNull().unique(),
//   emailVerified: timestamp('emailVerified', {mode: 'date'}),
//   createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
//   updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
//   image: text('image'),
//   password: text('password'),
//   visibility: userVisibilityEnum('visibility').default('private').notNull(),
// })

// Nouvelle table pour les rôles

// Table de liaison pour la relation many-to-many entre users et roles

/**
 * @deprecated This table is deprecated and will be removed in a future version.
 * Please use the new auth schema from auth-schema.ts instead.
 */
// export const nextauthAccounts = pgTable(
//   'nextauth_account',
//   {
//     userId: uuid('userId')
//       .notNull()
//       .references(() => nextauthUsers.id, {onDelete: 'cascade'}),
//     type: text('type').$type<AdapterAccount['type']>().notNull(),
//     provider: text('provider').notNull(),
//     providerAccountId: text('providerAccountId').notNull(),
//     refresh_token: text('refresh_token'),
//     access_token: text('access_token'),
//     expires_at: integer('expires_at'),
//     token_type: text('token_type'),
//     scope: text('scope'),
//     id_token: text('id_token'),
//     session_state: text('session_state'),
//   },
//   (account) => ({
//     compoundKey: primaryKey({
//       columns: [account.provider, account.providerAccountId],
//     }),
//   })
// )
// /**
//  * @deprecated This table is deprecated and will be removed in a future version.
//  * Please use the new auth schema from auth-schema.ts instead.
//  */
// export const nextauthSessions = pgTable('nextauth_session', {
//   sessionToken: text('sessionToken').notNull().primaryKey(),
//   userId: uuid('userId').references(() => nextauthUsers.id, {
//     onDelete: 'cascade',
//   }),
//   expires: timestamp('expires', {mode: 'date'}).notNull(),
// })
// /**
//  * @deprecated This table is deprecated and will be removed in a future version.
//  * Please use the new auth schema from auth-schema.ts instead.
//  */
// export const nextauthVerificationTokens = pgTable(
//   'nextauth_verificationToken',
//   {
//     identifier: text('identifier').notNull(),
//     token: text('token').notNull(),
//     expires: timestamp('expires', {mode: 'date'}).notNull(),
//   },
//   (vt) => ({
//     compoundKey: primaryKey({columns: [vt.identifier, vt.token]}),
//   })
// )
// /**
//  * @deprecated This table is deprecated and will be removed in a future version.
//  * Please use the new auth schema from auth-schema.ts instead.
//  */
// export const authenticators = pgTable(
//   'authenticator',
//   {
//     credentialID: text('credentialID').notNull().unique(),
//     userId: uuid('userId').references(() => nextauthUsers.id, {
//       onDelete: 'cascade',
//     }),

//     providerAccountId: text('providerAccountId').notNull(),
//     credentialPublicKey: text('credentialPublicKey').notNull(),
//     counter: integer('counter').notNull(),
//     credentialDeviceType: text('credentialDeviceType').notNull(),
//     credentialBackedUp: boolean('credentialBackedUp').notNull(),
//     transports: text('transports'),
//   },
//   (authenticator) => ({
//     compositePK: primaryKey({
//       columns: [authenticator.userId, authenticator.credentialID],
//     }),
//   })
// )

export const usersRelations = relations(user, ({one, many}) => ({
  account: one(account, {
    fields: [user.id],
    references: [account.userId],
  }),
  userRoles: many(userRoles, {
    relationName: 'userToRoles',
  }),
  assignedRoles: many(userRoles, {
    relationName: 'assignedBy',
  }),
  members: many(member, {
    relationName: 'userToOrganizations',
  }),
  // userOrganizations: many(userOrganizations, {
  //   relationName: 'userToOrganizations',
  // }),
  // finances: many(finance),
}))

export const rolesRelations = relations(roles, ({many}) => ({
  userRoles: many(userRoles, {
    relationName: 'roleToUsers',
  }),
}))

export const userRolesRelations = relations(userRoles, ({one}) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id],
    relationName: 'userToRoles',
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
    relationName: 'roleToUsers',
  }),
  assignedByUser: one(user, {
    fields: [userRoles.assignedBy],
    references: [user.id],
    relationName: 'assignedBy',
  }),
}))

export type UserModel = typeof user.$inferSelect
export type AddUserModel = typeof user.$inferInsert
export type UpdateUserModel = typeof user.$inferInsert

export type RoleModel = typeof roles.$inferSelect
export type AddRoleModel = typeof roles.$inferInsert
export type UpdateRoleModel = typeof roles.$inferInsert

export type UserRoleModel = typeof userRoles.$inferSelect
export type AddUserRoleModel = typeof userRoles.$inferInsert
export type RoleEnumModel = (typeof roleEnum.enumValues)[number]
