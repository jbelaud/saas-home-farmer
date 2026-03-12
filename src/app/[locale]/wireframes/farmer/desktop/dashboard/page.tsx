'use client'

import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  Leaf,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react'

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Separator} from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function FarmerDesktopDashboardWireframe() {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white md:flex">
        <div className="p-6">
          <div className="font-heading flex items-center gap-2 text-xl font-bold text-stone-900">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            MyHomeFarmer
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <NavItem icon={<LayoutDashboard />} label="Tableau de bord" active />
          <NavItem icon={<Calendar />} label="Planning" />
          <NavItem icon={<Users />} label="Clients" />
          <NavItem icon={<FileText />} label="Facturation" />
        </nav>

        <div className="border-t p-4">
          <NavItem icon={<Settings />} label="Paramètres" />
          <div className="mt-4 flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                Jean Dupont
              </p>
              <p className="truncate text-xs text-stone-500">
                jean@homefarmer.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="font-heading text-2xl font-bold text-stone-900">
            Tableau de bord
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-stone-500" />
              <Input
                placeholder="Rechercher..."
                className="border-stone-200 bg-stone-50 pl-9"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Client
            </Button>
          </div>
        </header>

        <div className="space-y-8 overflow-y-auto p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <KpiCard
              title="Chiffre d'Affaires"
              value="12 450 €"
              change="+12% ce mois"
              icon={<CreditCard className="text-primary h-5 w-5" />}
            />
            <KpiCard
              title="Clients Actifs"
              value="24"
              change="+3 nouveaux"
              icon={<Users className="h-5 w-5 text-blue-600" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent Activity / Planning */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tournée du jour</CardTitle>
                <CardDescription>Mardi 12 Mars 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Heure</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Mme. Dupont</TableCell>
                      <TableCell>09:00</TableCell>
                      <TableCell>Entretien</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          Terminé
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">M. Martin</TableCell>
                      <TableCell>10:30</TableCell>
                      <TableCell>Plantation</TableCell>
                      <TableCell>
                        <Badge className="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">
                          En cours
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Famille Leroy
                      </TableCell>
                      <TableCell>14:00</TableCell>
                      <TableCell>Entretien</TableCell>
                      <TableCell>
                        <Badge variant="secondary">À venir</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Stats / Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>À Faire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Relancer factures
                    </p>
                    <p className="text-xs text-amber-700">
                      3 factures en retard (+15j)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Devis à envoyer
                    </p>
                    <p className="text-xs text-blue-700">
                      Mme. Weber (Aménagement)
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 text-sm font-medium">
                    Progression du mois
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Objectif CA</span>
                      <span className="font-bold">65%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="bg-primary h-full w-[65%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className={`mb-1 w-full justify-start gap-3 ${active ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`}
    >
      <span className="h-5 w-5 [&>svg]:h-full [&>svg]:w-full">{icon}</span>
      {label}
    </Button>
  )
}

function KpiCard({
  title,
  value,
  change,
  icon,
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{value}</span>
          <p className="text-muted-foreground text-xs">{change}</p>
        </div>
      </CardContent>
    </Card>
  )
}
