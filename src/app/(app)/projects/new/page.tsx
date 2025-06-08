import {Metadata} from 'next'

import {CreateProjectForm} from '@/components/features/projects/create-project-form'
import {getOrganizationsByUserIdService} from '@/services/facades/organization-service-facade'

export const metadata: Metadata = {
  title: 'Nouveau projet',
  description: 'Créer un nouveau projet',
}

export default async function NewProjectPage() {
  const organizations = await getOrganizationsByUserIdService()

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">Créer un nouveau projet</h1>
        <CreateProjectForm organizations={organizations} />
      </div>
    </div>
  )
}
