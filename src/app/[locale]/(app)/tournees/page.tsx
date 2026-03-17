import {CalendarDays, Plus} from 'lucide-react'

import withAuth from '@/components/features/auth/with-auth'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'

function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tournées</h1>
          <p className="text-stone-500">
            Planifiez et suivez vos interventions chez vos clients.
          </p>
        </div>
        <Button className="h-12" disabled>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tournée
        </Button>
      </div>

      <Card className="border-dashed border-stone-300 bg-stone-50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="mb-3 h-10 w-10 text-stone-300" />
          <p className="font-semibold text-stone-500">
            Aucune tournée planifiée
          </p>
          <p className="mt-1 text-sm text-stone-400">
            La gestion des tournées et interventions arrive bientôt.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(Page)
