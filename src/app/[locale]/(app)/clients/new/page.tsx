import {ArrowLeft} from 'lucide-react'
import Link from 'next/link'

import withAuth from '@/components/features/auth/with-auth'
import {ClientForm} from '@/components/features/clients/client-form'
import {Button} from '@/components/ui/button'

function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Nouveau client</h1>
          <p className="text-stone-500">
            Renseignez les informations de votre client et de son potager.
          </p>
        </div>
      </div>

      <ClientForm />
    </div>
  )
}

export default withAuth(Page)
