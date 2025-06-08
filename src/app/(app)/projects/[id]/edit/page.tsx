import {notFound} from 'next/navigation'
import {Suspense} from 'react'

import {getProjectPermissions} from '@/app/dal/project-dal'
import {EditProjectForm} from '@/components/features/projects/edit-project-form'
import {getProjectByIdService} from '@/services/facades/project-service-facade'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{id: string}>
}) {
  const {id} = await params
  const project = await getProjectByIdService(id)
  const {canEdit} = await getProjectPermissions(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto">
        <h1 className="mb-8 text-2xl font-bold">Modifier le projet</h1>
        <EditProjectForm project={project} canEdit={canEdit} />
      </div>
      <div className="mx-auto mt-12">
        <h2 className="mb-4 text-xl font-semibold">Tâches du projet</h2>
        <Suspense fallback={<div>Chargement des tâches...</div>}>
          <div className="text-muted-foreground text-sm">
            Gestion des tâches à venir...
          </div>
        </Suspense>
      </div>
    </div>
  )
}
