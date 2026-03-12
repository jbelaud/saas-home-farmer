'use client'

import {
  Calendar,
  Camera,
  CloudSun,
  Leaf,
  Plus,
  Sprout,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'

export default function ClientDashboardWireframe() {
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header Mobile */}
      <header className="relative overflow-hidden rounded-b-3xl bg-emerald-800 p-6 text-white shadow-md">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 transform opacity-10">
          <Sprout className="h-48 w-48" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">
                Bonjour, Marie 👋
              </h1>
              <p className="text-sm text-emerald-100">
                Votre potager se porte à merveille !
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white/10 p-2 backdrop-blur-sm">
              <CloudSun className="mb-1 h-6 w-6" />
              <span className="text-xs font-bold">18°C</span>
            </div>
          </div>

          {/* ROI Card (Hero) */}
          <div className="rounded-2xl bg-white p-4 text-stone-900 shadow-lg">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                Valeur Produite (2024)
              </div>
            </div>
            <div className="mb-1 flex items-end gap-2">
              <span className="font-heading text-4xl font-bold">342€</span>
              <span className="mb-1.5 text-sm text-stone-500">
                d&apos;économie estimée
              </span>
            </div>
            <p className="text-xs leading-tight text-stone-400">
              Basé sur les prix moyens du Bio en magasin spécialisé.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6">
        {/* Actions Rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="flex h-auto flex-col gap-2 bg-emerald-600 py-4 shadow-md shadow-emerald-200 hover:bg-emerald-700"
            size="lg"
          >
            <Plus className="h-6 w-6" />
            <span>Ajouter une récolte</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-auto flex-col gap-2 border-emerald-200 bg-emerald-50 py-4 text-emerald-800 hover:bg-emerald-100"
          >
            <Calendar className="h-6 w-6" />
            <span>Demander visite</span>
          </Button>
        </div>

        {/* Dernière Visite */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-stone-800">
              Dernier passage
            </h2>
            <span className="text-xs text-stone-500">Mardi 12 Mars</span>
          </div>
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="relative h-48 bg-stone-200">
              {/* Mock Photo */}
              <div className="absolute inset-0 flex items-center justify-center bg-stone-300">
                <Leaf className="h-12 w-12 text-stone-400 opacity-50" />
                <span className="ml-2 font-medium text-stone-500">
                  Photo du 12/03
                </span>
              </div>
              <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-md">
                Après intervention
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-stone-100 shadow-sm">
                  <span className="text-xs font-bold text-stone-600">JP</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    Jean (Votre Jardinier)
                  </p>
                  <p className="text-xs text-stone-500">a effectué 4 tâches</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Tonte de la pelouse
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Taille des rosiers
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                <span className="mb-1 block text-xs font-bold tracking-wide uppercase opacity-70">
                  Conseil du pro
                </span>
                &ldquo;Pensez à bien arroser les tomates ce week-end, il va
                faire chaud !&rdquo;
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mes Récoltes (Aperçu) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-stone-800">
              Récoltes récentes
            </h2>
            <Link
              href="#"
              className="text-primary text-xs font-medium hover:underline"
            >
              Voir l&apos;historique
            </Link>
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                🍅
              </div>
              <div>
                <p className="font-bold text-stone-900">Tomates</p>
                <p className="text-xs text-stone-500">Hier</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-stone-900">2.5 kg</p>
              <p className="text-xs font-medium text-emerald-600">+12.50€</p>
            </div>
          </div>
        </section>
      </main>

      {/* Client Nav (Simple) */}
      <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t bg-white px-6 py-2">
        <Button
          variant="ghost"
          className="text-primary hover:text-primary hover:bg-primary/5 flex h-auto flex-col items-center gap-1 py-2"
        >
          <HomeIcon active />
          <span className="text-[10px] font-medium">Accueil</span>
        </Button>
        <Button
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 py-2 text-stone-400 hover:text-stone-600"
        >
          <Camera className="h-6 w-6" />
          <span className="text-[10px] font-medium">Photos</span>
        </Button>
        <Button
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 py-2 text-stone-400 hover:text-stone-600"
        >
          <Leaf className="h-6 w-6" />
          <span className="text-[10px] font-medium">Récoltes</span>
        </Button>
      </nav>
    </div>
  )
}

function HomeIcon({active}: {active?: boolean}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? 'fill-current' : ''}`}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
