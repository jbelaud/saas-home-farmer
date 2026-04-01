'use client'

import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useLocale} from 'next-intl'
import {useActionState, useEffect, useState} from 'react'
import {toast} from 'sonner'

import {
  ClientFormState,
  createGardenClientAction,
} from '@/app/[locale]/(app)/clients/actions'
import {useSubscription} from '@/components/hooks/use-subscription'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Switch} from '@/components/ui/switch'
import {Textarea} from '@/components/ui/textarea'
import {PlanConst} from '@/services/types/domain/subscription-types'

export function ClientFormWizard() {
  const locale = useLocale()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const {plan} = useSubscription()
  const isRecoltePlan =
    plan === PlanConst.RECOLTE_FR || plan === PlanConst.RECOLTE_EU

  const [state, formAction, isPending] = useActionState<
    ClientFormState,
    FormData
  >(createGardenClientAction, {success: false})

  useEffect(() => {
    if (state.success) {
      toast.success('Client créé avec succès')
      router.push(`/${locale}/clients`)
    }
  }, [state.success, router, locale])

  const nextStep = () => setStep((s) => Math.min(s + 1, 3))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-white px-4 py-3">
        <Link href={`/${locale}/clients`}>
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="h-6 w-6 text-stone-600" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-lg font-bold text-stone-900">
            Nouveau Client
          </h1>
          <div className="mt-1 flex gap-1">
            <div
              className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-stone-200'}`}
            />
            <div
              className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-stone-200'}`}
            />
            <div
              className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-stone-200'}`}
            />
          </div>
        </div>
      </header>

      <form action={formAction}>
        <main className="mx-auto max-w-lg p-4">
          {state.message && !state.success && (
            <p className="mb-4 text-sm text-red-600">{state.message}</p>
          )}

          {/* Step 1: Infos Personnelles */}
          <div
            className={
              step === 1
                ? 'animate-in fade-in slide-in-from-right-4 space-y-6 duration-300'
                : 'hidden'
            }
          >
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <User className="text-primary h-5 w-5" />
                Infos Personnelles
              </h2>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Ex: Jean"
                      required
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Ex: Dupont"
                      required
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      className="h-12 pl-10 text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (pour factures)</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jean.dupont@email.com"
                      className="h-12 pl-10 text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className="h-14 w-full text-lg"
              onClick={nextStep}
            >
              Suivant
            </Button>
          </div>

          {/* Step 2: Adresse & Potager */}
          <div
            className={
              step === 2
                ? 'animate-in fade-in slide-in-from-right-4 space-y-6 duration-300'
                : 'hidden'
            }
          >
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <MapPin className="text-primary h-5 w-5" />
                Adresse &amp; Accès
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressStreet">Adresse du chantier *</Label>
                  <Input
                    id="addressStreet"
                    name="addressStreet"
                    placeholder="12 Rue des Lilas"
                    required
                    className="h-12 text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity">Ville *</Label>
                    <Input
                      id="addressCity"
                      name="addressCity"
                      placeholder="Paris"
                      required
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressZip">Code postal *</Label>
                    <Input
                      id="addressZip"
                      name="addressZip"
                      placeholder="75000"
                      required
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessDigicode">Code / Interphone</Label>
                  <Input
                    id="accessDigicode"
                    name="accessDigicode"
                    placeholder="Ex: Bât A, 3ème étage, Code 1234"
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <Home className="text-primary h-5 w-5" />
                Le Potager
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surfaceSqm">Surface (m²)</Label>
                  <Input
                    id="surfaceSqm"
                    name="surfaceSqm"
                    type="number"
                    placeholder="50"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exposure">Exposition</Label>
                  <Select name="exposure">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_sun">
                        Sud (Plein soleil)
                      </SelectItem>
                      <SelectItem value="partial_shade">Mi-ombre</SelectItem>
                      <SelectItem value="full_shade">Nord (Ombre)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Type de sol</Label>
                  <Select name="soilType">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Argileux (Lourd)</SelectItem>
                      <SelectItem value="loamy">Limoneux (Riche)</SelectItem>
                      <SelectItem value="sandy">Sableux (Léger)</SelectItem>
                      <SelectItem value="chalky">Calcaire</SelectItem>
                      <SelectItem value="peaty">Tourbeux</SelectItem>
                      <SelectItem value="silty">Silteux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Point d&apos;eau</Label>
                  <div className="flex h-12 items-center gap-3">
                    <Switch
                      id="hasWaterAccess"
                      name="hasWaterAccess"
                      value="true"
                    />
                    <Label htmlFor="hasWaterAccess" className="text-sm">
                      Oui
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 flex-1"
                onClick={prevStep}
              >
                Retour
              </Button>
              <Button
                type="button"
                size="lg"
                className="h-14 flex-1 text-lg"
                onClick={nextStep}
              >
                Suivant
              </Button>
            </div>
          </div>

          {/* Step 3: Notes, Photos & Validation */}
          <div
            className={
              step === 3
                ? 'animate-in fade-in slide-in-from-right-4 space-y-6 duration-300'
                : 'hidden'
            }
          >
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <Camera className="text-primary h-5 w-5" />
                État des lieux
              </h2>
              <p className="text-muted-foreground text-sm">
                Les photos pourront être ajoutées après la création du client.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400">
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8" />
                    <span className="text-xs font-medium">
                      Disponible après création
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <FileText className="text-primary h-5 w-5" />
                Notes &amp; Contraintes
              </h2>
              <Textarea
                name="accessNotes"
                placeholder="Chien méchant ? Point d'eau ? Demandes spécifiques..."
                className="min-h-[100px]"
              />
            </div>

            {/* Fiscalité */}
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                Fiscalité
              </h2>
              <div className="flex items-center gap-3">
                <Switch
                  id="hasTaxAdvantage"
                  name="hasTaxAdvantage"
                  value="true"
                  disabled={!isRecoltePlan}
                />
                <Label
                  htmlFor="hasTaxAdvantage"
                  className={!isRecoltePlan ? 'text-stone-400' : ''}
                >
                  Crédit d&apos;impôt 50% (Service à la Personne)
                </Label>
              </div>
              {!isRecoltePlan && (
                <p className="text-xs text-stone-400">
                  Disponible uniquement avec le plan Récolte.
                </p>
              )}
            </div>

            {/* Hidden fields for remaining unused fields */}
            <input type="hidden" name="accessPortalCode" value="" />
            <input type="hidden" name="accessKeyLocation" value="" />
            <input type="hidden" name="waterAccessNotes" value="" />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 flex-1"
                onClick={prevStep}
              >
                Retour
              </Button>
              <Button
                type="submit"
                size="lg"
                className="h-14 flex-[2] bg-emerald-600 text-lg hover:bg-emerald-700"
                disabled={isPending}
              >
                <Check className="mr-2 h-5 w-5" />
                {isPending ? 'Création...' : 'Créer le client'}
              </Button>
            </div>
          </div>
        </main>
      </form>
    </div>
  )
}
