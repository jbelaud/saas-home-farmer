'use client'

import {AlertTriangle, ChevronRight, CloudSun, MapPin} from 'lucide-react'

import {FarmerMobileNav} from '@/components/layouts/farmer-mobile-nav'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'

// Mock Data for Wireframe
const todaysTour = [
  {
    id: 1,
    name: 'Mme. Dupont',
    address: '12 Rue des Lilas',
    time: '09:00',
    status: 'done',
    type: 'Entretien',
  },
  {
    id: 2,
    name: 'M. Martin',
    address: '45 Av. de la Gare',
    time: '10:30',
    status: 'current',
    type: 'Plantation',
  },
  {
    id: 3,
    name: 'Famille Leroy',
    address: '8 Impasse Verte',
    time: '14:00',
    status: 'pending',
    type: 'Entretien',
  },
]

export default function FarmerDashboardWireframe() {
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header Mobile */}
      <header className="bg-primary text-primary-foreground rounded-b-3xl p-6 shadow-md">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Bonjour, Jean 👋
            </h1>
            <p className="text-sm opacity-90">Mardi 12 Mars</p>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/10 p-2 backdrop-blur-sm">
            <CloudSun className="mb-1 h-6 w-6" />
            <span className="text-xs font-bold">14°C</span>
          </div>
        </div>

        {/* KPI Rapide */}
        <div className="mt-2 flex gap-4">
          <div className="w-full rounded-lg bg-white/10 px-3 py-2">
            <span className="block text-xs opacity-80">Tournée</span>
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold">1/3</span>
              <span className="mb-1 text-xs opacity-80">Terminé</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/20">
              <div className="h-full w-1/3 bg-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6">
        {/* Section: Pilotage (KPIs Business) */}
        {/* Visible sur mobile pour avoir les mêmes infos que desktop */}
        <section className="grid grid-cols-2 gap-3">
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-[10px] font-bold uppercase">
                CA Mensuel
              </p>
              <p className="text-xl font-bold text-stone-900">12 450 €</p>
              <p className="text-[10px] font-medium text-emerald-600">
                +12% vs N-1
              </p>
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-[10px] font-bold uppercase">
                Clients Actifs
              </p>
              <p className="text-xl font-bold text-stone-900">24</p>
              <p className="text-[10px] font-medium text-blue-600">
                +3 ce mois
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Alerte Admin (Factures/Devis) - Miroir du Desktop */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
          <div className="mt-0.5 text-lg font-bold">!</div>
          <div>
            <p className="text-sm font-bold">Actions requises</p>
            <p className="text-xs">3 factures en retard • 1 devis à envoyer</p>
          </div>
        </div>

        {/* Alerte Météo / Info (Optionnel) */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Gel prévu cette nuit (-2°C). Pensez à voiler les semis chez M.
            Martin.
          </p>
        </div>

        {/* Section: Ma Tournée */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-stone-800">
              Ma Tournée
            </h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Voir tout
            </Button>
          </div>

          <div className="space-y-3">
            {todaysTour.map((client) => (
              <Card
                key={client.id}
                className={`border-none shadow-sm ${client.status === 'current' ? 'ring-primary ring-2 ring-offset-2' : ''}`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      client.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : client.status === 'current'
                          ? 'bg-primary text-white'
                          : 'bg-stone-100 text-stone-500'
                    } `}
                  >
                    {client.time}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-stone-900">{client.name}</h3>
                    <div className="text-muted-foreground flex items-center text-sm">
                      <MapPin className="mr-1 h-3 w-3" />
                      {client.address}
                    </div>
                  </div>

                  {client.status === 'current' ? (
                    <Button
                      size="icon"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 w-10 rounded-full"
                    >
                      <ChevronRight />
                    </Button>
                  ) : client.status === 'done' ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      Fait
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-stone-100 text-stone-500"
                    >
                      À venir
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section: Tâches de Saison (Conseil) */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold text-stone-800">
            À faire en Mars
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-3 border-b p-4">
                <div className="bg-primary h-2 w-2 rounded-full" />
                <span className="text-sm font-medium">Taille des rosiers</span>
              </div>
              <div className="flex items-center gap-3 border-b p-4">
                <div className="bg-primary h-2 w-2 rounded-full" />
                <span className="text-sm font-medium">
                  Semis tomates (intérieur)
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-3 p-4">
                <div className="h-2 w-2 rounded-full bg-stone-300" />
                <span className="text-sm line-through">Amendement du sol</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Navigation Mobile */}
      <FarmerMobileNav />
    </div>
  )
}
