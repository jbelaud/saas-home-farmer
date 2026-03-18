import {ArrowLeft} from 'lucide-react'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import withAuth from '@/components/features/auth/with-auth'
import {InterventionForm} from '@/components/features/interventions/intervention-form'
import {Button} from '@/components/ui/button'
import {getGardenClientsByOrganizationService} from '@/services/facades/garden-client-service-facade'
import {getInterventionByIdService} from '@/services/facades/intervention-service-facade'

async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const intervention = await getInterventionByIdService(id)

  if (!intervention) {
    notFound()
  }

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
            Modifier l&apos;intervention
          </h1>
          <p className="text-stone-500">Mettre à jour les détails</p>
        </div>
      </div>

      <InterventionForm
        intervention={{
          id: intervention.id,
          gardenClientId: intervention.gardenClientId,
          scheduledDate: intervention.scheduledDate,
          durationMinutes: intervention.durationMinutes,
          type: intervention.type,
          proNotes: intervention.proNotes,
        }}
        clients={clientOptions}
      />
    </div>
  )
}

export default withAuth(Page)
