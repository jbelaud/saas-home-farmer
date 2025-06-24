'use client'
import {motion} from 'framer-motion'
import {Check} from 'lucide-react'
// Import React
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
import {Switch} from '@/components/ui/switch'
import {authClient} from '@/lib/better-auth/auth-client'
import {Subscription} from '@/services/types/domain/subscription-types'

export default function PricingPlans({
  priceProMonthly,
  priceProYearly,
  priceLifetime,
  subscriptions,
}: {
  priceProMonthly?: PriceRecap
  priceProYearly?: PriceRecap
  priceLifetime?: PriceRecap
  subscriptions?: Subscription[]
}) {
  const subscription = subscriptions?.[0]
  console.log('subscription', subscription)
  const currentPlan = subscription?.plan || 'free'
  const {data: session} = authClient.useSession()

  const [isYearly, setIsYearly] = React.useState(false)

  const prices = {
    pro: {
      monthly: priceProMonthly?.price,
      yearly: priceProYearly?.price, // 10 months for 12 (2 months free)
      priceId: isYearly ? priceProYearly?.priceId : priceProMonthly?.priceId,
    },
    lifetime: {
      monthly: priceLifetime?.price,
      yearly: priceLifetime?.price,
      priceId: isYearly ? priceLifetime?.priceId : priceLifetime?.priceId,
    },
  }
  const linkFree = session ? '/dashboard' : '/login'
  const linkPro = session
    ? `/checkout/${prices.pro?.priceId}`
    : `/checkout/${prices.pro?.priceId}?guest=true`
  const linkLifetime = session
    ? `/checkout/${prices.lifetime?.priceId}`
    : `/checkout/${prices.lifetime?.priceId}?guest=true`

  // Fonction helper pour vérifier le plan actuel
  const isCurrentPlan = (planType: 'free' | 'pro' | 'lifetime') => {
    switch (planType) {
      case 'free': {
        return currentPlan === 'free' && session
      }
      case 'pro': {
        return currentPlan === 'pro'
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

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
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
                <ListItem>Unlimited code snippets</ListItem>
                <ListItem>5 code snippets save</ListItem>
                <ListItem>Basic themes</ListItem>
                <ListItem>Standard support</ListItem>
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
                  key={`pro-${isYearly}`}
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
              </div>
              <ul className="space-y-2 text-sm">
                <ListItem>Unlimited code snippets</ListItem>
                <ListItem>Unlimited save snippets</ListItem>
                <ListItem>Premium themes</ListItem>
                <ListItem>Priority support</ListItem>
                <ListItem>Custom syntax highlighting</ListItem>
                <ListItem>Snippet organization</ListItem>
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
                  key={`lifetime-${isYearly}`}
                  initial={{y: 10, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  transition={{duration: 0.3}}
                >
                  ${prices.lifetime.monthly}
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  one-time payment
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <ListItem>Everything in Pro plan</ListItem>
                <ListItem>Lifetime updates</ListItem>
                <ListItem>Early access to features</ListItem>
                <ListItem>Premium email support</ListItem>
                <ListItem>Custom branding options</ListItem>
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
