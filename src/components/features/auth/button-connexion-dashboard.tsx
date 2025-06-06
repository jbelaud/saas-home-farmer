import Link from 'next/link'

import {Button} from '@/components/ui/button'
import {getAuthUser} from '@/services/authentication/auth-service'

export default async function ButtonConnexionDashboard() {
  const user = await getAuthUser()
  if (user) {
    return (
      <Button asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    )
  }
  return (
    <Button asChild>
      <Link href="/login">Connexion</Link>
    </Button>
  )
}
