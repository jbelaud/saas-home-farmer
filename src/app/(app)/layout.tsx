import {Metadata} from 'next'
import React from 'react'

import {AppSidebar} from '@/components/app-sidebar'
import {OrganizationProvider} from '@/components/context/organizarion-provider'
import {AppBreadcrumb} from '@/components/features/app-breadcrumb'
import withAuth from '@/components/features/auth/with-auth'
import {Separator} from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {getAuthUser} from '@/services/authentication/auth-service'

export const metadata: Metadata = {
  title: 'App',
  description: "Page d'app",
}

async function AppLayout({children}: {children: React.ReactNode}) {
  const user = await getAuthUser()

  return (
    <OrganizationProvider initialUser={user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <AppBreadcrumb />
              </div>
            </header>
            <main className="flex-1">
              <div className="mx-auto w-full max-w-7xl px-4 py-4">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OrganizationProvider>
  )
}

export default withAuth(AppLayout)
