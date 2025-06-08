import {notFound} from 'next/navigation'

import {
  getOrganizationBySlugDal,
  getOrganizationMembersDal,
} from '@/app/dal/organization-dal'
import {TeamPageContent} from '@/components/features/team/team-page-content'

interface TeamPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TeamPage({params}: TeamPageProps) {
  const {slug} = await params

  // Récupérer l'organisation par slug
  const organization = await getOrganizationBySlugDal(slug)

  if (!organization) {
    notFound()
  }

  // Récupérer les membres de l'organisation
  let members: Awaited<ReturnType<typeof getOrganizationMembersDal>> = []
  try {
    members = await getOrganizationMembersDal(organization.id)
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error)
    // Continuer sans afficher les membres si l'utilisateur n'a pas les permissions
  }

  return <TeamPageContent organization={organization} members={members} />
}
