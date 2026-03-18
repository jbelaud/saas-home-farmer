import {Plus, Users} from 'lucide-react'
import Link from 'next/link'

import withAuth from '@/components/features/auth/with-auth'
import {ClientList} from '@/components/features/clients/client-list'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {getGardenClientsByOrganizationService} from '@/services/facades/garden-client-service-facade'

async function Page() {
  const result = await getGardenClientsByOrganizationService({
    limit: 50,
    offset: 0,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mes clients</h1>
          <p className="text-stone-500">
            Gérez vos fiches clients et leurs jardins.
          </p>
        </div>
        <Button className="h-12" asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Link>
        </Button>
      </div>

      {result.data.length > 0 ? (
        <ClientList clients={result.data} />
      ) : (
        <Card className="border-dashed border-stone-300 bg-stone-50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-stone-300" />
            <p className="font-semibold text-stone-500">
              Aucun client pour l&apos;instant
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Cliquez sur &quot;Nouveau client&quot; pour ajouter votre premier
              client.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(Page)
