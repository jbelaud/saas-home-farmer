// src/app/api/projects/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server'

import {withApiAuth} from '@/lib/api-auth'
import {
  deleteProjectService,
  getProjectByIdService,
  updateProjectService,
} from '@/services/facades/project-service-facade'
import {UpdateProject} from '@/services/types/domain/project-types'
import {updateProjectServiceSchema} from '@/services/validation/project-validation'

// GET - Récupérer un projet par ID
export const GET = withApiAuth(async (request: NextRequest, user, context) => {
  try {
    const projectId = context?.params?.id
    if (!projectId) {
      return NextResponse.json({error: 'ID du projet manquant'}, {status: 400})
    }

    const project = await getProjectByIdService(projectId)

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Erreur GET /api/projects/[id]:', error)
    return NextResponse.json({error: 'Projet non trouvé'}, {status: 404})
  }
})

// PUT - Mettre à jour un projet
export const PUT = withApiAuth(async (request: NextRequest, user, context) => {
  try {
    const projectId = context?.params?.id
    if (!projectId) {
      return NextResponse.json({error: 'ID du projet manquant'}, {status: 400})
    }

    const body = await request.json()

    // Validation des données
    const validation = updateProjectServiceSchema.safeParse({
      ...body,
      id: projectId,
    })
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.errors,
        },
        {status: 400}
      )
    }

    const projectData: UpdateProject = validation.data

    const updatedProject = await updateProjectService(projectData)

    return NextResponse.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: updatedProject,
    })
  } catch (error) {
    console.error('Erreur PUT /api/projects/[id]:', error)
    return NextResponse.json(
      {error: 'Erreur lors de la mise à jour du projet'},
      {status: 500}
    )
  }
})

// DELETE - Supprimer un projet
export const DELETE = withApiAuth(
  async (request: NextRequest, user, context) => {
    try {
      const projectId = context?.params?.id
      if (!projectId) {
        return NextResponse.json(
          {error: 'ID du projet manquant'},
          {status: 400}
        )
      }

      await deleteProjectService(projectId)

      return NextResponse.json({
        success: true,
        message: 'Projet supprimé avec succès',
      })
    } catch (error) {
      console.error('Erreur DELETE /api/projects/[id]:', error)
      return NextResponse.json(
        {error: 'Erreur lors de la suppression du projet'},
        {status: 500}
      )
    }
  }
)
