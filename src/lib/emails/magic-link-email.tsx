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

MagicLinkMail.PreviewProps = {
  url: 'test 2',
} as MagicLinkMailProps

type MagicLinkMailProps = {
  url: string
}
export default function MagicLinkMail({url}: MagicLinkMailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>
            Vous avez demander un lien magique pour connecter votre compte.
          </Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              <Text className="text-2xl font-bold text-black">Connexion</Text>
              <Section className="my-4">
                <Text className="text-base">
                  <Link
                    className="text-sky-500 hover:cursor-pointer hover:underline"
                    href={url}
                  >
                    Cliquez ici pour vous connectez
                  </Link>
                </Text>
                <Text className="text-base text-gray-500">
                  Si vous avez pas demandé ce lien, veuillez ignorer cet email.
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
