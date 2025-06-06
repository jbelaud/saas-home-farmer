'use client'

import {formatDistanceToNow} from 'date-fns'
import {fr} from 'date-fns/locale'
import {useRouter, useSearchParams} from 'next/navigation'
import {toast} from 'sonner'

import {deleteUserAction, updateUserAction} from '@/app/admin/users/actions'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {User} from '@/services/types/domain/user-types'

import {DeleteUserDialog} from './delete-user-dialog'
import {EditUserDialog} from './edit-user-dialog'
import {UsersPagination} from './users-pagination'
import {UsersToolbar} from './users-toolbar'

interface Props {
  initialUsers: User[]
  currentPage: number
  pageSize: number
  totalUsers: number
  permissions: {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canManage: boolean
  }
  searchQuery: string
}

export default function UsersManagement({
  initialUsers,
  currentPage,
  pageSize,
  totalUsers,
  permissions,
  searchQuery,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', search)
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  const handlePerPageChange = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', limit)
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const getUserRoleDisplay = (roles?: string[]) => {
    if (!roles || roles.length === 0) return 'Public'
    const primaryRole = roles.includes('admin')
      ? 'Admin'
      : roles.includes('moderator')
        ? 'Modérateur'
        : roles.includes('user')
          ? 'Utilisateur'
          : 'Public'
    return primaryRole
  }

  const getUserStatusDisplay = (user: User) => {
    const isVerified = user.emailVerified
    return isVerified ? 'Actif' : 'En attente'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des utilisateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <UsersToolbar
          onSearch={handleSearch}
          initialSearch={searchQuery}
          totalUsers={totalUsers}
          onPerPageChange={handlePerPageChange}
          perPage={pageSize.toString()}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user.image || ''} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {user.visibility === 'public' ? 'Public' : 'Privé'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getUserRoleDisplay(user.roles)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      getUserStatusDisplay(user) === 'Actif'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {getUserStatusDisplay(user)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(user.createdAt!), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {permissions.canEdit && (
                      <EditUserDialog
                        user={user}
                        onSave={async (id, data) => {
                          const formData = new FormData()
                          formData.append('name', data.name)
                          formData.append('email', data.email)
                          formData.append('visibility', data.visibility)

                          const result = await updateUserAction(
                            id,
                            undefined,
                            formData
                          )

                          if (result.success) {
                            toast.success(result.message)
                          } else {
                            toast.error(result.message)
                          }
                        }}
                      />
                    )}
                    {permissions.canDelete && (
                      <DeleteUserDialog
                        userId={user.id}
                        userName={user.name}
                        onDelete={async (id) => {
                          const result = await deleteUserAction(id)

                          if (result.success) {
                            toast.success(result.message)
                          } else {
                            toast.error(result.message)
                          }
                        }}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <UsersPagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalUsers / pageSize)}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  )
}
