import {
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
  Resend,
} from 'resend'

import InvitationOrganizationLinkMail from '@/lib/emails/invitation-organization-link-email'
import MagicLinkMail from '@/lib/emails/magic-link-email'
import ResetPasswordEmail from '@/lib/emails/reset-password-email'
import VerificationEmail from '@/lib/emails/verification-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendSimpleEmailService = async ({
  to,
  subject,
  text,
}: {
  to: string
  subject: string
  text: string
}) => {
  await sendEmailService({
    to,
    subject,
    text,
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
  })
}

export const sendEmailService = async (
  payload: CreateEmailOptions,
  options?: CreateEmailRequestOptions
) => {
  if (process.env.NODE_ENV === 'development') {
    payload.subject = `[DEV] ${payload.subject}`
  }

  const {error} = await resend.emails.send(
    {
      ...payload,
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    },
    options
  )

  if (error) {
    console.error(error)
    throw error
  }
}

interface SendOrganizationInvitationParams {
  email: string
  invitedByUsername: string
  invitedByEmail: string
  teamName: string
  inviteLink: string
}

export const sendOrganizationInvitation = async ({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: SendOrganizationInvitationParams) => {
  await sendEmailService({
    to: email,
    subject: `Invitation à rejoindre ${teamName}`,
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    text: `${invitedByUsername} (${invitedByEmail}) vous invite à rejoindre l'organisation ${teamName}. Pour accepter cette invitation, veuillez cliquer sur le lien suivant : ${inviteLink}`,
    react: InvitationOrganizationLinkMail({
      invitedByUsername,
      invitedByEmail,
      teamName,
      inviteLink,
    }),
  })
}

export const sendMagicLinkEmailService = async ({
  email,
  url,
}: {
  email: string
  url: string
}) => {
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
  // const linkUrl = `${url}?token=${token}`
  // console.log('linkUrl', linkUrl)
  await sendEmailService({
    to: email,
    subject: 'Connexion au SaaS Mike Codeur Stripe',
    from: fromEmail,
    text: 'Connexion au SaaS Mike Codeur Stripe',
    react: MagicLinkMail({url}),
  })
}

export const sendVerificationEmailService = async ({
  email,
  url,
}: {
  email: string
  url: string
}) => {
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: 'Vérification de votre adresse email',
    from: fromEmail,
    text: 'Vérification de votre adresse email',
    react: VerificationEmail({url}),
  })
}

export const sendResetPasswordLinkEmailService = async ({
  email,
  url,
}: {
  email: string
  url: string
}) => {
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    from: fromEmail,
    text: 'Réinitialisation de votre mot de passe',
    react: ResetPasswordEmail({url}),
  })
}
