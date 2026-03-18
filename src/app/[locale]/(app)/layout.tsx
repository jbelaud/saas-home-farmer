import {Metadata} from 'next'
import {headers} from 'next/headers'
import React from 'react'

import AuthProvider from '@/components/context/auth-provider'
import {OrganizationProvider} from '@/components/context/organization-provider'
import {AppBreadcrumb} from '@/components/features/app-breadcrumb'
import withAuth from '@/components/features/auth/with-auth'
import {AppSidebar} from '@/components/features/layouts/sidebar/app-sidebar'
import {QuickFeedbackButton} from '@/components/features/quick-feedback-button'
import {FarmerMobileNav} from '@/components/layouts/farmer-mobile-nav'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {auth} from '@/lib/better-auth/auth'
import {APP_NAME} from '@/lib/constants'
import {
  getAuthUser,
  getSessionAuth,
} from '@/services/authentication/auth-service'

export const metadata: Metadata = {
  title: `Espace utilisateur ${APP_NAME}`,
  description: "Page d'espace utilisateur",
}

async function AppLayout({children}: {children: React.ReactNode}) {
  const user = await getAuthUser()
  const sessionAuth = await getSessionAuth()

  let organizationId = sessionAuth?.session?.activeOrganizationId

  // Si pas d'org active (ex: refresh après magic link), activer la première org silencieusement
  if (!organizationId && user?.organizations?.length) {
    const firstOrg = user.organizations[0]?.organization
    if (firstOrg?.id) {
      organizationId = firstOrg.id
      // Fire-and-forget : activer l'org sans bloquer le render
      const requestHeaders = await headers()
      auth.api
        .setActiveOrganization({
          headers: requestHeaders,
          body: {organizationId: firstOrg.id},
        })
        .catch(() => {})
    }
  }

  const activeOrganization = user?.organizations?.find(
    (org) => org.organization?.id === organizationId
  )?.organization

  return (
    <AuthProvider initialUser={user} initialSession={sessionAuth?.session}>
      <OrganizationProvider initialOrganization={activeOrganization}>
        <SidebarProvider>
          {/* Desktop sidebar — hidden on mobile */}
          <div className="hidden md:contents">
            <AppSidebar />
          </div>
          <SidebarInset>
            <div className="flex min-h-screen flex-col bg-stone-50">
              {/* Desktop header — hidden on mobile */}
              <div className="hidden md:block">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-14 items-center gap-2">
                    <SidebarTrigger />
                    <AppBreadcrumb />
                    <div className="ml-auto">
                      <QuickFeedbackButton />
                    </div>
                  </div>
                </div>
              </div>
              <main className="flex-1 pb-24 md:pb-8">{children}</main>
            </div>
          </SidebarInset>
        </SidebarProvider>
        {/* Mobile bottom nav */}
        <FarmerMobileNav />
      </OrganizationProvider>
    </AuthProvider>
  )
}

export default withAuth(AppLayout)
