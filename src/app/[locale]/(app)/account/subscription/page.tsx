'use client'

import {Subscription} from '@better-auth/stripe'
import {Calendar, CheckCircle, CreditCard, Crown, Zap} from 'lucide-react'
import React, {useEffect, useState} from 'react'
import {toast} from 'sonner'

import {useOrganization} from '@/components/context/organizarion-provider'
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
    id: 'free',
    name: 'Gratuit',
    price: '€0/mois',
    yearlyPrice: '€0/an',
    description: 'Idéal pour débuter',
    features: [
      '1 utilisateur',
      '5 projets',
      '1GB de stockage',
      'Support communautaire',
    ],
    popular: false,
  },
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
  const {referenceId} = useOrganization()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<{
    [planId: string]: number
  }>({
    free: 1,
    pro: 5,
    enterprise: 10,
  })

  console.log('referenceId', referenceId)

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const {data} = await authClient.subscription.list({
        query: {
          referenceId: referenceId || '',
        },
      })
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

  // Initialiser les seats avec l'abonnement actuel
  useEffect(() => {
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )
    if (activeSubscription) {
      setSelectedSeats((prev) => ({
        ...prev,
        [activeSubscription.plan]: activeSubscription.seats || 1,
      }))
    }
  }, [subscriptions])

  const handleUpgrade = async (planId: string, annual = false) => {
    try {
      setActionLoading(`upgrade-${planId}`)

      const activeSubscription = subscriptions.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      )

      const seats = selectedSeats[planId] || 1

      // Déterminer le mode selon la présence d'une subscription active
      const isUpdateMode = activeSubscription?.id
      const isCreateMode = !activeSubscription && referenceId

      if (!isUpdateMode && !isCreateMode) {
        toast.error('Impossible de déterminer le mode de subscription')
        return
      }

      // Préparer les paramètres selon le mode
      const upgradeParams: {
        plan: string
        successUrl: string
        cancelUrl: string
        annual: boolean
        seats: number
        subscriptionId?: string
        referenceId?: string
      } = {
        plan: planId,
        successUrl: '/account/subscription',
        cancelUrl: '/account/subscription',
        annual,
        seats,
      }

      if (isUpdateMode) {
        // Mode UPDATE : modifier une subscription existante
        upgradeParams.subscriptionId = activeSubscription.id
        console.log('Mode UPDATE - subscriptionId:', activeSubscription.id)
      } else if (isCreateMode) {
        // Mode CREATE : créer une nouvelle subscription
        upgradeParams.referenceId = referenceId
        console.log('Mode CREATE - referenceId:', referenceId)
      }

      const {error} = await authClient.subscription.upgrade(upgradeParams)

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

  // Fonctions helper pour l'approche Zapier
  const isCurrentPlan = (planId: string) => {
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )
    return activeSubscription?.plan === planId
  }

  const hasSeatsChanged = (planId: string) => {
    if (!isCurrentPlan(planId)) return false
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )
    return selectedSeats[planId] !== activeSubscription?.seats
  }

  const getActionButton = (plan: (typeof availablePlans)[0]) => {
    const isCurrent = isCurrentPlan(plan.id)
    const hasChanged = hasSeatsChanged(plan.id)
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )

    // Cas spécial pour le plan gratuit
    if (plan.id === 'free') {
      // Si on est déjà sur le plan gratuit (pas d'abonnement actif)
      if (!activeSubscription) {
        return (
          <Button variant="outline" disabled className="w-full">
            Plan actuel
          </Button>
        )
      }
      // Si abonnement payant se termine, plan gratuit devient le futur plan
      if (activeSubscription.cancelAtPeriodEnd) {
        return (
          <Button variant="outline" disabled className="w-full">
            À partir du{' '}
            {formatDate(activeSubscription.periodEnd?.toISOString())}
          </Button>
        )
      }
      // Si on a un abonnement payant actif, permettre de downgrader vers gratuit
      return (
        <Button
          variant="destructive"
          onClick={() => handleCancel(activeSubscription.referenceId || '')}
          disabled={actionLoading === 'cancel'}
          className="w-full"
        >
          {actionLoading === 'cancel' ? 'Annulation...' : 'Passer au gratuit'}
        </Button>
      )
    }

    // Logique existante pour les plans payants
    if (isCurrent && !hasChanged) {
      // Si l'abonnement est déjà marqué pour annulation, afficher le bouton pour continuer
      if (activeSubscription?.cancelAtPeriodEnd) {
        const planName =
          planDetails[plan.id as keyof typeof planDetails]?.name || plan.name
        return (
          <Button
            variant="default"
            onClick={handleRestore}
            disabled={actionLoading === 'restore'}
            className="w-full"
          >
            {actionLoading === 'restore'
              ? 'Restauration...'
              : `Continuer ${planName}`}
          </Button>
        )
      }

      // Sinon, afficher le bouton annuler
      return (
        <Button
          variant="destructive"
          onClick={() => handleCancel(activeSubscription?.referenceId || '')}
          disabled={actionLoading === 'cancel'}
          className="w-full"
        >
          {actionLoading === 'cancel' ? 'Annulation...' : 'Annuler'}
        </Button>
      )
    }

    if (isCurrent && hasChanged) {
      return (
        <Button
          onClick={() => handleUpgrade(plan.id, false)}
          disabled={actionLoading === `upgrade-${plan.id}`}
          className="w-full"
        >
          {actionLoading === `upgrade-${plan.id}`
            ? 'Mise à jour...'
            : 'Mettre à jour'}
        </Button>
      )
    }

    return (
      <Button
        variant={plan.popular ? 'default' : 'outline'}
        onClick={() => handleUpgrade(plan.id, false)}
        disabled={actionLoading === `upgrade-${plan.id}`}
        className="w-full"
      >
        {actionLoading === `upgrade-${plan.id}`
          ? 'Redirection...'
          : `Passer à ${plan.name}`}
      </Button>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR')
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

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">Choisissez votre plan</h1>
        <p className="text-muted-foreground">
          {activeSubscription
            ? 'Modifiez votre abonnement ou changez de plan'
            : 'Sélectionnez le plan qui vous convient'}
        </p>

        {/* Récapitulatif discret de l&apos;offre en cours */}
        {activeSubscription && (
          <p className="text-muted-foreground text-sm italic">
            Offre &apos;
            {planDetails[activeSubscription.plan as keyof typeof planDetails]
              ?.name || activeSubscription.plan}
            &apos; ({activeSubscription.seats || 1} siège
            {activeSubscription.seats && activeSubscription.seats > 1
              ? 's'
              : ''}
            ){' '}
            {activeSubscription.cancelAtPeriodEnd
              ? 'se termine'
              : 'se renouvelle'}{' '}
            le {formatDate(activeSubscription.periodEnd?.toISOString())}
            {activeSubscription.cancelAtPeriodEnd &&
              ', passage au gratuit automatique'}
          </p>
        )}
      </div>

      {/* Grille des plans - Approche Zapier */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availablePlans.map((plan) => {
          const isCurrent =
            plan.id === 'free'
              ? !activeSubscription // Pour le plan gratuit, on est "actuel" s'il n'y a pas d'abonnement du tout
              : isCurrentPlan(plan.id) // Pour les autres plans, logique normale
          const planData = planDetails[plan.id as keyof typeof planDetails]

          // État spécial pour plan gratuit quand abonnement se termine
          const isFutureFree =
            plan.id === 'free' && activeSubscription?.cancelAtPeriodEnd
          // État spécial pour plan payant qui se termine
          const isEnding = isCurrent && activeSubscription?.cancelAtPeriodEnd

          return (
            <Card
              key={plan.id}
              className={`relative ${isCurrent ? 'ring-2 ring-blue-500' : ''} ${isFutureFree ? 'ring-2 ring-green-500' : ''} ${plan.popular && !isCurrent && !isFutureFree ? 'ring-2 ring-yellow-500' : ''}`}
            >
              {/* Badges selon l'état */}
              {isCurrent && !isEnding && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-blue-500">Plan actuel</Badge>
                </div>
              )}
              {isEnding && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-orange-500">
                    Se termine le{' '}
                    {formatDate(activeSubscription?.periodEnd?.toISOString())}
                  </Badge>
                </div>
              )}
              {isFutureFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-green-500">
                    Votre futur plan à partir du{' '}
                    {formatDate(activeSubscription?.periodEnd?.toISOString())}
                  </Badge>
                </div>
              )}
              {plan.popular && !isCurrent && !isFutureFree && !isEnding && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-yellow-500 text-black">Populaire</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mb-2 flex items-center justify-center space-x-2">
                  <div
                    className={`rounded-full p-2 ${planData?.color || 'bg-gray-500'} text-white`}
                  >
                    {planData?.icon || <Zap className="h-4 w-4" />}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-muted-foreground text-sm">
                    {plan.yearlyPrice} (économisez 17%)
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>

                {/* Informations de l'abonnement actuel */}
                {isCurrent && activeSubscription && !isEnding && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="text-muted-foreground flex items-center justify-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Prochaine facturation:{' '}
                        {formatDate(
                          activeSubscription.periodEnd?.toISOString()
                        )}
                      </span>
                    </div>
                  </div>
                )}
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

                {/* Sélecteur de sièges - masqué pour le plan gratuit */}
                {plan.id !== 'free' && (
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
                      {hasSeatsChanged(plan.id) && (
                        <Badge variant="outline" className="text-orange-600">
                          Modifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Prix ajusté selon le nombre d&apos;utilisateurs
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-col space-y-2">
                {getActionButton(plan)}
              </CardFooter>
            </Card>
          )
        })}
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
