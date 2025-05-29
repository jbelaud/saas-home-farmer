import {forbidden, redirect} from 'next/navigation'
import React from 'react'

import {
  getAuthUser,
  hasRequiredRole,
} from '@/services/authentication/auth-utils'
import {RoleEnum} from '@/services/types/domain/auth-types'
import {User, UserRoles} from '@/services/types/domain/user-types'

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
      authUser,
      requiredRole ? (requiredRole as UserRoles) : 'user'
    )

    if (!authUser) {
      redirect('/login')
    }
    if (!hasRole) {
      forbidden()
    }

    return <WrappedComponent {...props} user={authUser} />
  }
}

export default withAuth

export const withAuthAdmin = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithAuthProps>
) => withAuth(WrappedComponent, RoleEnum.ADMIN)
