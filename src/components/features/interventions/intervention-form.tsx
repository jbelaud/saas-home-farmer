'use client'

import {useRouter} from 'next/navigation'
import {useLocale} from 'next-intl'
import {useActionState, useEffect} from 'react'
import {toast} from 'sonner'

import {
  createInterventionAction,
  InterventionFormState,
  updateInterventionAction,
} from '@/app/[locale]/(app)/tournees/actions'
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
import {Textarea} from '@/components/ui/textarea'

type ClientOption = {
  id: string
  firstName: string
  lastName: string
}

type InterventionData = {
  id: string
  gardenClientId: string
  scheduledDate: Date
  durationMinutes: number | null
  type: string
  proNotes: string | null
}

type InterventionFormProps = {
  intervention?: InterventionData
  clients: ClientOption[]
  defaultClientId?: string
  onSuccess?: () => void
}

const TYPE_LABELS: Record<string, string> = {
  maintenance: 'Entretien',
  plantation: 'Plantation',
  setup: 'Installation',
  harvest_support: 'Aide récolte',
  consultation: 'Consultation',
}

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 16)
}

export function InterventionForm({
  intervention,
  clients,
  defaultClientId,
  onSuccess,
}: InterventionFormProps) {
  const locale = useLocale()
  const router = useRouter()
  const isEdit = !!intervention

  const action = isEdit
    ? updateInterventionAction.bind(null, intervention.id)
    : createInterventionAction

  const [state, formAction, isPending] = useActionState<
    InterventionFormState,
    FormData
  >(action, {success: false})

  useEffect(() => {
    if (state.success) {
      toast.success(
        isEdit
          ? 'Intervention mise à jour'
          : 'Intervention planifiée avec succès'
      )
      if (onSuccess) onSuccess()
      router.push(`/${locale}/tournees`)
    }
  }, [state.success, isEdit, onSuccess, router, locale])

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gardenClientId">Client *</Label>
            <Select
              name="gardenClientId"
              defaultValue={
                intervention?.gardenClientId ?? defaultClientId ?? ''
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type d&apos;intervention *</Label>
            <Select
              name="type"
              defaultValue={intervention?.type ?? 'maintenance'}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Date et heure *</Label>
            <Input
              id="scheduledDate"
              name="scheduledDate"
              type="datetime-local"
              defaultValue={
                intervention?.scheduledDate
                  ? formatDateForInput(intervention.scheduledDate)
                  : ''
              }
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Durée (min)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              defaultValue={intervention?.durationMinutes ?? ''}
              placeholder="60"
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="proNotes">Notes du professionnel</Label>
            <Textarea
              id="proNotes"
              name="proNotes"
              defaultValue={intervention?.proNotes ?? ''}
              rows={4}
              placeholder="Observations, tâches effectuées, remarques..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          className="h-12 min-w-[200px] bg-emerald-600 hover:bg-emerald-700"
          disabled={isPending}
        >
          {isPending
            ? 'Enregistrement...'
            : isEdit
              ? 'Mettre à jour'
              : 'Planifier'}
        </Button>
      </div>
    </form>
  )
}
