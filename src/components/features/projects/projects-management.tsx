'use client'

import {formatDistanceToNow} from 'date-fns'
import {fr} from 'date-fns/locale'
import {Edit, Folder} from 'lucide-react'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {toast} from 'sonner'

import {
  deleteProjectAction,
  updateProjectAction,
} from '@/app/(app)/projects/actions'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {Project} from '@/services/types/domain/project-types'

import {DeleteProjectDialog} from './delete-project-dialog'
import {EditProjectDialog} from './edit-project-dialog'
import {ProjectsPagination} from './projects-pagination'
import {ProjectsToolbar} from './projects-toolbar'

interface Props {
  initialProjects: Project[]
  currentPage: number
  pageSize: number
  totalProjects: number
  permissions: {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canManage: boolean
  }
  searchQuery: string
}

export default function ProjectsManagement({
  initialProjects,
  currentPage,
  pageSize,
  totalProjects,
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

  return (
    <Card className="border-0 sm:border">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Gestion des projets</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <ProjectsToolbar
          onSearch={handleSearch}
          initialSearch={searchQuery}
          totalProjects={totalProjects}
          onPerPageChange={handlePerPageChange}
          perPage={pageSize.toString()}
          canCreate={permissions.canCreate}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead className="hidden md:table-cell">
                Organisation
              </TableHead>
              <TableHead className="hidden xl:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden lg:table-cell">Créé</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarFallback>
                      <Folder className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-muted-foreground text-sm md:hidden">
                      {project.description || 'Aucune description'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{project.organizationId}</Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="truncate">
                    {project.description || 'Aucune description'}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {project.createdAt &&
                    formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Gérer</span>
                      </Link>
                    </Button>
                    {permissions.canEdit && (
                      <EditProjectDialog
                        project={project}
                        onSave={async (id, data) => {
                          const formData = new FormData()
                          formData.append('name', data.name)
                          if (data.description) {
                            formData.append('description', data.description)
                          }

                          const result = await updateProjectAction(
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
                      <div className="hidden sm:block">
                        <DeleteProjectDialog
                          projectId={project.id}
                          projectName={project.name}
                          onDelete={async (id) => {
                            const result = await deleteProjectAction(id)

                            if (result.success) {
                              toast.success(result.message)
                            } else {
                              toast.error(result.message)
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ProjectsPagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalProjects / pageSize)}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  )
}
