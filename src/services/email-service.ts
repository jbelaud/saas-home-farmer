import {getTranslations} from 'next-intl/server'
import {
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
  Resend,
} from 'resend'

import EmailChangeEmailVerification from '@/lib/emails/email-change-email-verification'
import InvitationOrganizationLinkMail from '@/lib/emails/invitation-organization-link-email'
import MagicLinkMail from '@/lib/emails/magic-link-email'
import OtpEmail from '@/lib/emails/otp-email'
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
  const t = await getTranslations('email.user.organizationInvitation')

  await sendEmailService({
    to: email,
    subject: t('subject', {teamName}),
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    text: `${t('invitationMessage', {
      invitedByUsername,
      invitedByEmail,
      teamName,
    })} ${t('acceptInvitation')} ${inviteLink}`,
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
  const t = await getTranslations('email.user.verify')
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: t('subject'),
    from: fromEmail,
    text: t('preview'),
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
  const t = await getTranslations('email.user.verification')
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: t('subject'),
    from: fromEmail,
    text: t('preview'),
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
  const t = await getTranslations('email.user.resetPassword')
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: t('subject'),
    from: fromEmail,
    text: t('preview'),
    react: ResetPasswordEmail({url}),
  })
}

export const sendOTPEmailService = async ({
  email,
  otp,
  otpLink,
}: {
  email: string
  otp: string
  otpLink?: string
}) => {
  const t = await getTranslations('email.user.otp')
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: t('subject'),
    from: fromEmail,
    text: `${t('description')} ${otp}${otpLink ? `\n\n${t('verifyAutomatically')} : ${otpLink}` : ''}`,
    react: OtpEmail({otp, otpLink}),
  })
}

export const sendEmailChangeEmailVerificationService = async ({
  email,
  url,
}: {
  email: string
  url: string
}) => {
  const t = await getTranslations('email.user.emailChange')
  const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  await sendEmailService({
    to: email,
    subject: t('subject'),
    from: fromEmail,
    text: t('preview'),
    react: EmailChangeEmailVerification({url}),
  })
}
