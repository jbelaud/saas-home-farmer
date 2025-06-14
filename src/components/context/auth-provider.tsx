'use client'

import {PropsWithChildren} from 'react'

//import {authClient} from '@/lib/better-auth/auth-client'

export default function NextAuthProvider({children}: PropsWithChildren) {
  // // const {data: session, error} = await authClient.getSession()
  // const {
  //   data: session,
  //   isPending, //loading state
  //   error, //error object
  //   refetch, //refetch the session
  // } = authClient.useSession()
  // console.log('session', session)
  // console.log('error', error)
  // console.log('isPending', isPending)
  // console.log('refetch', refetch)
  //return <SessionProvider>{children}</SessionProvider>
  return <>{children}</>
}
