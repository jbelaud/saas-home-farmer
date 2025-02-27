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
import {relations, sql} from 'drizzle-orm'

import type {AdapterAccount} from 'next-auth/adapters'

export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'public'])
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
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', {mode: 'date'}),
  createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
  updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
  image: text('image'),
  role: userRoleEnum('role').default('user').notNull(),
  password: text('password'),
  visibility: userVisibilityEnum('visibility').default('private').notNull(),
})

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
export const usersRelations = relations(users, ({one}) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
  // finances: many(finance),
}))

export type UserModel = typeof users.$inferSelect
export type AddUserModel = typeof users.$inferInsert
export type UpdateUserModel = typeof users.$inferSelect
