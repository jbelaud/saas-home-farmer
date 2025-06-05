'use client'

import {Frame, Map, PieChart, Settings2, SquareTerminal} from 'lucide-react'
import * as React from 'react'

import {NavMain} from '@/components/nav-main'
import {NavProjects} from '@/components/nav-projects'
import {NavUser} from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import {User} from '@/services/types/domain/user-types'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Account',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Profile',
          url: '/account',
        },
        {
          title: 'Organizations',
          url: '/organization',
        },
        {
          title: 'Dashboard',
          url: '/dashboard',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },

    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
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

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {user?: User}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{/* <TeamSwitcher teams={[]} /> */}</SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
