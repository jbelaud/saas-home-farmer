import {
  adminClient,
  magicLinkClient,
  organizationClient,
  twoFactorClient,
} from 'better-auth/client/plugins'
import {createAuthClient} from 'better-auth/react'

export const AuthClientAppConfig = {
  requireEmailVerification:
    process.env.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION === 'true',
  skipVerificationOnEnable:
    process.env.NEXT_PUBLIC_BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE ===
    'true',
  enable2FA: process.env.NEXT_PUBLIC_BETTER_AUTH_2FA_ENABLE === 'true',
  enableTokenManagement:
    process.env.NEXT_PUBLIC_BETTER_AUTH_TOKEN_MANAGEMENT === 'true',
  changePassword:
    process.env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_PASSWORD === 'true',
  changeEmail: process.env.NEXT_PUBLIC_BETTER_AUTH_CHANGE_EMAIL === 'true',
} as const

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    adminClient(),
    organizationClient(),
    magicLinkClient(),
    twoFactorClient(),
  ],
})
