'use client'

import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Tractor,
  User,
} from 'lucide-react'
import Link from 'next/link'

import {FarmerMobileNav} from '@/components/layouts/farmer-mobile-nav'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'

export default function FarmerMenuWireframe() {
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="sticky top-0 z-10 border-b bg-white p-4">
        <h1 className="font-heading text-xl font-bold text-stone-900">Menu</h1>
      </header>

      <main className="space-y-6 p-4">
        {/* Profil Card */}
        <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-stone-900">Jean Dupont</h2>
            <p className="text-sm text-stone-500">jean@homefarmer.com</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800 uppercase">
              <ShieldCheck className="h-3 w-3" />
              Compte Vérifié
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-stone-400">
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* Section Business (Ce qui manque dans la Bottom Bar) */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-bold tracking-wider text-stone-500 uppercase">
            Gestion Business
          </h3>
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <MenuItem
              icon={<FileText className="text-blue-600" />}
              label="Facturation & Devis"
              description="Gérer les factures, relances..."
              href="#"
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
              description="Plan Pro (Actif)"
              href="#"
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
              label="Mon Profil Public"
              href="#"
            />
            <Separator />
            <MenuItem
              icon={<Bell className="text-stone-600" />}
              label="Notifications"
              badge="3"
              href="#"
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
        <Button
          variant="outline"
          className="h-12 w-full border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>

        <p className="pt-4 text-center text-xs text-stone-400">
          MyHomeFarmer v1.0.0
        </p>
      </main>

      <FarmerMobileNav />
    </div>
  )
}

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
