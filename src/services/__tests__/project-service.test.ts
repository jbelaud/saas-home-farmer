import {faker} from '@faker-js/faker'
import {beforeEach, describe, expect, it, vi} from 'vitest'

// Mock des DAOs avant l'import
vi.mock('@/db/repositories/project-repository')

import {
  createProjectDao,
  createTaskDao,
  deleteProjectByIdDao,
  deleteTaskByIdDao,
  getProjectByIdDao,
  getProjectsByOrganizationIdDao,
  getTaskByIdDao,
  getTasksByProjectIdDao,
  updateProjectByIdDao,
  updateTaskByIdDao,
} from '@/db/repositories/project-repository'

import {AuthorizationError} from '../errors/authorization-error'
import {
  createProjectService,
  createTaskService,
  deleteProjectService,
  getProjectByIdService,
  getTaskByIdService,
  updateProjectService,
} from '../project-service'
import {UserOrganizationRoleConst} from '../types/domain/auth-types'
import {
  CreateProject,
  CreateTask,
  Project,
  Task,
  UpdateProject,
} from '../types/domain/project-types'
import {setupAuthUserMocked} from './helper-service-test'
import {userTest, userTestAdmin} from './service-test-data'

describe('[ADMIN] CRUD : Project Service', () => {
  const organizationId = faker.string.uuid()
  const projectId = faker.string.uuid()
  const taskId = faker.string.uuid()

  const projectData: Project = {
    id: projectId,
    name: 'Test Project',
    description: 'Description du projet',
    organizationId,
    createdBy: userTestAdmin.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const taskData: Task = {
    id: taskId,
    title: 'Test Task',
    description: 'Description de la tâche',
    status: 'todo',
    dueDate: new Date(),
    projectId,
    organizationId,
    createdBy: userTestAdmin.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    setupAuthUserMocked(userTestAdmin)
    vi.clearAllMocks()

    vi.mocked(createProjectDao).mockResolvedValue(projectData)
    vi.mocked(getProjectByIdDao).mockResolvedValue(projectData)
    vi.mocked(updateProjectByIdDao).mockResolvedValue()
    vi.mocked(deleteProjectByIdDao).mockResolvedValue()
    vi.mocked(getProjectsByOrganizationIdDao).mockResolvedValue([projectData])

    vi.mocked(createTaskDao).mockResolvedValue(taskData)
    vi.mocked(getTaskByIdDao).mockResolvedValue(taskData)
    vi.mocked(updateTaskByIdDao).mockResolvedValue()
    vi.mocked(deleteTaskByIdDao).mockResolvedValue()
    vi.mocked(getTasksByProjectIdDao).mockResolvedValue([taskData])
  })

  it('should create a new project', async () => {
    const createData: CreateProject = {
      name: 'Test Project',
      description: 'Description du projet',
      organizationId,
      createdBy: userTestAdmin.id,
    }

    const result = await createProjectService(createData)

    expect(result).toEqual(projectData)
    expect(createProjectDao).toHaveBeenCalledWith(createData)
  })

  it('should get a project by id', async () => {
    const result = await getProjectByIdService(projectId)

    expect(result).toEqual(projectData)
    expect(getProjectByIdDao).toHaveBeenCalledWith(projectId)
  })

  it('should update a project', async () => {
    const updateData: UpdateProject = {
      id: projectId,
      name: 'Updated Project',
    }

    const result = await updateProjectService(updateData)

    expect(result).toEqual(projectData)
    expect(updateProjectByIdDao).toHaveBeenCalled()
  })

  it('should delete a project', async () => {
    await deleteProjectService(projectId)

    expect(deleteProjectByIdDao).toHaveBeenCalledWith(projectId)
  })

  it('should create a new task', async () => {
    const createData: CreateTask = {
      title: 'Test Task',
      description: 'Description de la tâche',
      status: 'todo',
      dueDate: new Date(),
      projectId,
      organizationId,
      createdBy: userTestAdmin.id,
    }

    const result = await createTaskService(createData)

    expect(result).toEqual(taskData)
    expect(createTaskDao).toHaveBeenCalledWith(createData)
  })

  it('should get a task by id', async () => {
    const result = await getTaskByIdService(taskId)

    expect(result).toEqual(taskData)
    expect(getTaskByIdDao).toHaveBeenCalledWith(taskId)
  })
})

describe('[USER] CRUD : Project Service', () => {
  const organizationId = faker.string.uuid()
  const projectId = faker.string.uuid()

  const projectData: Project = {
    id: projectId,
    name: 'Test Project',
    description: 'Description du projet',
    organizationId,
    createdBy: userTest.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    const userMember = {
      ...userTest,
      organizations: [
        {
          userId: userTest.id,
          organizationId,
          role: UserOrganizationRoleConst.MEMBER,
          joinedAt: new Date(),
        },
      ],
    }
    setupAuthUserMocked(userMember)
    vi.clearAllMocks()

    vi.mocked(getProjectByIdDao).mockResolvedValue(projectData)
  })

  it('should NOT create a project as member', async () => {
    const createData: CreateProject = {
      name: 'Test Project',
      organizationId,
    }

    await expect(createProjectService(createData)).rejects.toThrow(
      AuthorizationError
    )
    expect(createProjectDao).not.toHaveBeenCalled()
  })

  it('should read project as member', async () => {
    const result = await getProjectByIdService(projectId)

    expect(result).toEqual(projectData)
    expect(getProjectByIdDao).toHaveBeenCalledWith(projectId)
  })

  it('should NOT update project as member', async () => {
    const updateData: UpdateProject = {
      id: projectId,
      name: 'Updated Project',
    }

    await expect(updateProjectService(updateData)).rejects.toThrow(
      AuthorizationError
    )
    expect(updateProjectByIdDao).not.toHaveBeenCalled()
  })
})

describe('[PUBLIC] Project Service', () => {
  const projectId = faker.string.uuid()
  const organizationId = faker.string.uuid()

  beforeEach(() => {
    setupAuthUserMocked(undefined)
    vi.clearAllMocks()
  })

  it('should NOT access projects as public user', async () => {
    await expect(getProjectByIdService(projectId)).rejects.toThrow(
      AuthorizationError
    )
    expect(getProjectByIdDao).not.toHaveBeenCalled()
  })

  it('should NOT create projects as public user', async () => {
    const createData: CreateProject = {
      name: 'Test Project',
      organizationId,
    }

    await expect(createProjectService(createData)).rejects.toThrow(
      AuthorizationError
    )
    expect(createProjectDao).not.toHaveBeenCalled()
  })
})
