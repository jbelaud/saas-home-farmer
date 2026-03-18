'use client'

import {useActionState} from 'react'

import {
  ClientFormState,
  createGardenClientAction,
  updateGardenClientAction,
} from '@/app/[locale]/(app)/clients/actions'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
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
import {GardenClientModel} from '@/db/models/farmer-model'

type ClientFormProps = {
  client?: GardenClientModel
  onSuccess?: () => void
}

export function ClientForm({client, onSuccess}: ClientFormProps) {
  const isEdit = !!client

  const action = isEdit
    ? updateGardenClientAction.bind(null, client.id)
    : createGardenClientAction

  const [state, formAction, isPending] = useActionState<
    ClientFormState,
    FormData
  >(action, {success: false})

  if (state.success && onSuccess) {
    onSuccess()
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={client?.firstName ?? ''}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={client?.lastName ?? ''}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email ?? ''}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={client?.phone ?? ''}
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Adresse du potager */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adresse du potager</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-full space-y-2">
            <Label htmlFor="addressStreet">Rue *</Label>
            <Input
              id="addressStreet"
              name="addressStreet"
              defaultValue={client?.addressStreet ?? ''}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressCity">Ville *</Label>
            <Input
              id="addressCity"
              name="addressCity"
              defaultValue={client?.addressCity ?? ''}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressZip">Code postal *</Label>
            <Input
              id="addressZip"
              name="addressZip"
              defaultValue={client?.addressZip ?? ''}
              required
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Détails du terrain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails du terrain</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="surfaceSqm">Surface (m²)</Label>
            <Input
              id="surfaceSqm"
              name="surfaceSqm"
              type="number"
              step="0.1"
              defaultValue={client?.surfaceSqm ?? ''}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exposure">Exposition</Label>
            <Select name="exposure" defaultValue={client?.exposure ?? ''}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_sun">Plein soleil</SelectItem>
                <SelectItem value="partial_shade">Mi-ombre</SelectItem>
                <SelectItem value="full_shade">Ombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="soilType">Type de sol</Label>
            <Select name="soilType" defaultValue={client?.soilType ?? ''}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clay">Argileux</SelectItem>
                <SelectItem value="sandy">Sablonneux</SelectItem>
                <SelectItem value="loamy">Limoneux</SelectItem>
                <SelectItem value="chalky">Calcaire</SelectItem>
                <SelectItem value="peaty">Tourbeux</SelectItem>
                <SelectItem value="silty">Silteux</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="hasWaterAccess"
              name="hasWaterAccess"
              defaultChecked={client?.hasWaterAccess ?? false}
              value="true"
            />
            <Label htmlFor="hasWaterAccess">Accès à l&apos;eau</Label>
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="waterAccessNotes">Notes accès eau</Label>
            <Textarea
              id="waterAccessNotes"
              name="waterAccessNotes"
              defaultValue={client?.waterAccessNotes ?? ''}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations d'accès */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations d&apos;accès</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accessDigicode">Digicode</Label>
            <Input
              id="accessDigicode"
              name="accessDigicode"
              defaultValue={client?.accessDigicode ?? ''}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessPortalCode">Code portail</Label>
            <Input
              id="accessPortalCode"
              name="accessPortalCode"
              defaultValue={client?.accessPortalCode ?? ''}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessKeyLocation">Emplacement clé</Label>
            <Input
              id="accessKeyLocation"
              name="accessKeyLocation"
              defaultValue={client?.accessKeyLocation ?? ''}
              className="h-12"
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="accessNotes">Notes d&apos;accès</Label>
            <Textarea
              id="accessNotes"
              name="accessNotes"
              defaultValue={client?.accessNotes ?? ''}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Avantage fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fiscalité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              id="hasTaxAdvantage"
              name="hasTaxAdvantage"
              defaultChecked={client?.hasTaxAdvantage ?? false}
              value="true"
            />
            <Label htmlFor="hasTaxAdvantage">
              Crédit d&apos;impôt 50% (Service à la Personne - France)
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          className="h-12 min-w-[200px]"
          disabled={isPending}
        >
          {isPending
            ? 'Enregistrement...'
            : isEdit
              ? 'Mettre à jour'
              : 'Créer le client'}
        </Button>
      </div>
    </form>
  )
}
