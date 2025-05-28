import {redirect} from 'next/navigation'

import {getAuthUser} from '@/services/authentication/auth-utils'

import Logout from './logout-form'

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
