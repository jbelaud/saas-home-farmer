'use client'

import {formatDistanceToNow} from 'date-fns'
import {fr} from 'date-fns/locale'
import {Building2} from 'lucide-react'
import {useRouter, useSearchParams} from 'next/navigation'
import {toast} from 'sonner'

import {
  deleteOrganizationAction,
  updateOrganizationAction,
} from '@/app/admin/organizations/actions'
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
import {Organization} from '@/services/types/domain/organization-types'

import {DeleteOrganizationDialog} from './delete-organization-dialog'
import {EditOrganizationDialog} from './edit-organization-dialog'
import {OrganizationsPagination} from './organizations-pagination'
import {OrganizationsToolbar} from './organizations-toolbar'

interface Props {
  initialOrganizations: Organization[]
  currentPage: number
  pageSize: number
  totalOrganizations: number
  permissions: {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canManage: boolean
  }
  searchQuery: string
}

export default function OrganizationsManagement({
  initialOrganizations,
  currentPage,
  pageSize,
  totalOrganizations,
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

  const getOrganizationInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des organisations</CardTitle>
      </CardHeader>
      <CardContent>
        <OrganizationsToolbar
          onSearch={handleSearch}
          initialSearch={searchQuery}
          totalOrganizations={totalOrganizations}
          onPerPageChange={handlePerPageChange}
          perPage={pageSize.toString()}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden lg:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell">Créée</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialOrganizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={organization.image || ''}
                      alt={organization.name}
                    />
                    <AvatarFallback>
                      {organization.image ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        getOrganizationInitials(organization.name)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{organization.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {organization.slug}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{organization.slug}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="max-w-xs truncate">
                    {organization.description || 'Aucune description'}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                  {organization.createdAt &&
                    formatDistanceToNow(new Date(organization.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {permissions.canEdit && (
                      <EditOrganizationDialog
                        organization={organization}
                        onSave={async (id, data) => {
                          const formData = new FormData()
                          formData.append('name', data.name)
                          formData.append('slug', data.slug)
                          if (data.description) {
                            formData.append('description', data.description)
                          }

                          const result = await updateOrganizationAction(
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
                      <DeleteOrganizationDialog
                        organizationId={organization.id}
                        organizationName={organization.name}
                        onDelete={async (id) => {
                          const result = await deleteOrganizationAction(id)

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

        <OrganizationsPagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalOrganizations / pageSize)}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  )
}
