import {getUserByEmailDao} from '@/db/repositories/user-repository'
import {auth} from '@/lib/auth'

export const getAuthUser = async () => {
  const session = await auth()
  if (!session?.user?.email) return
  const email = session?.user?.email ?? ''
  const user = await getUserByEmailDao(email)
  return user
}

export const getSessionAuth = async () => {
  const session = await auth()
  return session
}

export const isAuthAdmin = async () => {
  const authUser = await getAuthUser()
  return authUser?.roles?.includes('admin')
}

export const getAuthUserId = async () => {
  const user = await getAuthUser()
  if (!user) return
  return user.id
}
