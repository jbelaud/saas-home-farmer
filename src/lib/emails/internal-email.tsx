import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from '@react-email/components'

import React, {Fragment} from 'react'

type InternalEmailProps = {
  preview: string
  content: string | React.ReactNode
}
export default function InternalEmail({preview, content}: InternalEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Fragment>
          <Preview>{preview}</Preview>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-8">
              {content}
            </Container>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  )
}
