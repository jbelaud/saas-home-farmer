import {notFound} from 'next/navigation'

import {getUserByIdDal, getUserPermissionsDal} from '@/app/dal/user-dal'
import UserDetailForm from '@/components/features/admin/users/user-detail-form'

interface UserDetailContentProps {
  userId: string
}

export default async function UserDetailContent({
  userId,
}: UserDetailContentProps) {
  const [user, permissions] = await Promise.all([
    getUserByIdDal(userId),
    getUserPermissionsDal(),
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold">
          Détails de l&apos;utilisateur
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualisez et modifiez les informations de l&apos;utilisateur{' '}
          {user.name}
        </p>
      </div>

      <UserDetailForm user={user} permissions={permissions} />
    </div>
  )
}
