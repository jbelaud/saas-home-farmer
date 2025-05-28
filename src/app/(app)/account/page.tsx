import {notFound} from 'next/navigation'

import {getAuthUser} from '@/services/authentication/auth-utils'

import {EditUserProfileForm} from './edit-user-profile'

export default async function Page() {
  const user = await getAuthUser()

  if (!user) {
    notFound()
  }
  console.log(user)
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mon Compte</h2>
      </div>

      <div>
        <EditUserProfileForm user={user}></EditUserProfileForm>
      </div>
    </div>
  )
}
