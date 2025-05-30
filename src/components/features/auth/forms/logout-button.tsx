'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {Button} from '@/components/ui/button'

import {logoutAction} from '../../../../app/(auth)/action'

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
