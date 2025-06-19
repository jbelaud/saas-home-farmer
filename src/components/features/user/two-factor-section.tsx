import {AuthClientAppConfig} from '@/lib/better-auth/auth-client'
import {User} from '@/services/types/domain/user-types'

import {ChangePasswordForm} from './change-password-form'
import {TwoFactorForm} from './two-factor-form'

export function TwoFactorSection({user}: {user: User}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sécurité</h3>
        <p className="text-muted-foreground text-sm">
          Gérez les paramètres de sécurité de votre compte, y compris
          l&apos;authentification à deux facteurs et le changement de mot de
          passe.
        </p>
      </div>

      {/* Section changement de mot de passe */}
      <div className="rounded-lg border">
        <div className="p-6">
          <ChangePasswordForm />
        </div>
      </div>

      {/* Section authentification à deux facteurs */}
      {AuthClientAppConfig.enable2FA && (
        <div className="rounded-lg border">
          <div className="p-6">
            <TwoFactorForm user={user} />
          </div>
        </div>
      )}
    </div>
  )
}
