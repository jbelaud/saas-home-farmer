'use client'

import {CheckCircle2} from 'lucide-react'
import {useActionState, useState} from 'react'

import {
  addHarvestAction,
  type AddHarvestState,
} from '@/app/[locale]/client-portal/[token]/actions'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {MARKET_PRICES} from '@/lib/constants/market-prices'

const CROP_CATEGORIES = {
  'Légumes fruits': [
    'Tomates',
    'Tomates cerises',
    'Courgettes',
    'Concombres',
    'Aubergines',
    'Poivrons',
  ],
  'Légumes feuilles': [
    'Laitue',
    'Salade',
    'Épinards',
    'Blettes',
    'Chou',
    'Brocoli',
  ],
  'Légumes racines': [
    'Carottes',
    'Radis',
    'Pommes de terre',
    'Betteraves',
    'Navets',
    'Oignons',
  ],
  'Haricots & pois': ['Haricots verts', 'Petits pois'],
  Fruits: ['Fraises', 'Framboises', 'Groseilles', 'Mûres'],
  Aromatiques: [
    'Basilic',
    'Persil',
    'Ciboulette',
    'Menthe',
    'Thym',
    'Romarin',
    'Coriandre',
  ],
  Autre: ['Courge', 'Potimarron', 'Poireaux', 'Ail', 'Autre'],
}

export function AddHarvestForm({
  token,
  locale,
}: {
  token: string
  locale: string
}) {
  const [selectedCrop, setSelectedCrop] = useState('')

  const boundAction = addHarvestAction.bind(null, token, locale)
  const [state, formAction, isPending] = useActionState<
    AddHarvestState,
    FormData
  >(boundAction, {success: false})

  const pricePerKg = selectedCrop ? (MARKET_PRICES[selectedCrop] ?? 5.0) : 0

  const today = new Date().toISOString().split('T')[0]

  if (state.success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
          <p className="text-lg font-semibold text-emerald-800">
            {state.message}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button
              variant="outline"
              className="border-emerald-300"
              onClick={() => window.location.reload()}
            >
              Ajouter une autre
            </Button>
            <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
              <a href={`/${locale}/client-portal/${token}`}>
                Retour au tableau de bord
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.message}
        </div>
      )}

      {/* Sélection du légume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Qu&apos;avez-vous r&eacute;colt&eacute; ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(CROP_CATEGORIES).map(([category, crops]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-medium text-stone-500 uppercase">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {crops.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedCrop === crop
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <input type="hidden" name="cropName" value={selectedCrop} />
          {state.errors?.find((e) => e.field === 'cropName') && (
            <p className="text-sm text-red-500">
              {state.errors.find((e) => e.field === 'cropName')?.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Poids et date */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            D&eacute;tails de la r&eacute;colte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="weightKg" className="text-sm">
              Poids r&eacute;colt&eacute; (kg)
            </Label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.1"
              min="0.01"
              placeholder="ex: 1.5"
              className="mt-1 h-12 text-base"
              required
            />
            {state.errors?.find((e) => e.field === 'weightKg') && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.find((e) => e.field === 'weightKg')?.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="harvestDate" className="text-sm">
              Date de r&eacute;colte
            </Label>
            <Input
              id="harvestDate"
              name="harvestDate"
              type="date"
              defaultValue={today}
              className="mt-1 h-12 text-base"
              required
            />
          </div>

          {/* Prix indicatif */}
          {selectedCrop && (
            <div className="rounded-lg bg-stone-50 p-3">
              <p className="text-xs text-stone-500">
                Prix bio march&eacute; : {pricePerKg.toFixed(2)} &euro;/kg
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="h-14 w-full bg-emerald-700 text-base hover:bg-emerald-800"
        disabled={isPending || !selectedCrop}
      >
        {isPending ? 'Enregistrement...' : 'Enregistrer la r\u00e9colte'}
      </Button>
    </form>
  )
}
