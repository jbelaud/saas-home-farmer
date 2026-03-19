import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Settings,
  ShieldCheck,
  Tractor,
  User,
} from 'lucide-react'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import withAuth from '@/components/features/auth/with-auth'
import {LogoutButton} from '@/components/features/user/logout-button'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {PagesConst} from '@/env'
import {isPageEnabled} from '@/lib/utils'
import {getAuthUser} from '@/services/authentication/auth-service'

function MenuItem({
  icon,
  label,
  description,
  badge,
  href,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  badge?: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 transition-colors hover:bg-stone-50 active:bg-stone-100"
    >
      <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-stone-900">{label}</span>
          {badge && (
            <span className="min-w-[1.25rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-stone-500">{description}</p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-stone-300" />
    </Link>
  )
}

async function Page() {
  if (!isPageEnabled(PagesConst.ACCOUNT)) {
    return notFound()
  }

  const user = await getAuthUser()

  if (!user) {
    notFound()
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'HF'

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 border-b bg-white p-4 md:hidden">
        <h1 className="font-heading text-xl font-bold text-stone-900">Menu</h1>
      </header>

      <main className="space-y-6 p-4 md:px-8">
        {/* Profil Card */}
        <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-stone-900">
              {user.name ?? 'Mon compte'}
            </h2>
            <p className="text-sm text-stone-500">{user.email}</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800 uppercase">
              <ShieldCheck className="h-3 w-3" />
              Compte Vérifié
            </div>
          </div>
          <Link href="/account/settings">
            <Button variant="ghost" size="icon" className="text-stone-400">
              <Settings className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* Section Business */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-bold tracking-wider text-stone-500 uppercase">
            Gestion Business
          </h3>
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <MenuItem
              icon={<FileText className="text-blue-600" />}
              label="Facturation & Devis"
              description="Gérer les factures, relances..."
              href="/account/billing"
            />
            <Separator />
            <MenuItem
              icon={<Tractor className="text-emerald-600" />}
              label="Matériel & Stocks"
              href="#"
            />
            <Separator />
            <MenuItem
              icon={<CreditCard className="text-purple-600" />}
              label="Abonnement SaaS"
              description="Gérer votre plan"
              href="/account/billing"
            />
          </div>
        </section>

        {/* Section Application */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-bold tracking-wider text-stone-500 uppercase">
            Application
          </h3>
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <MenuItem
              icon={<User className="text-stone-600" />}
              label="Mon Profil"
              href="/account/settings"
            />
            <Separator />
            <MenuItem
              icon={<Bell className="text-stone-600" />}
              label="Notifications"
              href="/account/notifications"
            />
            <Separator />
            <MenuItem
              icon={<HelpCircle className="text-stone-600" />}
              label="Aide & Support"
              href="#"
            />
          </div>
        </section>

        {/* Déconnexion */}
        <LogoutButton />

        <p className="pt-4 text-center text-xs text-stone-400">
          MyHomeFarmer v1.0.0
        </p>
      </main>
    </div>
  )
}
export default withAuth(Page)
