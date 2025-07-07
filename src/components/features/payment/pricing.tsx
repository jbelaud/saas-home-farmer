'use client'
import {motion} from 'framer-motion'
import {Check} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import {PriceRecap} from '@/components/features/checkout-stripe/actions'
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
import {Switch} from '@/components/ui/switch'
import {authClient} from '@/lib/better-auth/auth-client'
import {AvailablePlan} from '@/lib/stripe/stripe-types'

// Type pour les subscriptions venant de Better Auth
type ActiveSubscription = {
  id: string
  plan: string
  [key: string]: unknown // Permet d'autres propriétés sans contraintes
}

export default function PricingPlans({
  priceProMonthly,
  priceProYearly,
  priceLifetime,
  priceEntrepriseMonthly,
  priceEntrepriseYearly,
  subscriptions,
  availablePlans,
}: {
  priceProMonthly?: PriceRecap
  priceProYearly?: PriceRecap
  priceLifetime?: PriceRecap
  priceEntrepriseMonthly?: PriceRecap
  priceEntrepriseYearly?: PriceRecap
  subscriptions?: ActiveSubscription[]
  availablePlans: AvailablePlan[]
}) {
  const subscription = subscriptions?.[0]
  const currentPlan = subscription?.plan || 'free'
  const {data: session} = authClient.useSession()

  const [isYearly, setIsYearly] = React.useState(false)
  const [seatsByPlan, setSeatsByPlan] = React.useState({
    pro: 1,
    entreprise: 1,
    lifetime: 1,
  })

  // Fonction pour mettre à jour les sièges d'un plan spécifique
  const updateSeats = (
    plan: 'pro' | 'entreprise' | 'lifetime',
    seats: number
  ) => {
    setSeatsByPlan((prev) => ({
      ...prev,
      [plan]: seats,
    }))
  }

  // Calcul des prix totaux avec le nombre de sièges spécifique à chaque plan
  const totalProMonthly = (priceProMonthly?.price || 0) * seatsByPlan.pro
  const totalProYearly = (priceProYearly?.price || 0) * seatsByPlan.pro
  const totalLifetime = (priceLifetime?.price || 0) * seatsByPlan.lifetime
  const totalEntrepriseMonthly =
    (priceEntrepriseMonthly?.price || 0) * seatsByPlan.entreprise
  const totalEntrepriseYearly =
    (priceEntrepriseYearly?.price || 0) * seatsByPlan.entreprise

  const prices = {
    pro: {
      monthly: totalProMonthly,
      yearly: totalProYearly,
      priceId: isYearly ? priceProYearly?.priceId : priceProMonthly?.priceId,
    },
    entreprise: {
      monthly: totalEntrepriseMonthly,
      yearly: totalEntrepriseYearly,
      priceId: isYearly
        ? priceEntrepriseYearly?.priceId
        : priceEntrepriseMonthly?.priceId,
    },
    lifetime: {
      monthly: totalLifetime,
      yearly: totalLifetime,
      priceId: isYearly ? priceLifetime?.priceId : priceLifetime?.priceId,
    },
  }
  const linkFree = session ? '/dashboard' : '/login'
  const linkPro = session
    ? `/checkout/${prices.pro?.priceId}?seats=${seatsByPlan.pro}`
    : `/checkout/${prices.pro?.priceId}?guest=true&seats=${seatsByPlan.pro}`
  const linkEntreprise = session
    ? `/checkout/${prices.entreprise?.priceId}?seats=${seatsByPlan.entreprise}`
    : `/checkout/${prices.entreprise?.priceId}?guest=true&seats=${seatsByPlan.entreprise}`
  const linkLifetime = session
    ? `/checkout/${prices.lifetime?.priceId}?seats=${seatsByPlan.lifetime}`
    : `/checkout/${prices.lifetime?.priceId}?guest=true&seats=${seatsByPlan.lifetime}`

  // Fonction helper pour vérifier le plan actuel
  const isCurrentPlan = (
    planType: 'free' | 'pro' | 'entreprise' | 'lifetime'
  ) => {
    switch (planType) {
      case 'free': {
        return currentPlan === 'free' && session
      }
      case 'pro': {
        return currentPlan === 'pro'
      }
      case 'entreprise': {
        return currentPlan === 'entreprise'
      }
      case 'lifetime': {
        return currentPlan === 'lifetime'
      }
      default: {
        return false
      }
    }
  }

  return (
    <div className="bg-background min-h-screen py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[600px] md:text-xl/relaxed">
            Choose the plan that&apos;s right for you and start creating
            beautiful code snippets for your emails
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="flex items-center gap-4">
              <Label
                htmlFor="billing-toggle"
                className="text-foreground text-lg font-medium"
              >
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-yellow-500"
              />
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="billing-toggle"
                  className="text-foreground text-lg font-medium"
                >
                  Yearly
                </Label>
                <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-500">
                  Save 20%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Free Plan */}
          <Card className="border-border bg-card text-foreground relative">
            {isCurrentPlan('free') && (
              <div className="absolute -top-4 right-0 left-0 flex justify-center">
                <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-black">
                  Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription className="text-muted-foreground">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                className="text-4xl font-bold"
                key={`free-${isYearly}`}
                initial={{y: 10, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{duration: 1}}
              >
                $0
              </motion.div>
              <ul className="space-y-2 text-sm">
                {availablePlans[0].features.map((feature, index) => (
                  <ListItem key={index}>{feature}</ListItem>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={linkFree} className="w-full">
                <Button className="bg-background text-foreground border-input hover:bg-muted w-full border">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-card text-foreground relative border-yellow-500">
            <div className="absolute -top-4 right-0 left-0 flex justify-center">
              {isCurrentPlan('pro') ? (
                <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-black">
                  Current Plan
                </span>
              ) : (
                <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium text-black">
                  Most Popular
                </span>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription className="text-muted-foreground">
                Perfect for regular users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <motion.div
                  className="text-4xl font-bold"
                  key={`pro-${isYearly}-${seatsByPlan.pro}`}
                  initial={{y: 10, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  transition={{duration: 0.3}}
                >
                  ${isYearly ? prices.pro.yearly : prices.pro.monthly}
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  per {isYearly ? 'year' : 'month'}
                </div>
                {isYearly && (
                  <div className="text-sm text-yellow-500">
                    ✨ 2 months free
                  </div>
                )}

                {/* Sélecteur de sièges */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-muted-foreground text-xs">Users:</span>
                  <Select
                    value={seatsByPlan.pro.toString()}
                    onValueChange={(value) =>
                      updateSeats('pro', parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-6 w-12 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 10}, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {seatsByPlan.pro > 1 && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    ${isYearly ? priceProYearly?.price : priceProMonthly?.price}{' '}
                    per user
                  </div>
                )}
              </div>
              <ul className="space-y-2 text-sm">
                {availablePlans[1].features.map((feature, index) => (
                  <ListItem key={index}>{feature}</ListItem>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={linkPro} className="w-full">
                <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400">
                  Subscribe Now
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-border bg-card text-foreground relative">
            {isCurrentPlan('entreprise') && (
              <div className="absolute -top-4 right-0 left-0 flex justify-center">
                <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-black">
                  Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription className="text-muted-foreground">
                Pour les grandes organisations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <motion.div
                  className="text-4xl font-bold"
                  key={`entreprise-${isYearly}-${seatsByPlan.entreprise}`}
                  initial={{y: 10, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  transition={{duration: 0.3}}
                >
                  $
                  {isYearly
                    ? prices.entreprise.yearly
                    : prices.entreprise.monthly}
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  per {isYearly ? 'year' : 'month'}
                </div>

                {/* Sélecteur de sièges */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-muted-foreground text-xs">Users:</span>
                  <Select
                    value={seatsByPlan.entreprise.toString()}
                    onValueChange={(value) =>
                      updateSeats('entreprise', parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-6 w-12 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 10}, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {seatsByPlan.entreprise > 1 && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    $
                    {isYearly
                      ? priceEntrepriseYearly?.price
                      : priceEntrepriseMonthly?.price}{' '}
                    per user
                  </div>
                )}
              </div>
              <ul className="space-y-2 text-sm">
                {availablePlans[2].features.map((feature, index) => (
                  <ListItem key={index}>{feature}</ListItem>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={linkEntreprise} className="w-full">
                <Button className="bg-background text-foreground border-input hover:bg-muted w-full border">
                  Subscribe Now
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Lifetime Plan */}
          <Card className="border-border bg-card text-foreground relative">
            {isCurrentPlan('lifetime') && (
              <div className="absolute -top-4 right-0 left-0 flex justify-center">
                <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-black">
                  Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">Lifetime</CardTitle>
              <CardDescription className="text-muted-foreground">
                Perfect for long-term users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <motion.div
                  className="text-4xl font-bold"
                  key={`lifetime-${isYearly}-${seatsByPlan.lifetime}`}
                  initial={{y: 10, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  transition={{duration: 0.3}}
                >
                  ${prices.lifetime.monthly}
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  one-time payment
                </div>

                {seatsByPlan.lifetime > 1 && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    ${priceLifetime?.price} per user
                  </div>
                )}
              </div>
              <ul className="space-y-2 text-sm">
                {availablePlans[3].features.map((feature, index) => (
                  <ListItem key={index}>{feature}</ListItem>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={linkLifetime} className="w-full">
                <Button className="bg-background text-foreground border-input hover:bg-muted w-full border">
                  Buy Lifetime
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ListItem({children}: {children: React.ReactNode}) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-yellow-500" />
      <span>{children}</span>
    </li>
  )
}
