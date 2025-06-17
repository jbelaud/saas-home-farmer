import {User} from '@/services/types/domain/user-types'

import {TwoFactorForm} from './two-factor-form'

export function TwoFactorSection({user}: {user: User}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sécurité</h3>
        <p className="text-muted-foreground text-sm">
          Gérez les paramètres de sécurité de votre compte, y compris
          l&apos;authentification à deux facteurs.
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="p-6">
          <TwoFactorForm user={user} />
        </div>
      </div>
    </div>
  )
}
