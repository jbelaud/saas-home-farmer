import {notFound} from 'next/navigation'

import {EditUserProfileForm} from '@/components/features/user/edit-user-profile'
import {EditUserSettingsForm} from '@/components/features/user/edit-user-settings'
import {TwoFactorSection} from '@/components/features/user/two-factor-section'
import {getAuthUser} from '@/services/authentication/auth-service'

export default async function Page() {
  const user = await getAuthUser()

  if (!user) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mon Compte</h2>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-medium">Profil</h3>
          <EditUserProfileForm user={user} />
        </div>

        <div className="rounded-lg border p-6">
          <TwoFactorSection user={user} />
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-medium">Paramètres</h3>
          <EditUserSettingsForm user={user} />
        </div>
      </div>
    </div>
  )
}
