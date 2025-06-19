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

EmailChangeEmailVerification.PreviewProps = {
  url: 'https://example.com/verify-email-change?token=123',
} as EmailChangeEmailVerificationProps

type EmailChangeEmailVerificationProps = {
  url: string
}

export default function EmailChangeEmailVerification({
  url,
}: EmailChangeEmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>
            Vérifiez votre nouvelle adresse email pour confirmer le changement
          </Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              <Text className="text-2xl font-bold text-black">
                Vérification du changement d&apos;email
              </Text>
              <Section className="my-4">
                <Text className="text-base">
                  Vous avez demandé à changer votre adresse email. Pour
                  confirmer ce changement, veuillez cliquer sur le lien
                  ci-dessous :
                </Text>
                <Text className="text-base">
                  <Link
                    className="text-sky-500 hover:cursor-pointer hover:underline"
                    href={url}
                  >
                    Confirmer le changement d&apos;email
                  </Link>
                </Text>
                <Text className="mt-4 text-base text-gray-500">
                  Ce lien expirera dans 24 heures.
                </Text>
                <Text className="mt-2 text-base text-gray-500">
                  Si vous n&apos;avez pas demandé ce changement, vous pouvez
                  ignorer cet email en toute sécurité.
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
