import {Metadata} from 'next'
import React from 'react'

import {AppBreadcrumb} from '@/components/features/app-breadcrumb'
import {withAuthAdmin} from '@/components/features/auth/with-auth'
import {AdminSidebar} from '@/components/features/layouts/sidebar/admin-sidebar'
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
    <SidebarProvider>
      <AdminSidebar user={user} />
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
            <div className="mx-auto w-full max-w-7xl px-1 py-4 md:px-4">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default withAuthAdmin(AppLayout)
