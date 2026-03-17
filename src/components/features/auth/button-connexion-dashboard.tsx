import Link from 'next/link'

import {Button} from '@/components/ui/button'
import {getAuthUser} from '@/services/authentication/auth-service'

export default async function ButtonConnexionDashboard() {
  const user = await getAuthUser()
  if (user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">Mon tableau de bord</Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="ghost" size="sm">
      <Link href="/login">Connexion</Link>
    </Button>
  )
}
