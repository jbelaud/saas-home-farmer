import {relations, sql} from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import type {AdapterAccount} from 'next-auth/adapters'

import {userOrganizations} from './organization-model'

export const roleEnum = pgEnum('role_type', [
  'public',
  'user',
  'redactor',
  'moderator',
  'admin',
  'super_admin',
])
export const userVisibilityEnum = pgEnum('user_visibility', [
  'public',
  'private',
])

//uuid_generate_v4() : CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
export const users = pgTable('user', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', {mode: 'date'}),
  createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
  updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
  image: text('image'),
  password: text('password'),
  visibility: userVisibilityEnum('visibility').default('private').notNull(),
})

// Nouvelle table pour les rôles
export const roles = pgTable('role', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),
  name: roleEnum('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
  updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
})

// Table de liaison pour la relation many-to-many entre users et roles
export const userRoles = pgTable(
  'user_role',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    roleId: uuid('roleId')
      .notNull()
      .references(() => roles.id, {onDelete: 'cascade'}),
    assignedAt: timestamp('assignedAt', {mode: 'date'}).defaultNow(),
    assignedBy: uuid('assignedBy').references(() => users.id),
  },
  (userRole) => ({
    compoundKey: primaryKey({
      columns: [userRole.userId, userRole.roleId],
    }),
  })
)

export const accounts = pgTable(
  'account',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId').references(() => users.id, {onDelete: 'cascade'}),
  expires: timestamp('expires', {mode: 'date'}).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', {mode: 'date'}).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({columns: [vt.identifier, vt.token]}),
  })
)

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: uuid('userId').references(() => users.id, {onDelete: 'cascade'}),

    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

export const usersRelations = relations(users, ({one, many}) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
  userRoles: many(userRoles, {
    relationName: 'userToRoles',
  }),
  assignedRoles: many(userRoles, {
    relationName: 'assignedBy',
  }),
  userOrganizations: many(userOrganizations, {
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
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
    relationName: 'userToRoles',
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
    relationName: 'roleToUsers',
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
    relationName: 'assignedBy',
  }),
}))

export type UserModel = typeof users.$inferSelect
export type AddUserModel = typeof users.$inferInsert
export type UpdateUserModel = typeof users.$inferInsert

export type RoleModel = typeof roles.$inferSelect
export type AddRoleModel = typeof roles.$inferInsert
export type UpdateRoleModel = typeof roles.$inferInsert

export type UserRoleModel = typeof userRoles.$inferSelect
export type AddUserRoleModel = typeof userRoles.$inferInsert
export type RoleEnumModel = (typeof roleEnum.enumValues)[number]
