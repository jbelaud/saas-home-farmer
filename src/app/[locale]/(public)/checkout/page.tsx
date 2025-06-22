'use client'

import {CreditCard, Loader2} from 'lucide-react'
import {useState} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {authClient} from '@/lib/better-auth/auth-client'

export default function Page() {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true)

      await authClient.subscription.upgrade({
        plan: 'pro',
        successUrl: '/dashboard',
        cancelUrl: '/pricing',
        annual: true, // Optional: upgrade to an annual plan
        //referenceId: 'org_123', // Optional: defaults to the current logged in user ID
        seats: 5, // Optional: for team plans
      })

      // Si on arrive ici, la redirection n'a pas eu lieu immédiatement
      toast.success('Redirection vers le paiement...')
    } catch (error) {
      console.error('Erreur lors de la mise à niveau:', error)
      toast.error('Erreur lors de la mise à niveau de l&apos;abonnement')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Mise à niveau de l&apos;abonnement
          </CardTitle>
          <CardDescription>
            Passez au plan Pro pour accéder à toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Plan Pro - Annuel</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• 5 sièges inclus</li>
              <li>• Fonctionnalités avancées</li>
              <li>• Support prioritaire</li>
              <li>• Économie de 2 mois avec le plan annuel</li>
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full"
            size="lg"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirection en cours...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Mettre à niveau vers Pro
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Vous serez redirigé vers la page de paiement sécurisée
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
