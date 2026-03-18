'use client'

import {Calendar, Home, Menu, Plus, Users} from 'lucide-react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useLocale} from 'next-intl'

import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

export function FarmerMobileNav() {
  const pathname = usePathname()
  const locale = useLocale()

  const navItems = [
    {
      label: 'Accueil',
      icon: Home,
      href: `/${locale}/dashboard`,
      match: '/dashboard',
    },
    {
      label: 'Clients',
      icon: Users,
      href: `/${locale}/clients`,
      match: '/clients',
    },
    {
      label: 'Intervention',
      icon: Plus,
      href: `/${locale}/tournees/new`,
      match: '/tournees/new',
      isFab: true,
    },
    {
      label: 'Agenda',
      icon: Calendar,
      href: `/${locale}/agenda`,
      match: '/agenda',
    },
    {
      label: 'Menu',
      icon: Menu,
      href: `/${locale}/account`,
      match: '/account',
    },
  ]

  return (
    <div className="bg-background pb-safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50 border-t md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.match)

          if (item.isFab) {
            return (
              <div key={item.href} className="relative -top-6">
                <Link href={item.href}>
                  <Button
                    size="icon"
                    className="bg-primary hover:bg-primary/90 border-background h-14 w-14 rounded-full border-4 shadow-lg"
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </Button>
                </Link>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center space-y-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
