import {getAuthUser} from '@/services/authentication/auth-utils'
import {redirect} from 'next/navigation'
import Logout from './logout-form'

async function Page() {
  const authUser = await getAuthUser()
  if (!authUser) {
    redirect('/login')
  }
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Logout />
    </div>
  )
}

export default Page
