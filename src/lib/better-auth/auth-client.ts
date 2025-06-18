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
} as const

console.log(
  'AuthClientAppConfig',
  process.env.BETTER_AUTH_2FA_SKIP_VERIFICATION_ON_ENABLE
)

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    adminClient(),
    organizationClient(),
    magicLinkClient(),
    twoFactorClient(),
  ],
})
