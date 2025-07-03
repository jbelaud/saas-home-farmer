'use client'

import {useRouter} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {useState} from 'react'

//import {logoutAction} from '@/app/[locale]/(auth)/action'
import {Button} from '@/components/ui/button'
import {authClient} from '@/lib/better-auth/auth-client'

export default function LogoutButton() {
  const t = useTranslations('Auth.LogoutForm')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setPending(true)
    // await logoutAction()
    await authClient.signOut()
    setPending(false)
    router.push('/login/')
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
      {pending ? t('loggingOut') : t('logoutButton')}
    </Button>
  )
}
