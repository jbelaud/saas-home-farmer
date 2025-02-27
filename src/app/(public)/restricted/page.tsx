import {NotAutorized} from '@/components/not-autorized'
import {Metadata} from 'next/types'

export const metadata: Metadata = {
  title: 'Restricted Area',
  description: 'Page Restricted',
}

type SearchParams = Promise<{[key: string]: string | string[] | undefined}>

export default async function Page(props: {searchParams: SearchParams}) {
  const searchParams = await props.searchParams
  const role = searchParams.role
  return <NotAutorized role={role as string} />
}
