import {
  getAuthUser,
  hasRequiredRole,
} from '@/services/authentication/auth-utils'
import {RoleEnum, User} from '@/services/types/domain/user-types'
import {redirect} from 'next/navigation'
import React from 'react'

export type WithAuthProps = {
  user: User
}
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithAuthProps>,
  requiredRole?: RoleEnum
) => {
  return async function WithAuth(props: P) {
    const authUser = await getAuthUser()
    const hasRole = hasRequiredRole(
      authUser?.user,
      requiredRole ?? RoleEnum.USER
    )

    if (!authUser) {
      redirect('/login')
    }
    if (!hasRole) {
      redirect('/restricted')
    }

    return <WrappedComponent {...props} user={authUser.user} />
  }
}

export default withAuth

export const withAuthAdmin = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithAuthProps>
) => withAuth(WrappedComponent, RoleEnum.ADMIN)
