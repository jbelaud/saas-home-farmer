import {forbidden, notFound} from 'next/navigation'

import {
  getOrganizationBySlugDal,
  getOrganizationMembersDal,
  OrganizationMemberDTO,
} from '@/app/dal/organization-dal'
import {TeamPageContent} from '@/components/features/team/team-page-content'
import {
  canReadOrganization,
  canReadOrganizationMember,
} from '@/services/authorization/organization-authorization'

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
  const canRead = await canReadOrganization(organization.id)
  console.log('canRead', canRead)
  if (!canRead) {
    forbidden()
  }
  // Vérifier les permissions pour lire les membres
  const canReadMembers = await canReadOrganizationMember(organization.id)

  // Récupérer les membres de l'organisation
  let members: OrganizationMemberDTO[] = []
  if (canReadMembers) {
    members = await getOrganizationMembersDal(organization.id)
  }

  return <TeamPageContent organization={organization} members={members} />
}
