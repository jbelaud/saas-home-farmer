import {relations, sql} from 'drizzle-orm'
import {
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import {users} from './user-model'

// Enum pour les rôles organisationnels
export const organizationRoleEnum = pgEnum('organization_role', [
  'OWNER',
  'ADMIN',
  'MEMBER',
])

// Table des organisations
export const organizations = pgTable('organization', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
  updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
})

// Table de liaison many-to-many entre users et organizations
export const userOrganizations = pgTable(
  'user_organization',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organizations.id, {onDelete: 'cascade'}),
    role: organizationRoleEnum('role').default('MEMBER').notNull(),
    joinedAt: timestamp('joinedAt', {mode: 'date'}).defaultNow(),
  },
  (userOrganization) => ({
    compoundKey: primaryKey({
      columns: [userOrganization.userId, userOrganization.organizationId],
    }),
  })
)

// Relations pour organizations
export const organizationsRelations = relations(organizations, ({many}) => ({
  userOrganizations: many(userOrganizations, {
    relationName: 'organizationToUsers',
  }),
}))

// Relations pour userOrganizations
export const userOrganizationsRelations = relations(
  userOrganizations,
  ({one}) => ({
    user: one(users, {
      fields: [userOrganizations.userId],
      references: [users.id],
      relationName: 'userToOrganizations',
    }),
    organization: one(organizations, {
      fields: [userOrganizations.organizationId],
      references: [organizations.id],
      relationName: 'organizationToUsers',
    }),
  })
)

// Types TypeScript
export type OrganizationModel = typeof organizations.$inferSelect
export type AddOrganizationModel = typeof organizations.$inferInsert
export type UpdateOrganizationModel = typeof organizations.$inferInsert

export type UserOrganizationModel = typeof userOrganizations.$inferSelect
export type AddUserOrganizationModel = typeof userOrganizations.$inferInsert

export type OrganizationRoleEnumModel =
  (typeof organizationRoleEnum.enumValues)[number]
