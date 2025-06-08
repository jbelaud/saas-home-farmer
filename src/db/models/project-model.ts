import {relations, sql} from 'drizzle-orm'
import {pgEnum, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core'

import {organizations} from './organization-model'
import {users} from './user-model'

// Enum pour le statut des tâches
export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in_progress',
  'done',
])

// Table des projets
export const projects = pgTable('project', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, {onDelete: 'cascade'}),
  createdBy: uuid('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
  updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
})

// Table des tâches
export const tasks = pgTable('task', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo').notNull(),
  dueDate: timestamp('due_date', {mode: 'date'}),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, {onDelete: 'cascade'}),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, {onDelete: 'cascade'}),
  createdBy: uuid('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('createdat', {mode: 'date'}).defaultNow(),
  updatedAt: timestamp('updatedat', {mode: 'date'}).defaultNow(),
})

// Relations pour projects
export const projectsRelations = relations(projects, ({one, many}) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  tasks: many(tasks),
}))

// Relations pour tasks
export const tasksRelations = relations(tasks, ({one}) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}))

// Types TypeScript
export type ProjectModel = typeof projects.$inferSelect
export type AddProjectModel = typeof projects.$inferInsert
export type UpdateProjectModel = typeof projects.$inferInsert

export type TaskModel = typeof tasks.$inferSelect
export type AddTaskModel = typeof tasks.$inferInsert
export type UpdateTaskModel = typeof tasks.$inferInsert

export type TaskStatusEnumModel = (typeof taskStatusEnum.enumValues)[number]
