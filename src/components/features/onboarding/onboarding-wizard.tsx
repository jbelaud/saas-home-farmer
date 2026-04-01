'use client'

import {Check, ChevronRight, Leaf, MapPin} from 'lucide-react'
import {useActionState, useState} from 'react'
import {useFormStatus} from 'react-dom'

import {
  completeOnboardingAction,
  OnboardingFormState,
} from '@/app/[locale]/onboarding/actions'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

const STEPS = ['infos', 'pays', 'confirmation'] as const
type Step = (typeof STEPS)[number]

const COUNTRIES = [
  {
    value: 'FR',
    label: 'France',
    description: 'Module API Fiscale SAP inclus',
    flag: '🇫🇷',
  },
  {
    value: 'BE',
    label: 'Belgique',
    description: 'Sans module fiscal',
    flag: '🇧🇪',
  },
  {
    value: 'CH',
    label: 'Suisse',
    description: 'Sans module fiscal',
    flag: '🇨🇭',
  },
  {
    value: 'OTHER',
    label: 'Autre',
    description: 'Sans module fiscal',
    flag: '🌍',
  },
] as const

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>('infos')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [country, setCountry] = useState<string>('FR')

  const [state, formAction] = useActionState<OnboardingFormState, FormData>(
    completeOnboardingAction,
    {success: false}
  )

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const canProceedFromInfos =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    companyName.trim().length > 0

  const generalError =
    state && !state.success && !state.errors?.length ? state.message : null

  return (
    <div className="flex min-h-svh flex-col bg-stone-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-stone-900">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span>MyHomeFarmer</span>
        </div>
        <span className="text-sm text-stone-500">
          Étape {stepIndex + 1} sur {STEPS.length}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-stone-200">
        <div
          className="bg-primary h-1 transition-all duration-500"
          style={{width: `${progress}%`}}
        />
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        {/* STEP 1 — Infos pro */}
        {step === 'infos' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-stone-900">
                Bienvenue 👋
              </h1>
              <p className="mt-2 text-stone-500">
                Commençons par vos informations professionnelles.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="h-12 text-base"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="h-12 text-base"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de votre activité</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Jean Dupont Jardins"
                  className="h-12 text-base"
                  autoComplete="organization"
                />
                <p className="text-xs text-stone-400">
                  Nom commercial ou nom + prénom si auto-entrepreneur
                </p>
              </div>
            </div>

            <Button
              className="h-12 w-full text-base"
              disabled={!canProceedFromInfos}
              onClick={() => setStep('pays')}
            >
              Continuer
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* STEP 2 — Pays */}
        {step === 'pays' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-stone-900">
                Votre pays d&apos;activité
              </h1>
              <p className="mt-2 text-stone-500">
                Cela détermine votre plan tarifaire et les fonctionnalités
                disponibles.
              </p>
            </div>

            <div className="space-y-3">
              {COUNTRIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCountry(c.value)}
                  className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    country === c.value
                      ? 'border-primary bg-primary/5'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-3xl">{c.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">
                        {c.label}
                      </span>
                      {c.value === 'FR' && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                          API Fiscale
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500">{c.description}</p>
                  </div>
                  {country === c.value && (
                    <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 flex-1"
                onClick={() => setStep('infos')}
              >
                Retour
              </Button>
              <Button
                className="h-12 flex-1 text-base"
                onClick={() => setStep('confirmation')}
              >
                Continuer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — Confirmation */}
        {step === 'confirmation' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-stone-900">
                Tout est prêt ! ✅
              </h1>
              <p className="mt-2 text-stone-500">
                Vérifiez vos informations avant de commencer.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="space-y-4">
                <Row
                  label="Nom complet"
                  value={`${firstName} ${lastName}`}
                  onEdit={() => setStep('infos')}
                />
                <Row
                  label="Activité"
                  value={companyName}
                  onEdit={() => setStep('infos')}
                />
                <Row
                  label="Pays"
                  value={
                    COUNTRIES.find((c) => c.value === country)?.label ?? country
                  }
                  onEdit={() => setStep('pays')}
                />
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium text-stone-500">
                    Plan démarrage
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                    Découverte — Gratuit
                  </span>
                </div>
              </div>
            </div>

            {generalError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {generalError}
              </p>
            )}

            <form action={formAction}>
              <input type="hidden" name="firstName" value={firstName} />
              <input type="hidden" name="lastName" value={lastName} />
              <input type="hidden" name="companyName" value={companyName} />
              <input type="hidden" name="country" value={country} />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1"
                  onClick={() => setStep('pays')}
                >
                  Retour
                </Button>
                <SubmitButton />
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium tracking-wide text-stone-400 uppercase">
          {label}
        </p>
        <p className="font-semibold text-stone-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-primary text-sm underline underline-offset-2"
      >
        Modifier
      </button>
    </div>
  )
}

function SubmitButton() {
  const {pending} = useFormStatus()
  return (
    <Button type="submit" className="h-12 flex-1 text-base" disabled={pending}>
      {pending ? (
        <>
          <span className="mr-2 animate-spin">⏳</span>
          Création en cours…
        </>
      ) : (
        <>
          <MapPin className="mr-2 h-4 w-4" />
          Lancer mon activité
        </>
      )}
    </Button>
  )
}
