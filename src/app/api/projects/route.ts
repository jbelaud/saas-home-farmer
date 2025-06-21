import {NextRequest, NextResponse} from 'next/server'

import {withApiAuth, withApiUserAuth} from '@/lib/api-auth'
import {
  createProjectService,
  deleteProjectService,
  getProjectsWithPaginationService,
  updateProjectService,
} from '@/services/facades/project-service-facade'
import {RoleConst} from '@/services/types/domain/auth-types'
import {
  CreateProject,
  UpdateProject,
} from '@/services/types/domain/project-types'
import {
  createProjectServiceSchema,
  updateProjectServiceSchema,
} from '@/services/validation/project-validation'

// GET - Récupérer les projets avec pagination
export const GET = withApiAuth(async (request: NextRequest, authUser) => {
  try {
    const {searchParams} = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const organizationId = searchParams.get('organizationId') || undefined

    const offset = (page - 1) * limit

    const result = await getProjectsWithPaginationService(
      {limit, offset},
      {
        ...(search && {name: search}),
        ...(organizationId && {organizationId}),
        ...(!organizationId && {createdBy: authUser?.id}),
      }
    )

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Erreur GET /api/projects:', error)
    return NextResponse.json(
      {error: 'Erreur lors de la récupération des projets'},
      {status: 500}
    )
  }
}, RoleConst.USER)

// POST - Créer un nouveau projet
export const POST = withApiUserAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json()

    // Validation des données
    const validation = createProjectServiceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.errors,
        },
        {status: 400}
      )
    }

    const projectData: CreateProject = {
      ...validation.data,
      createdBy: authUser?.id, // Ajouter l'utilisateur connecté
    }

    const newProject = await createProjectService(projectData)

    return NextResponse.json(
      {
        success: true,
        message: 'Projet créé avec succès',
        data: newProject,
      },
      {status: 201}
    )
  } catch (error) {
    console.error('Erreur POST /api/projects:', error)
    return NextResponse.json(
      {error: 'Erreur lors de la création du projet'},
      {status: 500}
    )
  }
})

// PUT - Mettre à jour un projet
export const PUT = withApiUserAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    // Validation des données
    const validation = updateProjectServiceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.errors,
        },
        {status: 400}
      )
    }

    // Vérifier que l'ID est fourni
    if (!validation.data.id) {
      return NextResponse.json({error: 'ID du projet requis'}, {status: 400})
    }

    const projectData: UpdateProject = {
      ...validation.data,
      updatedAt: new Date(), // Mettre à jour la date de modification
    }

    const updatedProject = await updateProjectService(projectData)

    return NextResponse.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: updatedProject,
    })
  } catch (error) {
    console.error('Erreur PUT /api/projects:', error)
    return NextResponse.json(
      {error: 'Erreur lors de la mise à jour du projet'},
      {status: 500}
    )
  }
})

// DELETE - Supprimer un projet
export const DELETE = withApiUserAuth(async (request: NextRequest) => {
  try {
    const {searchParams} = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json({error: 'ID du projet requis'}, {status: 400})
    }

    await deleteProjectService(projectId)

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur DELETE /api/projects:', error)
    return NextResponse.json(
      {error: 'Erreur lors de la suppression du projet'},
      {status: 500}
    )
  }
})
