import {
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
  Resend,
} from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (
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
  sendEmail,
}
