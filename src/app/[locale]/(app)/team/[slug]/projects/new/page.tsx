import {Metadata} from 'next'
import {forbidden, notFound} from 'next/navigation'

import {getOrganizationBySlugDal} from '@/app/dal/organization-dal'
import {CreateProjectForm} from '@/components/features/projects/create-project-form'
import {LimitReached} from '@/components/features/subscription/limit-reached'
import {
  canCreateProject,
  checkProjectCreationLimit,
} from '@/services/authorization/project-authorization'

export const metadata: Metadata = {
  title: 'Nouveau projet',
  description: 'Créer un nouveau projet',
}

interface NewProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function NewProjectPage({params}: NewProjectPageProps) {
  const {slug} = await params

  const limits = await checkProjectCreationLimit()
  if (!limits.allowed) {
    return <LimitReached limits={limits} />
  }

  if (!limits) {
    notFound()
  }

  // Récupérer l'organisation par slug
  const organization = await getOrganizationBySlugDal(slug)
  if (!organization) {
    notFound()
  }

  // Vérifier les permissions pour créer un projet dans cette organisation
  const canCreate = await canCreateProject(organization.id)
  if (!canCreate) {
    forbidden()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">Créer un nouveau projet</h1>
        <CreateProjectForm
          organization={organization}
          organizationSlug={slug}
        />
      </div>
    </div>
  )
}
