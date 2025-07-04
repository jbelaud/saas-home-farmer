'use client'

import {Check, CreditCard, Loader2} from 'lucide-react'
import {useState} from 'react'
import {toast} from 'sonner'

import {type PriceRecap} from '@/components/features/checkout-stripe/actions'
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

interface CheckoutBetterAuthProps {
  initialPriceRecaps: {
    proMonthly: PriceRecap
    proYearly: PriceRecap
    entrepriseMonthly: PriceRecap
    entrepriseYearly: PriceRecap
  }
}

export default function CheckoutBetterAuth({
  initialPriceRecaps,
}: CheckoutBetterAuthProps) {
  const [isUpgradingPro, setIsUpgradingPro] = useState(false)
  const [isUpgradingEnterprise, setIsUpgradingEnterprise] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const [seats, setSeats] = useState(1)

  // Calcul des prix totaux avec le nombre de sièges
  const totalProMonthly = initialPriceRecaps.proMonthly.unitPrice * seats
  const totalProYearly = initialPriceRecaps.proYearly.unitPrice * seats
  const totalEntrepriseMonthly =
    initialPriceRecaps.entrepriseMonthly.unitPrice * seats
  const totalEntrepriseYearly =
    initialPriceRecaps.entrepriseYearly.unitPrice * seats

  const handleUpgradePro = async () => {
    try {
      setIsUpgradingPro(true)

      const {error} = await authClient.subscription.upgrade({
        plan: 'pro',
        successUrl: '/checkout/success?redirect_status=succeeded',
        cancelUrl: '/pricing',
        annual: isYearly,
        seats: seats,
      })

      if (error) {
        toast.error('Error', {description: error.message || error.statusText})
        return
      }

      toast.success('Redirection vers le paiement...')
    } catch (error) {
      console.error('Erreur lors de la mise à niveau Pro:', error)
      toast.error('Erreur lors de la mise à niveau vers Pro')
    } finally {
      setIsUpgradingPro(false)
    }
  }

  const handleUpgradeEnterprise = async () => {
    try {
      setIsUpgradingEnterprise(true)

      const {error} = await authClient.subscription.upgrade({
        plan: 'enterprise',
        successUrl: '/checkout/success?redirect_status=succeeded',
        cancelUrl: '/pricing',
        annual: isYearly,
        seats: seats,
      })

      if (error) {
        toast.error('Error', {description: error.message || error.statusText})
        return
      }

      toast.success('Redirection vers le paiement...')
    } catch (error) {
      console.error('Erreur lors de la mise à niveau Enterprise:', error)
      toast.error('Erreur lors de la mise à niveau vers Enterprise')
    } finally {
      setIsUpgradingEnterprise(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Choisissez votre plan</h1>
        <p className="text-muted-foreground mt-2">
          Sélectionnez le plan qui correspond le mieux à vos besoins
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {/* Carte FREE */}
        <Card className="relative">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Parfait pour commencer</CardDescription>
            <div className="mt-4 text-5xl font-bold">$0</div>
            <div className="text-muted-foreground text-sm">gratuit</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Code snippets illimités
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />5 snippets
                sauvegardés
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Thèmes de base
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Support standard
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Plan actuel
            </Button>
          </CardFooter>
        </Card>

        {/* Carte PRO */}
        <Card className="relative border-yellow-500">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
            <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium text-black">
              Le plus populaire
            </span>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>Pour les utilisateurs réguliers</CardDescription>

            {/* Toggle annuel/mensuel */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <Label className="text-sm">Mensuel</Label>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <div className="flex items-center gap-2">
                <Label className="text-sm">Annuel</Label>
                {isYearly && (
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                    -20%
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 text-5xl font-bold">
              ${isYearly ? totalProYearly : totalProMonthly}
            </div>
            <div className="text-muted-foreground text-sm">
              par {isYearly ? 'an' : 'mois'}
            </div>

            {/* Sélecteur minimaliste de sièges */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-muted-foreground text-xs">
                Utilisateurs:
              </span>
              <Select
                value={seats.toString()}
                onValueChange={(value) => setSeats(parseInt(value))}
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
            {isYearly && (
              <div className="text-sm text-green-500">✨ 2 mois gratuits</div>
            )}
            {seats > 1 && (
              <div className="text-muted-foreground mt-1 text-xs">
                $
                {isYearly
                  ? initialPriceRecaps.proYearly.unitPrice
                  : initialPriceRecaps.proMonthly.unitPrice}{' '}
                par utilisateur
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Code snippets illimités
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Snippets sauvegardés illimités
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Thèmes premium
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Support prioritaire
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Coloration syntaxique personnalisée
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Organisation des snippets
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpgradePro}
              disabled={isUpgradingPro}
              className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
              size="lg"
            >
              {isUpgradingPro ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  S&apos;abonner au Pro {isYearly ? 'Annuel' : 'Mensuel'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Carte ENTERPRISE */}
        <Card className="relative border-purple-500">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
            <span className="rounded-full bg-purple-500 px-3 py-1 text-sm font-medium text-white">
              Enterprise
            </span>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <CardDescription>Pour les grandes organisations</CardDescription>

            {/* Toggle annuel/mensuel */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <Label className="text-sm">Mensuel</Label>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <div className="flex items-center gap-2">
                <Label className="text-sm">Annuel</Label>
                {isYearly && (
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                    -20%
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 text-5xl font-bold">
              ${isYearly ? totalEntrepriseYearly : totalEntrepriseMonthly}
            </div>
            <div className="text-muted-foreground text-sm">
              par {isYearly ? 'an' : 'mois'}
            </div>

            {/* Sélecteur minimaliste de sièges */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-muted-foreground text-xs">
                Utilisateurs:
              </span>
              <Select
                value={seats.toString()}
                onValueChange={(value) => setSeats(parseInt(value))}
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
            {isYearly && (
              <div className="text-sm text-green-500">✨ 2 mois gratuits</div>
            )}
            {seats > 1 && (
              <div className="text-muted-foreground mt-1 text-xs">
                $
                {isYearly
                  ? initialPriceRecaps.entrepriseYearly.unitPrice
                  : initialPriceRecaps.entrepriseMonthly.unitPrice}{' '}
                par utilisateur
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Tout du plan Pro
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Utilisateurs illimités
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Support 24/7 dédié
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                SSO et sécurité avancée
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                API personnalisée
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Formation équipe incluse
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpgradeEnterprise}
              disabled={isUpgradingEnterprise}
              className="w-full bg-purple-500 text-white hover:bg-purple-400"
              size="lg"
            >
              {isUpgradingEnterprise ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  S&apos;abonner à Enterprise {isYearly ? 'Annuel' : 'Mensuel'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="text-muted-foreground mt-8 text-center text-xs">
        Vous serez redirigé vers la page de paiement sécurisée
      </p>
    </div>
  )
}
