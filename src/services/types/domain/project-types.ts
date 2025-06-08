import {OrganizationModel} from '@/db/models/organization-model'
import {
  AddProjectModel,
  AddTaskModel,
  ProjectModel,
  TaskModel,
  TaskStatusEnumModel,
  UpdateProjectModel,
  UpdateTaskModel,
} from '@/db/models/project-model'
import {UserModel} from '@/db/models/user-model'

// ===== TYPES DE DOMAINE DÉCOUPLÉS =====

// Types de domaine découplés des types Drizzle
export type Project = ProjectModel
export type Task = TaskModel
export type TaskStatus = TaskStatusEnumModel

// ===== TYPES POUR LES OPÉRATIONS =====

// Types pour les opérations de création
export type CreateProject = Pick<
  AddProjectModel,
  'name' | 'description' | 'organizationId' | 'createdBy'
>
export type CreateTask = Pick<
  AddTaskModel,
  | 'title'
  | 'description'
  | 'status'
  | 'dueDate'
  | 'projectId'
  | 'organizationId'
  | 'createdBy'
>

// Types pour les opérations de mise à jour
export type UpdateProject = {
  id: string
} & Partial<Omit<UpdateProjectModel, 'id'>>

export type UpdateTask = {
  id: string
} & Partial<Omit<UpdateTaskModel, 'id'>>

// ===== DTO POUR LA PRÉSENTATION =====

// DTO = Data Transfer Object pour la présentation
export type ProjectDTO = {
  id: string
  name: string
  description?: string | null
  organizationId: string
  createdBy?: string | null
  createdAt?: Date | null
  updatedAt?: Date | null
}

export type TaskDTO = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  dueDate?: Date | null
  projectId: string
  organizationId: string
  createdBy?: string | null
  createdAt?: Date | null
  updatedAt?: Date | null
}

// ===== TYPES POUR LES RELATIONS =====

// Types avec relations complètes (utile pour les queries Drizzle)
export type ProjectData = ProjectModel & {
  organization?: OrganizationModel
  createdBy?: UserModel
  tasks?: TaskModel[]
}

export type TaskData = TaskModel & {
  project?: ProjectModel
  organization?: OrganizationModel
  createdBy?: UserModel
}

// ===== TYPES POUR LES FILTRES ET REQUÊTES =====

export type ProjectFilters = {
  organizationId?: string
  createdBy?: string
  name?: string
}

export type TaskFilters = {
  organizationId?: string
  projectId?: string
  createdBy?: string
  status?: TaskStatus
  title?: string
}
