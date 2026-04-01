import {ArrowLeft} from 'lucide-react'
import Link from 'next/link'

import withAuth from '@/components/features/auth/with-auth'
import {InterventionForm} from '@/components/features/interventions/intervention-form'
import {Button} from '@/components/ui/button'
import {getGardenClientsByOrganizationService} from '@/services/facades/garden-client-service-facade'

async function Page({
  searchParams,
}: {
  searchParams: Promise<{clientId?: string}>
}) {
  const {clientId} = await searchParams

  const clientsResult = await getGardenClientsByOrganizationService({
    limit: 200,
    offset: 0,
  })

  const clientOptions = clientsResult.data.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tournees">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Nouvelle intervention
          </h1>
          <p className="text-stone-500">Planifiez une visite chez un client.</p>
        </div>
      </div>

      <InterventionForm clients={clientOptions} defaultClientId={clientId} />
    </div>
  )
}

export default withAuth(Page)
