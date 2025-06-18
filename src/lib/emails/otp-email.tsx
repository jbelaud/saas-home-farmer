import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import {Fragment} from 'react'

OtpEmail.PreviewProps = {
  otp: '123456',
  otpLink: 'https://example.com/verify-request/otp?code=123456',
} as OtpEmailProps

type OtpEmailProps = {
  otp: string
  otpLink?: string
}

export default function OtpEmail({otp, otpLink}: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>Votre code de vérification à deux facteurs</Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              <Text className="text-2xl font-bold text-black">
                Code de vérification
              </Text>
              <Section className="my-4">
                <Text className="text-base">
                  Voici votre code de vérification à deux facteurs :
                </Text>
                <Text className="mt-4 text-center text-3xl font-bold tracking-widest text-sky-500">
                  {otp}
                </Text>
                <Text className="mt-4 text-base text-gray-500">
                  Ce code expirera dans 5 minutes.
                </Text>
                {otpLink && (
                  <Section className="my-6 text-center">
                    <Button
                      className="rounded-md bg-sky-500 px-6 py-3 font-medium text-white"
                      href={otpLink}
                    >
                      Vérifier automatiquement
                    </Button>
                    <Text className="mt-2 text-sm text-gray-500">
                      Ou copiez le code ci-dessus dans l&apos;application
                    </Text>
                  </Section>
                )}
                <Text className="mt-2 text-base text-gray-500">
                  Si vous n&apos;avez pas demandé ce code, vous pouvez ignorer
                  cet email en toute sécurité.
                </Text>
              </Section>
              <Text className="text-base leading-6 text-gray-500">
                SaaS Mike Codeur Stripe Boilerplate
              </Text>
            </Container>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  )
}
