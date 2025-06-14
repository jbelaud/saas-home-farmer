import {
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
  Resend,
} from 'resend'

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
      // from: params[0].from ?? process.env.EMAIL_FROM,
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
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
    subject: `Invitation à rejoindre ${teamName}`,
    to: email,
    html: `
      <p>Bonjour,</p>
      <p>${invitedByUsername} (${invitedByEmail}) vous invite à rejoindre l'organisation ${teamName}.</p>
      <p>Pour accepter cette invitation, veuillez cliquer sur le lien suivant :</p>
      <p><a href="${inviteLink}">Accepter l'invitation</a></p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe ${teamName}</p>
    `,
    from: '',
  })
}
