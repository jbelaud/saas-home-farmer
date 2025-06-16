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

import {useAuth} from '@/components/context/auth-provider'
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

// Configuration simple et lisible du menu - comme à l'origine
const menuData = {
  adminNavMain: [
    {
      title: 'Administration',
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
      isActive: false,
      items: [
        {
          title: 'Account',
          url: '/account',
        },
        {
          title: 'Organizations',
          url: '/organizations',
        },
        {
          title: 'Invitations',
          url: '/invitations',
        },

        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Projects',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
        },

        {
          title: 'Projects',
          url: '/team/{{orgSlug}}/projects',
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

// Fonction simple pour remplacer les placeholders dans les URLs
function replaceUrlPlaceholders(url: string, orgSlug: string): string {
  return url.replace('{{orgSlug}}', orgSlug)
}

// Fonction pour créer une copie mutable d'un item avec remplacement d'URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMenuItemWithUrls(item: any, orgSlug: string) {
  return {
    ...item,
    url: replaceUrlPlaceholders(item.url, orgSlug),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: item.items?.map((subItem: any) => ({
      ...subItem,
      url: replaceUrlPlaceholders(subItem.url, orgSlug),
    })),
  }
}

// Fonction principale pour construire le menu - simple et claire
function buildMenu(isAdminUser: boolean, orgSlug: string) {
  // Créer une copie mutable du menu utilisateur avec URLs mises à jour
  const userMenu = menuData.navMain.map((item) =>
    createMenuItemWithUrls(item, orgSlug)
  )

  // Si admin, ajouter le menu admin au début
  if (isAdminUser) {
    const adminMenu = menuData.adminNavMain.map((item) => ({...item}))
    return [...adminMenu, ...userMenu]
  }

  return userMenu
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const {organizations, currentOrganization} = useOrganization()
  const {user} = useAuth()
  // États dérivés avec mémorisation
  const isAdminUser = React.useMemo(() => isAdmin(user) ?? false, [user])
  const currentOrgSlug = React.useMemo(
    () => currentOrganization?.slug || 'default',
    [currentOrganization]
  )

  // Construction dynamique du menu avec mémorisation
  const menuItems = React.useMemo(
    () => buildMenu(isAdminUser, currentOrgSlug),
    [isAdminUser, currentOrgSlug]
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
        <NavMain items={menuItems} />
        <NavProjects projects={menuData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
