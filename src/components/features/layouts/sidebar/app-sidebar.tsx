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
import * as React from 'react'

import {useOrganization} from '@/components/context/organizarion-provider'
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
import {isAdmin} from '@/services/authentication/auth-util'

// This is sample data.
const data = {
  adminNavMain: [
    {
      title: 'Adminitration',
      url: '#',
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: 'Dashboard Admin',
          url: '/admin',
        },

        {
          title: 'Users',
          url: '/admin/users',
        },
        {
          title: 'Organizations',
          url: '/admin/organizations',
        },
      ],
    },
  ],
  navMain: [
    {
      title: 'Account',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
        },
        {
          title: 'Account',
          url: '/account',
        },
        {
          title: 'Organizations',
          url: '/organization',
        },

        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}

function buildMenu(isAdmin: boolean) {
  if (isAdmin) {
    return [...data.adminNavMain, ...data.navMain]
  }
  return data.navMain
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const {user, organizations} = useOrganization()
  const admin = isAdmin(user)
  const menuItems = buildMenu(admin ?? false)

  const teams = organizations?.map((organization) => ({
    id: organization.organization?.id ?? '',
    name: organization.organization?.name ?? 'No name',
    logo: BookOpen,
    plan: organization.organization?.description || 'Default plan',
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams || []} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
