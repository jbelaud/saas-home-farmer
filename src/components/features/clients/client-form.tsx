'use client'

import {Camera, X} from 'lucide-react'
import Image from 'next/image'
import {useActionState, useState} from 'react'
import {toast} from 'sonner'

import {
  ClientFormState,
  createGardenClientAction,
  removeGardenPhotoAction,
  updateGardenClientAction,
  uploadGardenPhotoAction,
} from '@/app/[locale]/(app)/clients/actions'
import {useSubscription} from '@/components/hooks/use-subscription'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {FileUpload} from '@/components/ui/file-upload'
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
import {PlanConst} from '@/services/types/domain/subscription-types'

type ClientFormProps = {
  client?: GardenClientModel
  onSuccess?: () => void
}

export function ClientForm({client, onSuccess}: ClientFormProps) {
  const isEdit = !!client
  const {plan} = useSubscription()
  const isRecoltePlan =
    plan === PlanConst.RECOLTE_FR || plan === PlanConst.RECOLTE_EU

  const action = isEdit
    ? updateGardenClientAction.bind(null, client.id)
    : createGardenClientAction

  const [state, formAction, isPending] = useActionState<
    ClientFormState,
    FormData
  >(action, {success: false})

  // Photos du jardin
  const [photos, setPhotos] = useState<string[]>(client?.photoUrls ?? [])
  const [isUploading, setIsUploading] = useState(false)

  if (state.success && onSuccess) {
    onSuccess()
  }

  async function handlePhotoUpload(files: File[]) {
    if (!client?.id || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadGardenPhotoAction(client.id, formData)
        if (result.success && result.imageUrl) {
          const newUrl = result.imageUrl
          setPhotos((prev) => [...prev, newUrl])
          toast('Photo ajoutée')
        } else {
          toast.error(result.message || "Erreur lors de l'upload")
        }
      }
    } catch {
      toast.error("Impossible d'uploader la photo")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRemovePhoto(photoUrl: string) {
    if (!client?.id) return
    const result = await removeGardenPhotoAction(client.id, photoUrl)
    if (result.success) {
      setPhotos((prev) => prev.filter((url) => url !== photoUrl))
      toast('Photo supprimée')
    } else {
      toast.error(result.message || 'Erreur')
    }
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

      {/* Photos du jardin — uniquement en mode édition */}
      {isEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5" />
              Photos du jardin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((url) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={url}
                      alt="Photo du jardin"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(url)}
                      className="absolute top-1 right-1 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FileUpload
              onChange={handlePhotoUpload}
              onlyimage={true}
              multi={true}
              isUploading={isUploading}
            />
            {isUploading && (
              <p className="text-sm text-stone-500">Upload en cours...</p>
            )}
            {!isEdit && (
              <p className="text-sm text-stone-400">
                Les photos pourront être ajoutées après la création du client.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Abonnement client */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyAmount">Montant mensuel (€)</Label>
            <Input
              id="monthlyAmount"
              name="monthlyAmount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={client?.monthlyAmount ?? ''}
              placeholder="150"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surfaceM2">Surface gérée (m²)</Label>
            <Input
              id="surfaceM2"
              name="surfaceM2"
              type="number"
              step="1"
              min="0"
              defaultValue={client?.surfaceM2 ?? ''}
              placeholder="50"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentType">Fréquence de paiement</Label>
            <Select
              name="paymentType"
              defaultValue={client?.paymentType ?? 'monthly'}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="quarterly">Trimestriel</SelectItem>
                <SelectItem value="annual">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Avantage fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fiscalité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch
              id="hasTaxAdvantage"
              name="hasTaxAdvantage"
              defaultChecked={client?.hasTaxAdvantage ?? false}
              value="true"
              disabled={!isRecoltePlan}
            />
            <Label
              htmlFor="hasTaxAdvantage"
              className={!isRecoltePlan ? 'text-stone-400' : ''}
            >
              Crédit d&apos;impôt 50% (Service à la Personne - France)
            </Label>
          </div>
          {!isRecoltePlan && (
            <p className="text-xs text-stone-400">
              Disponible uniquement avec le plan Récolte.
            </p>
          )}
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
