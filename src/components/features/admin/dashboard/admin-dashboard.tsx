'use client'

import {Building2, DollarSign, TrendingUp, Users} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import {AdminDashboardStatsDTO} from '@/app/dal/admin-dashboard-dal'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {MRRStats} from '@/services/types/domain/subscription-types'

interface AdminDashboardProps {
  stats: AdminDashboardStatsDTO
  mrrStats: MRRStats
}

export function AdminDashboard({stats, mrrStats}: AdminDashboardProps) {
  const {totalUsers, totalOrganizations, userGrowth, organizationGrowth} = stats

  const formatCurrency = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  // Transformer les données pour les graphiques avec des noms de mois plus lisibles
  const formatMonthData = (data: {month: string; count: number}[]) => {
    return data.map((item) => ({
      ...item,
      monthLabel: new Date(`${item.month}-01`).toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit',
      }),
    }))
  }

  const formattedUserGrowth = formatMonthData(userGrowth)
  const formattedOrganizationGrowth = formatMonthData(organizationGrowth)

  // Préparer les données MRR pour le graphique
  const mrrChartData = mrrStats.planBreakdowns.map((plan) => ({
    plan: plan.planName,
    totalMRR: plan.totalMRR / 100, // Convertir en euros pour l'affichage
    subscriptions: plan.subscriptionCount,
  }))

  // Préparer les données de croissance des subscriptions
  const formattedSubscriptionGrowth = formatMonthData(
    mrrStats.subscriptionGrowth
  )

  // Configuration des graphiques ShadCN
  const userChartConfig = {
    count: {
      label: 'Utilisateurs',
      theme: {
        light: 'var(--chart-1)',
        dark: 'var(--chart-1)',
      },
    },
  } satisfies ChartConfig

  const organizationChartConfig = {
    count: {
      label: 'Organisations',
      theme: {
        light: 'var(--chart-2)',
        dark: 'var(--chart-2)',
      },
    },
  } satisfies ChartConfig

  const mrrChartConfig = {
    totalMRR: {
      label: 'MRR',
      theme: {
        light: 'var(--chart-3)',
        dark: 'var(--chart-3)',
      },
    },
  } satisfies ChartConfig

  const subscriptionChartConfig = {
    count: {
      label: 'Abonnements',
      theme: {
        light: 'var(--chart-4)',
        dark: 'var(--chart-4)',
      },
    },
  } satisfies ChartConfig

  // Calculer les pourcentages de croissance
  const calculateGrowth = (data: {count: number}[]) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1].count
    const previous = data[data.length - 2].count
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const userGrowthPercent = calculateGrowth(userGrowth)
  const orgGrowthPercent = calculateGrowth(organizationGrowth)

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: totalUsers,
      icon: Users,
      growth: userGrowthPercent,
      description: `${userGrowthPercent >= 0 ? '+' : ''}${userGrowthPercent}% ce mois-ci`,
    },
    {
      title: 'Total Organisations',
      value: totalOrganizations,
      icon: Building2,
      growth: orgGrowthPercent,
      description: `${orgGrowthPercent >= 0 ? '+' : ''}${orgGrowthPercent}% ce mois-ci`,
    },
    {
      title: 'MRR Total',
      value: formatCurrency(mrrStats.totalMRR, mrrStats.currency),
      icon: DollarSign,
      growth: mrrStats.subscriptionGrowthPercent,
      description: `${mrrStats.totalActiveSubscriptions} abonnement${mrrStats.totalActiveSubscriptions > 1 ? 's' : ''} actif${mrrStats.totalActiveSubscriptions > 1 ? 's' : ''}`,
    },
    {
      title: 'Nouvelles Souscriptions',
      value: mrrStats.newSubscriptionsThisMonth,
      icon: TrendingUp,
      growth: mrrStats.subscriptionGrowthPercent,
      description: `${mrrStats.subscriptionGrowthPercent >= 0 ? '+' : ''}${mrrStats.subscriptionGrowthPercent}% de croissance`,
    },
    {
      title: 'Moyens Utilisateurs/Org',
      value:
        totalOrganizations > 0
          ? Math.round(totalUsers / totalOrganizations)
          : 0,
      icon: TrendingUp,
      growth: 0,
      description: 'Ratio moyen',
    },
    {
      title: 'Croissance Totale',
      value: userGrowth.reduce((sum, item) => sum + item.count, 0),
      icon: TrendingUp,
      growth: 0,
      description: '6 derniers mois',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.slice(0, 4).map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Deuxième ligne - MRR par Plan + Stats complémentaires */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Répartition MRR par Plan - 2 colonnes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              MRR par Plan
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Répartition du revenu par plan d&apos;abonnement
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mrrStats.planBreakdowns.map((plan) => (
                <div
                  key={plan.planCode}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <div className="font-medium">{plan.planName}</div>
                    <div className="text-muted-foreground text-sm">
                      {plan.subscriptionCount} abonnement
                      {plan.subscriptionCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(plan.totalMRR, plan.currency)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Moy: {formatCurrency(plan.averageAmount, plan.currency)}
                    </div>
                  </div>
                </div>
              ))}
              {mrrStats.planBreakdowns.length === 0 && (
                <div className="text-muted-foreground py-4 text-center">
                  Aucun abonnement actif
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats complémentaires - 1 colonne chacune */}
        {statCards.slice(-2).map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index + 4} className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Graphiques Abonnements */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Répartition MRR par Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Répartition MRR
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              MRR par plan d&apos;abonnement
            </p>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer
              className="min-h-[320px] w-full"
              config={mrrChartConfig}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mrrChartData}
                  margin={{top: 20, right: 12, left: 12, bottom: 20}}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="plan"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => {
                          if (name === 'totalMRR') {
                            return [`${Number(value).toFixed(2)}€`, 'MRR']
                          }
                          return [value, 'Abonnements']
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="totalMRR"
                    fill="var(--color-totalMRR)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Croissance des abonnements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Croissance Abonnements
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Nouveaux abonnements par mois
            </p>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer
              className="min-h-[320px] w-full"
              config={subscriptionChartConfig}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  accessibilityLayer
                  data={formattedSubscriptionGrowth}
                  margin={{top: 20, right: 12, left: 12, bottom: 20}}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthLabel"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          `${value.toLocaleString()}`,
                          'Nouveaux abonnements',
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    strokeWidth={2}
                    dot={{r: 4}}
                    activeDot={{r: 6}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques Utilisateurs & Organisations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Croissance des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Croissance des Utilisateurs
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Évolution mensuelle des nouveaux utilisateurs
            </p>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer
              className="min-h-[320px] w-full"
              config={userChartConfig}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  accessibilityLayer
                  data={formattedUserGrowth}
                  margin={{top: 20, right: 12, left: 12, bottom: 20}}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthLabel"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          `${value.toLocaleString()}`,
                          'Utilisateurs',
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    strokeWidth={2}
                    dot={{r: 4}}
                    activeDot={{r: 6}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Croissance des organisations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Croissance des Organisations
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Évolution mensuelle des nouvelles organisations
            </p>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer
              className="min-h-[320px] w-full"
              config={organizationChartConfig}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={formattedOrganizationGrowth}
                  margin={{top: 20, right: 12, left: 12, bottom: 20}}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthLabel"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value}`, 'Organisations']}
                      />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
