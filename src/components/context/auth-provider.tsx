'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {SessionProvider} from 'next-auth/react'
import {PropsWithChildren} from 'react'

export default function NextAuthProvider({children}: PropsWithChildren) {
  //return <SessionProvider>{children}</SessionProvider>
  return <>{children}</>
}
