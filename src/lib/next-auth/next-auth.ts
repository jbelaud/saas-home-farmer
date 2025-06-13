import NextAuth from 'next-auth'

import {authConfig} from './next-auth-config'

export const {
  auth,
  signIn,
  signOut,
  handlers: {GET, POST},
} = NextAuth({
  ...authConfig,
})
