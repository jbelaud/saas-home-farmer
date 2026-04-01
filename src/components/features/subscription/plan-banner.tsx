import {ArrowRight, Lock, Users} from 'lucide-react'
import Link from 'next/link'

import {Button} from '@/components/ui/button'
import {getPlanByCodeDao} from '@/db/repositories/subscription-repository'
import {getActiveSubscriptions} from '@/services/authentication/auth-service'

type PlanBannerProps = {
  organizationId: string
  clientsCount: number
  locale: string
}

export async function PlanBanner({
  organizationId,
  clientsCount,
  locale,
}: PlanBannerProps) {
  const subscriptions = await getActiveSubscriptions(organizationId)
  const activeSub = subscriptions?.[0] as {plan: string} | undefined
  const planCode = activeSub?.plan ?? 'graine'

  const plan = await getPlanByCodeDao(planCode)
  const limits = plan?.limits as Record<string, number> | null
  const clientLimit = limits?.clients ?? 1

  const isUnlimited = clientLimit === -1
  const planName = plan?.planName ?? 'Découverte'
  const isGraine = planCode === 'graine'
  const isPousse = planCode === 'pousse'

  const usagePercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((clientsCount / clientLimit) * 100))
  const isAtLimit = !isUnlimited && clientsCount >= clientLimit
  const isNearLimit = !isUnlimited && !isAtLimit && usagePercent >= 80

  if (isUnlimited) return null

  return (
    <div
      className={`rounded-xl border p-4 ${
        isAtLimit
          ? 'border-red-200 bg-red-50'
          : isNearLimit
            ? 'border-amber-200 bg-amber-50'
            : 'border-stone-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isAtLimit
                ? 'bg-red-100'
                : isNearLimit
                  ? 'bg-amber-100'
                  : 'bg-stone-100'
            }`}
          >
            {isAtLimit ? (
              <Lock
                className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`}
              />
            ) : (
              <Users className="h-4 w-4 text-stone-500" />
            )}
          </div>

          <div>
            <p
              className={`text-sm font-semibold ${
                isAtLimit
                  ? 'text-red-800'
                  : isNearLimit
                    ? 'text-amber-800'
                    : 'text-stone-700'
              }`}
            >
              Plan {planName}
              {isAtLimit && ' — Limite atteinte'}
              {isNearLimit && ' — Bientôt la limite'}
            </p>
            <p
              className={`mt-0.5 text-xs ${
                isAtLimit
                  ? 'text-red-600'
                  : isNearLimit
                    ? 'text-amber-600'
                    : 'text-stone-500'
              }`}
            >
              {clientsCount} / {clientLimit} client
              {clientLimit > 1 ? 's' : ''}
              {isAtLimit &&
                (isGraine
                  ? " — Passez au plan Essentiel pour ajouter jusqu'à 20 clients"
                  : isPousse
                    ? ' — Passez au plan Entreprise pour des clients illimités'
                    : '')}
            </p>

            {/* Barre de progression */}
            <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full rounded-full transition-all ${
                  isAtLimit
                    ? 'bg-red-500'
                    : isNearLimit
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                }`}
                style={{width: `${usagePercent}%`}}
              />
            </div>
          </div>
        </div>

        {(isAtLimit || isNearLimit) && (
          <Button
            asChild
            size="sm"
            className={`shrink-0 ${
              isAtLimit
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600'
            } text-white`}
          >
            <Link href={`/${locale}/billing`}>
              Upgrader
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
