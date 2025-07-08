'use client'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from 'lucide-react'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import {useTheme} from 'next-themes'

import {useUnreadNotifications} from '@/components/hooks/use-unread-notifications'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {User} from '@/services/types/domain/user-types'

export function NavUser({user}: {user?: User}) {
  const t = useTranslations('NavUser')
  const {isMobile} = useSidebar()
  const {theme, setTheme} = useTheme()
  const {unreadCount} = useUnreadNotifications()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                <Link href="/account/subscription">{t('upgradeToPro')}</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer"
              >
                {theme === 'light' ? (
                  <>
                    <Moon
                      className="h-[1.2rem] w-[1.2rem]"
                      suppressHydrationWarning
                    />
                    {t('darkMode')}
                  </>
                ) : (
                  <>
                    <Sun
                      className="h-[1.2rem] w-[1.2rem]"
                      suppressHydrationWarning
                    />
                    {t('lightMode')}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BadgeCheck />
                <Link href="/account">{t('account')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                <Link href="/account/settings">{t('settings')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                <Link href="/account/subscription">{t('billing')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center gap-2">
                  <Bell />
                  <Link href="/notifications" className="flex-1">
                    {t('notifications')}
                  </Link>
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-[1.25rem] px-1 text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              <Link href="/logout">{t('logout')}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
