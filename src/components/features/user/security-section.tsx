import {AuthClientAppConfig} from '@/lib/better-auth/auth-client'
import {User} from '@/services/types/domain/user-types'

import {ChangeEmailForm} from './change-email-form'
import {ChangePasswordForm} from './change-password-form'
import {TwoFactorForm} from './two-factor-form'

export function UserSecurityFactorSection({user}: {user: User}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sécurité</h3>
        <p className="text-muted-foreground text-sm">
          Gérez les paramètres de sécurité de votre compte, y compris
          l&apos;authentification à deux facteurs, le changement de mot de passe
          et d&apos;email.
        </p>
      </div>

      {/* Section changement d'email */}
      <div className="rounded-lg border">
        <div className="p-6">
          <ChangeEmailForm user={user} />
        </div>
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
