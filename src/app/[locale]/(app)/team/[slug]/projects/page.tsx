import {Metadata} from 'next'
import {Suspense} from 'react'

import {ProjectsManagementSkeleton} from '@/components/features/projects/projects-skeleton'

import ProjectsContent from './projects-content'

export const metadata: Metadata = {
  title: 'Projets',
  description: 'Gestion des projets',
}

type SearchParamsType = Promise<{
  page?: string
  limit?: string
  search?: string
}>

interface ProjectsPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: SearchParamsType
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const searchStore = await searchParams
  const suspenseKey = `page=${searchStore.page || '1'}-limit=${searchStore.limit || '20'}-search=${searchStore.search || ''}`

  return (
    <div className="bg-background">
      <Suspense key={suspenseKey} fallback={<ProjectsManagementSkeleton />}>
        <ProjectsContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
