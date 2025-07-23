'use client'

import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react'
import {useTranslations} from 'next-intl'
import * as React from 'react'

import {useAuth} from '@/components/context/auth-provider'
import {useOrganization} from '@/components/context/organization-provider'
import {NavAdmin} from '@/components/features/layouts/sidebar/nav-admin'
import {NavMain} from '@/components/features/layouts/sidebar/nav-main'
import {NavProjects} from '@/components/features/layouts/sidebar/nav-projects'
import {NavUser} from '@/components/features/layouts/sidebar/nav-user'
import {TeamSwitcher} from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import {buildMenu, MenuData} from '@/lib/helper/menu-helper'
import {isAdmin} from '@/services/authentication/auth-util'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('AppSidebar')
  const {organizations, currentOrganization} = useOrganization()
  const {user} = useAuth()

  // États dérivés avec mémorisation
  const isAdminUser = React.useMemo(() => isAdmin(user) ?? false, [user])
  const currentOrgSlug = React.useMemo(
    () => currentOrganization?.slug || 'default',
    [currentOrganization]
  )

  // Génération du menu avec traductions
  const translatedMenuData: MenuData = React.useMemo(
    () => ({
      adminNavMain: [
        {
          title: t('admin.title'),
          url: '/admin',
          icon: Settings2,
          isActive: false,
        },
      ],
      navMain: [
        {
          title: t('account.title'),
          url: '#',
          icon: SquareTerminal,
          isActive: false,
          items: [
            {
              title: t('account.accountAndSecurity'),
              url: '/account',
            },
            {
              title: t('account.settings'),
              url: '/account/settings',
            },
            {
              title: t('account.apiKeys'),
              url: '/account/api-keys',
            },
            {
              title: t('account.subscriptions'),
              url: '/account/subscription',
            },
            {
              title: t('account.organizations'),
              url: '/organizations',
            },
            {
              title: t('account.invitations'),
              url: '/invitations',
            },
          ],
        },
        {
          title: t('projects.title'),
          url: '#',
          icon: SquareTerminal,
          isActive: true,
          items: [
            {
              title: t('projects.dashboard'),
              url: '/dashboard',
            },
            {
              title: t('projects.projects'),
              url: '/team/{{orgSlug}}/projects',
            },
          ],
        },
        {
          title: t('models.title'),
          url: '#',
          icon: Bot,
          items: [
            {
              title: t('models.genesis'),
              url: '#',
            },
            {
              title: t('models.explorer'),
              url: '#',
            },
            {
              title: t('models.quantum'),
              url: '#',
            },
          ],
        },
        {
          title: t('documentation.title'),
          url: '#',
          icon: BookOpen,
          items: [
            {
              title: t('documentation.introduction'),
              url: '#',
            },
            {
              title: t('documentation.getStarted'),
              url: '#',
            },
            {
              title: t('documentation.tutorials'),
              url: '#',
            },
            {
              title: t('documentation.changelog'),
              url: '#',
            },
          ],
        },
      ],
      projects: [
        {
          name: t('projectsList.designEngineering'),
          url: '#',
          icon: Frame,
        },
        {
          name: t('projectsList.salesMarketing'),
          url: '#',
          icon: PieChart,
        },
        {
          name: t('projectsList.travel'),
          url: '#',
          icon: Map,
        },
      ],
    }),
    [t]
  )

  // Construction dynamique du menu avec mémorisation
  const menuItems = React.useMemo(
    () => buildMenu(translatedMenuData, currentOrgSlug),
    [currentOrgSlug, translatedMenuData]
  )

  // Transformation des organisations en équipes
  const teams = React.useMemo(
    () =>
      organizations?.map((org) => ({
        id: org.organization?.id ?? '',
        name: org.organization?.name ?? 'No name',
        logo: BookOpen,
        plan: org.organization?.description || 'Default plan',
      })) || [],
    [organizations]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {isAdminUser && (
          <NavAdmin adminItems={translatedMenuData.adminNavMain} />
        )}
        <NavMain items={menuItems} />
        <NavProjects projects={translatedMenuData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
