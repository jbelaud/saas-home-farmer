'use client'

import {Building2, TrendingUp, Users} from 'lucide-react'
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

interface AdminDashboardProps {
  stats: AdminDashboardStatsDTO
}

export function AdminDashboard({stats}: AdminDashboardProps) {
  const {totalUsers, totalOrganizations, userGrowth, organizationGrowth} = stats

  // Transformer les données pour les graphiques avec des noms de mois plus lisibles
  const formatMonthData = (data: {month: string; count: number}[]) => {
    return data.map((item) => ({
      ...item,
      monthLabel: new Date(item.month + '-01').toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit',
      }),
    }))
  }

  const formattedUserGrowth = formatMonthData(userGrowth)
  const formattedOrganizationGrowth = formatMonthData(organizationGrowth)

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
        {statCards.map((card, index) => {
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

      {/* Graphiques */}
      <div className="grid gap-4 md:grid-cols-2">
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
          <CardContent>
            <ChartContainer className="min-h-[320px]" config={userChartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  accessibilityLayer
                  data={formattedUserGrowth}
                  margin={{top: 20, right: 30, left: 20, bottom: 20}}
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
          <CardContent>
            <ChartContainer
              className="min-h-[320px]"
              config={organizationChartConfig}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={formattedOrganizationGrowth}
                  margin={{top: 20, right: 30, left: 20, bottom: 20}}
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
