import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import {Fragment} from 'react'

ResetPasswordEmail.PreviewProps = {
  url: 'https://example.com/reset-password?token=123',
} as ResetPasswordMailProps

type ResetPasswordMailProps = {
  url: string
}

export default function ResetPasswordEmail({url}: ResetPasswordMailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>Réinitialisation de votre mot de passe</Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              <Text className="text-2xl font-bold text-black">
                Réinitialisation de mot de passe
              </Text>
              <Section className="my-4">
                <Text className="text-base">
                  Vous avez demandé la réinitialisation de votre mot de passe.
                  Pour créer un nouveau mot de passe, veuillez cliquer sur le
                  lien ci-dessous :
                </Text>
                <Text className="text-base">
                  <Link
                    className="text-sky-500 hover:cursor-pointer hover:underline"
                    href={url}
                  >
                    Réinitialiser mon mot de passe
                  </Link>
                </Text>
                <Text className="mt-4 text-base text-gray-500">
                  Ce lien expirera dans 1 heure pour des raisons de sécurité.
                </Text>
                <Text className="mt-2 text-base text-gray-500">
                  Si vous n&apos;avez pas demandé cette réinitialisation,
                  veuillez ignorer cet email ou contacter le support si vous
                  pensez qu&apos;il s&apos;agit d&apos;une erreur.
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
