'use client'

import {LogOut} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {logoutAction} from '@/app/[locale]/(auth)/action'
import {Button} from '@/components/ui/button'

export function LogoutButton() {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setPending(true)
    await logoutAction()
    router.push('/login/')
    setPending(false)
  }

  return (
    <Button
      variant="outline"
      className="h-12 w-full border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
      onClick={handleClick}
      disabled={pending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {pending ? 'Déconnexion...' : 'Se déconnecter'}
    </Button>
  )
}
