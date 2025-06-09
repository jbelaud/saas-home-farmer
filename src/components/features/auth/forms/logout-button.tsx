'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {logoutAction} from '@/app/[locale]/(auth)/action'
import {Button} from '@/components/ui/button'

export default function LogoutButton() {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setPending(true)
    await logoutAction()
    setPending(false)
    router.push('/login/')
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
      Logout
    </Button>
  )
}
