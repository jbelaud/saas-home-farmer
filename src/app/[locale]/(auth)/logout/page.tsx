import {redirect} from 'next/navigation'

import Logout from '@/components/features/auth/forms/logout-form'
import {getAuthUser} from '@/services/authentication/auth-service'

async function Page() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login')
  }
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Logout />
    </div>
  )
}

export default Page
