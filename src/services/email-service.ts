import {
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
  Resend,
} from 'resend'

import InvitationOrganizationLinkMail from '@/lib/emails/invitation-organization-link-email'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export const EmailService = {
  sendEmail: sendEmailService,
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
