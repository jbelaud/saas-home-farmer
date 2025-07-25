import {useTranslations} from 'next-intl'

import {AuthClientAppConfig} from '@/lib/better-auth/auth-client'
import {User} from '@/services/types/domain/user-types'

import {ChangeEmailForm} from './change-email-form'
import {ChangePasswordForm} from './change-password-form'
import {ListTokensSection} from './list-tokens-section'
import {TwoFactorForm} from './two-factor-form'

export function UserSecurityFactorSection({user}: {user: User}) {
  const t = useTranslations('AccountPage')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('security.title')}</h3>
        <p className="text-muted-foreground text-sm">
          {t('security.description')}
        </p>
      </div>

      {/* Section changement d'email */}
      {AuthClientAppConfig.changeEmail && (
        <div className="rounded-lg border">
          <div className="p-6">
            <ChangeEmailForm user={user} />
          </div>
        </div>
      )}

      {/* Section changement de mot de passe */}
      {AuthClientAppConfig.changePassword && (
        <div className="rounded-lg border">
          <div className="p-6">
            <ChangePasswordForm />
          </div>
        </div>
      )}

      {/* Section authentification à deux facteurs */}
      {AuthClientAppConfig.enable2FA && (
        <div className="rounded-lg border">
          <div className="p-6">
            <TwoFactorForm user={user} />
          </div>
        </div>
      )}
      {/* Section gestion des sessions/tokens */}
      {AuthClientAppConfig.enableTokenManagement && <ListTokensSection />}
    </div>
  )
}
