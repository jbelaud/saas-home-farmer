import {
  getAllProjectsWithPaginationDal,
  getProjectAdminPermissionsDal,
} from '@/app/dal/project-dal'
import ProjectsManagement from '@/components/features/projects/projects-management'

type SearchParamsType = Promise<{
  page?: string
  limit?: string
  search?: string
}>

export default async function ProjectsContent({
  searchParams,
}: {
  searchParams: SearchParamsType
}) {
  const searchStore = await searchParams
  const page = searchStore.page ? Number.parseInt(searchStore.page) : 1
  const limit = searchStore.limit ? Number.parseInt(searchStore.limit) : 20
  const search = searchStore.search || ''
  const offset = (page - 1) * limit

  const [projects, permissions] = await Promise.all([
    getAllProjectsWithPaginationDal({limit, offset}, search),
    getProjectAdminPermissionsDal(),
  ])

  return (
    <ProjectsManagement
      initialProjects={projects.data}
      currentPage={page}
      pageSize={limit}
      totalProjects={projects.pagination.rowCount}
      permissions={permissions}
      searchQuery={search}
    />
  )
}
