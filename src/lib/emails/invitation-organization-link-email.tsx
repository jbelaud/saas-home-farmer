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

export type InvitationOrganizationLinkMailProps = {
  invitedByUsername: string
  invitedByEmail: string
  teamName: string
  inviteLink: string
}

export default function InvitationOrganizationLinkMail({
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: InvitationOrganizationLinkMailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>
            {invitedByUsername} vous invite à rejoindre {teamName}
          </Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              <Text className="text-2xl font-bold text-black">
                Invitation d&apos;Organisation
              </Text>
              <Section className="my-4">
                <Text className="text-base">Bonjour,</Text>
                <Text className="text-base">
                  {invitedByUsername} ({invitedByEmail}) vous invite à rejoindre
                  l&apos;organisation {teamName}.
                </Text>
                <Text className="text-base">
                  Pour accepter cette invitation, veuillez cliquer sur le lien
                  suivant :
                </Text>
                <Text className="text-base">
                  <Link
                    className="text-sky-500 hover:cursor-pointer hover:underline"
                    href={inviteLink}
                  >
                    Accepter l&apos;invitation
                  </Link>
                </Text>
                <Text className="text-base text-gray-500">
                  Ce lien expirera dans 24 heures.
                </Text>
                <Text className="text-base text-gray-500">
                  Si vous n&apos;êtes pas à l&apos;origine de cette demande,
                  vous pouvez ignorer cet email.
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
