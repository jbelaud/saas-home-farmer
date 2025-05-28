import {Metadata} from 'next'
import React from 'react'

import {AppSidebar} from '@/components/app-sidebar'
import withAuth from '@/components/features/auth/withAuth'
import {Separator} from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {getAuthUser} from '@/services/authentication/auth-utils'

export const metadata: Metadata = {
  title: 'App',
  description: "Page d'app",
}

async function AppLayout({children}: {children: React.ReactNode}) {
  const user = await getAuthUser()

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* <AdminBreadcrumb /> */}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default withAuth(AppLayout)
