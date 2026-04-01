import {ArrowLeft, CalendarPlus} from 'lucide-react'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import withAuth from '@/components/features/auth/with-auth'
import {ClientForm} from '@/components/features/clients/client-form'
import {ShareClientPortalLink} from '@/components/features/clients/share-client-portal-link'
import {Button} from '@/components/ui/button'
import {getGardenClientByIdService} from '@/services/facades/garden-client-service-facade'

async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const client = await getGardenClientByIdService(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-stone-500">Modifier la fiche client</p>
          </div>
        </div>
        <Button
          asChild
          className="h-12 gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Link href={`/tournees/new?clientId=${client.id}`}>
            <CalendarPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Planifier une tournée</span>
          </Link>
        </Button>
      </div>

      <ShareClientPortalLink
        accessToken={client.accessToken}
        clientFirstName={client.firstName}
      />

      <ClientForm client={client} />
    </div>
  )
}

export default withAuth(Page)
