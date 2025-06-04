import {notFound} from 'next/navigation'

import {EditOrganizationForm} from '@/components/features/organization/edit-organization-form'
import {getOrganizationByIdService} from '@/services/facades/organization-service-facade'

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{id: string}>
}) {
  const {id} = await params
  const organization = await getOrganizationByIdService(id)

  if (!organization) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">
          Modifier l&apos;organisation
        </h1>
        <EditOrganizationForm organization={organization} />
      </div>
    </div>
  )
}
