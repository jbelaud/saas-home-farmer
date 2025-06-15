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

VerificationEmail.PreviewProps = {
  url: 'https://example.com/verify-email?token=123',
} as VerificationMailProps

type VerificationMailProps = {
  url: string
}

export default function VerificationEmail({url}: VerificationMailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>
            Vérifiez votre adresse email pour activer votre compte
          </Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              <Text className="text-2xl font-bold text-black">
                Vérification de votre email
              </Text>
              <Section className="my-4">
                <Text className="text-base">
                  Merci de vous être inscrit ! Pour activer votre compte,
                  veuillez cliquer sur le lien ci-dessous :
                </Text>
                <Text className="text-base">
                  <Link
                    className="text-sky-500 hover:cursor-pointer hover:underline"
                    href={url}
                  >
                    Vérifier mon adresse email
                  </Link>
                </Text>
                <Text className="mt-4 text-base text-gray-500">
                  Ce lien expirera dans 24 heures.
                </Text>
                <Text className="mt-2 text-base text-gray-500">
                  Si vous n&apos;avez pas créé de compte, vous pouvez ignorer
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
