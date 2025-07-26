'use client'

import {Menu} from 'lucide-react'
import Link from 'next/link'

import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {PagesConst} from '@/env'
import {isPageEnabled} from '@/lib/utils'

export function PublicMobileMenu() {
  const navItems = [
    {href: '/privacy', label: 'Privacy'},
    {href: '/terms', label: 'Terms'},
    ...(isPageEnabled(PagesConst.DOCS) ? [{href: '/docs', label: 'Docs'}] : []),
    ...(isPageEnabled(PagesConst.BLOG) ? [{href: '/blog', label: 'Blog'}] : []),
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {navItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login">Connexion</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
