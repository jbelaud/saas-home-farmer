'use client'

import {Subscription} from '@better-auth/stripe'
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  Users,
  Zap,
} from 'lucide-react'
import {useEffect, useState} from 'react'
import {toast} from 'sonner'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Label} from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Separator} from '@/components/ui/separator'
import {authClient} from '@/lib/better-auth/auth-client'

const planDetails = {
  free: {
    name: 'Gratuit',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-gray-500',
    features: ['1 utilisateur', '5 projets', '1GB stockage'],
  },
  pro: {
    name: 'Pro',
    icon: <Crown className="h-5 w-5" />,
    color: 'bg-blue-500',
    features: [
      'Utilisateurs illimités',
      '50 projets',
      '10GB stockage',
      'Support prioritaire',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'bg-purple-500',
    features: [
      'Tout Pro +',
      'Projets illimités',
      '100GB stockage',
      'Support 24/7',
      'SSO',
    ],
  },
}

const availablePlans = [
  {
    id: 'pro',
    name: 'Pro',
    price: '€29/mois',
    yearlyPrice: '€290/an',
    description: 'Parfait pour les équipes en croissance',
    features: [
      "Jusqu'à 10 utilisateurs",
      '50 projets',
      '10GB de stockage',
      'Support prioritaire',
      'Intégrations avancées',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '€99/mois',
    yearlyPrice: '€990/an',
    description: 'Pour les grandes organisations',
    features: [
      'Utilisateurs illimités',
      'Projets illimités',
      '100GB de stockage',
      'Support 24/7',
      'SSO & sécurité avancée',
    ],
    popular: false,
  },
]

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<{
    [planId: string]: number
  }>({
    pro: 5,
    enterprise: 10,
  })

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const {data} = await authClient.subscription.list()
      console.log('sSubscriptions', data)
      setSubscriptions(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error)
      toast.error('Impossible de charger les abonnements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const handleUpgrade = async (planId: string, annual = false) => {
    try {
      setActionLoading(`upgrade-${planId}`)

      const activeSubscription = subscriptions.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      )

      const seats = selectedSeats[planId] || 1

      const {error} = await authClient.subscription.upgrade({
        plan: planId,
        successUrl: '/account/subscription',
        cancelUrl: '/account/subscription',
        annual,
        subscriptionId: activeSubscription?.id,
        seats,
      })

      if (error) {
        toast.error(error.message || 'Erreur lors de la mise à jour')
      } else {
        toast.success('Redirection vers le paiement...')
      }
    } catch (error) {
      console.error('Erreur upgrade:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (referenceId: string) => {
    try {
      setActionLoading('cancel')
      const {data, error} = await authClient.subscription.cancel({
        returnUrl: '/account/subscription',
        referenceId,
      })

      if (error) {
        toast.error(error.message || "Erreur lors de l'annulation")
      } else if (data?.url) {
        window.location.href = data.url
      } else {
        toast.success('Abonnement annulé')
        await loadSubscriptions()
      }
    } catch (error) {
      console.error('Erreur cancel:', error)
      toast.error("Erreur lors de l'annulation")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestore = async () => {
    try {
      setActionLoading('restore')
      const {error} = await authClient.subscription.restore()

      if (error) {
        toast.error(error.message || 'Erreur lors de la restauration')
      } else {
        toast.success('Abonnement restauré avec succès')
        await loadSubscriptions()
      }
    } catch (error) {
      console.error('Erreur restore:', error)
      toast.error('Erreur lors de la restauration')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status: string, cancelAtPeriodEnd?: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge variant="destructive">Sera annulé</Badge>
    }

    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            Actif
          </Badge>
        )
      case 'trialing':
        return <Badge variant="secondary">Période d&apos;essai</Badge>
      case 'canceled':
        return <Badge variant="destructive">Annulé</Badge>
      case 'incomplete':
        return <Badge variant="outline">Incomplet</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Abonnements</h1>
          <p className="text-muted-foreground">
            Gérez vos abonnements et facturation
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-gray-200"></div>
                  <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  )
  const hasActiveSubscription = !!activeSubscription

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Abonnements</h1>
        <p className="text-muted-foreground">
          Gérez vos abonnements et accédez à plus de fonctionnalités
        </p>
      </div>

      {/* Abonnements actuels */}
      {subscriptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vos abonnements</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription) => {
              const plan =
                planDetails[subscription.plan as keyof typeof planDetails]
              const isActive =
                subscription.status === 'active' ||
                subscription.status === 'trialing'

              return (
                <Card
                  key={subscription.id}
                  className={`relative ${isActive ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`rounded-full p-2 ${plan?.color || 'bg-gray-500'} text-white`}
                        >
                          {plan?.icon || <Zap className="h-4 w-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {plan?.name || subscription.plan}
                          </CardTitle>
                          <CardDescription>
                            ID: {subscription.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(
                        subscription.status,
                        subscription.cancelAtPeriodEnd
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {subscription.seats && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span>{subscription.seats} siège(s)</span>
                      </div>
                    )}

                    {subscription.periodStart && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span>
                          Du{' '}
                          {formatDate(subscription.periodStart.toISOString())}
                          au {formatDate(subscription.periodEnd?.toISOString())}
                        </span>
                      </div>
                    )}

                    {plan?.features && (
                      <div className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex space-x-2">
                    {isActive && (
                      <>
                        {subscription.cancelAtPeriodEnd ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRestore}
                            disabled={actionLoading === 'restore'}
                            className="flex-1"
                          >
                            {actionLoading === 'restore'
                              ? 'Restauration...'
                              : 'Restaurer'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancel(subscription.referenceId)
                            }
                            disabled={actionLoading === 'cancel'}
                            className="flex-1"
                          >
                            {actionLoading === 'cancel'
                              ? 'Annulation...'
                              : 'Annuler'}
                          </Button>
                        )}
                      </>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Plans disponibles */}
      <div className="space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">
            {hasActiveSubscription
              ? 'Changer de plan'
              : 'Choisissez votre plan'}
          </h2>
          <p className="text-muted-foreground">
            {hasActiveSubscription
              ? 'Upgrader ou changer votre abonnement actuel'
              : 'Débloquez plus de fonctionnalités avec nos plans premium'}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-2">
          {availablePlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-blue-500">Populaire</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-muted-foreground text-sm">
                    {plan.yearlyPrice} (économisez 17%)
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Sélecteur de sièges */}
                <div className="space-y-2 border-t pt-2">
                  <Label className="text-sm font-medium">
                    Nombre de sièges
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedSeats[plan.id]?.toString() || '1'}
                      onValueChange={(value) =>
                        setSelectedSeats((prev) => ({
                          ...prev,
                          [plan.id]: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 50, 100].map(
                          (seats) => (
                            <SelectItem key={seats} value={seats.toString()}>
                              {seats}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground text-sm">
                      utilisateur(s)
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Prix ajusté selon le nombre d&apos;utilisateurs
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-2">
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.id, false)}
                  disabled={actionLoading === `upgrade-${plan.id}`}
                >
                  {actionLoading === `upgrade-${plan.id}`
                    ? 'Redirection...'
                    : hasActiveSubscription
                      ? `Passer à ${plan.name}`
                      : `Commencer avec ${plan.name}`}
                </Button>

                <Button
                  className="w-full"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpgrade(plan.id, true)}
                  disabled={actionLoading === `upgrade-${plan.id}`}
                >
                  {plan.yearlyPrice} (Annuel)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Note d'information */}
      <div className="bg-muted/50 text-muted-foreground rounded-lg p-4 text-center text-sm">
        <p>
          Tous les plans incluent une période d&apos;essai gratuite de 14 jours.
          Vous pouvez annuler à tout moment depuis cette page.
        </p>
      </div>
    </div>
  )
}
