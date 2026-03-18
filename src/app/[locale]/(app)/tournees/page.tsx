import {CalendarDays, Plus} from 'lucide-react'
import Link from 'next/link'

import withAuth from '@/components/features/auth/with-auth'
import {InterventionList} from '@/components/features/interventions/intervention-list'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {getInterventionsByOrganizationService} from '@/services/facades/intervention-service-facade'

async function Page() {
  const result = await getInterventionsByOrganizationService({
    limit: 50,
    offset: 0,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tournées</h1>
          <p className="text-stone-500">
            Planifiez et suivez vos interventions chez vos clients.
          </p>
        </div>
        <Button className="h-12" asChild>
          <Link href="/tournees/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle intervention
          </Link>
        </Button>
      </div>

      {result.data.length > 0 ? (
        <InterventionList interventions={result.data} />
      ) : (
        <Card className="border-dashed border-stone-300 bg-stone-50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-stone-300" />
            <p className="font-semibold text-stone-500">
              Aucune intervention planifiée
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Cliquez sur &quot;Nouvelle intervention&quot; pour planifier votre
              première visite.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(Page)
