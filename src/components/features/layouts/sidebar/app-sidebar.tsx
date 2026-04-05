'use client'

import {
  CalendarDays,
  LayoutDashboard,
  Leaf,
  Settings2,
  Users,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import * as React from 'react'

import {useAuth} from '@/components/context/auth-provider'
import {useOrganization} from '@/components/context/organization-provider'
import {NavAdmin} from '@/components/features/layouts/sidebar/nav-admin'
import {NavUser} from '@/components/features/layouts/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {PagesConst} from '@/env'
import {isPageEnabled} from '@/lib/utils'
import {isAdmin} from '@/services/authentication/auth-util'

const NAV_ITEMS = [
  {
    title: 'Tableau de bord',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mes clients',
    url: '/clients',
    icon: Users,
  },
  {
    title: 'Tournées',
    url: '/tournees',
    icon: CalendarDays,
  },
  {
    title: 'Finances',
    url: '/dashboard/finances',
    icon: Wallet,
  },
]

const ADMIN_NAV = [
  {
    title: 'Administration',
    url: '/admin',
    icon: Settings2,
    isActive: false,
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const {currentOrganization} = useOrganization()
  const {user} = useAuth()
  const pathname = usePathname()

  const isAdminUser = React.useMemo(() => isAdmin(user) ?? false, [user])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">MyHomeFarmer</span>
                  <span className="truncate text-xs text-stone-500">
                    {currentOrganization?.name ?? 'Mon activité'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isAdminUser && isPageEnabled(PagesConst.ADMIN) && (
          <NavAdmin adminItems={ADMIN_NAV} />
        )}
        <SidebarMenu className="px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.url === '/dashboard'
                ? pathname?.endsWith('/dashboard')
                : pathname?.includes(item.url)
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user || undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
