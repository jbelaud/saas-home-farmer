'use client'

import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Leaf,
} from 'lucide-react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useLocale} from 'next-intl'
import {useActionState, useEffect, useMemo, useState} from 'react'
import {toast} from 'sonner'

import {
  completeInterventionAction,
  InterventionFormState,
} from '@/app/[locale]/(app)/tournees/actions'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'

type InterventionReportFormProps = {
  interventionId: string
  gardenClientId: string
  clientName: string
  clientAddress: string
  interventionType: string
  visitFrequencyDays: number
  existingNotes?: string | null
}

const DEFAULT_TASKS = [
  {id: '1', label: 'Tonte de la pelouse', checked: false},
  {id: '2', label: 'Taille des haies / rosiers', checked: false},
  {id: '3', label: 'Désherbage massifs', checked: false},
  {id: '4', label: 'Arrosage', checked: false},
  {id: '5', label: 'Semis / Plantation', checked: false},
  {id: '6', label: 'Amendement / Compost', checked: false},
  {id: '7', label: 'Traitement (pucerons, maladies)', checked: false},
  {id: '8', label: 'Récolte', checked: false},
]

const TYPE_LABELS: Record<string, string> = {
  maintenance: 'Entretien',
  plantation: 'Plantation',
  setup: 'Installation',
  harvest_support: 'Aide récolte',
  consultation: 'Consultation',
}

function formatTodayDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function getDefaultNextVisitDate(frequencyDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + frequencyDays)
  return d.toISOString().slice(0, 10)
}

export function InterventionReportForm({
  interventionId,
  gardenClientId,
  clientName,
  clientAddress,
  interventionType,
  visitFrequencyDays,
  existingNotes,
}: InterventionReportFormProps) {
  const locale = useLocale()
  const router = useRouter()
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [customTask, setCustomTask] = useState('')
  const [nextVisitDate, setNextVisitDate] = useState(
    getDefaultNextVisitDate(visitFrequencyDays)
  )

  const boundAction = useMemo(
    () => completeInterventionAction.bind(null, interventionId, gardenClientId),
    [interventionId, gardenClientId]
  )

  const [state, formAction, isPending] = useActionState<
    InterventionFormState,
    FormData
  >(boundAction, {success: false})

  useEffect(() => {
    if (state.success) {
      toast.success('Visite terminée ! Prochain passage planifié.')
      router.push(`/${locale}/tournees`)
    }
  }, [state.success, router, locale])

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? {...t, checked: !t.checked} : t)))
  }

  const addCustomTask = () => {
    if (!customTask.trim()) return
    setTasks([
      ...tasks,
      {
        id: `custom-${Date.now()}`,
        label: customTask.trim(),
        checked: true,
      },
    ])
    setCustomTask('')
  }

  const initials = clientName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const checkedTasks = tasks.filter((t) => t.checked)
  const checkedTasksText = checkedTasks.map((t) => t.label).join(', ')
  const hasNextVisitDate = nextVisitDate.length > 0

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/tournees`}>
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-lg font-bold">
              Rapport de visite
            </h1>
            <p className="text-xs opacity-80">{formatTodayDate()}</p>
          </div>
        </div>
      </header>

      <form action={formAction}>
        <main className="mx-auto max-w-lg space-y-5 p-4">
          {state.message && !state.success && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{state.message}</p>
            </div>
          )}

          {/* Client card */}
          <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-stone-900">{clientName}</h2>
              <p className="text-xs text-stone-500">{clientAddress}</p>
            </div>
            <div className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
              {TYPE_LABELS[interventionType] ?? interventionType}
            </div>
          </div>

          {/* Tâches Réalisées — big tap targets */}
          <section className="space-y-3">
            <h3 className="font-heading flex items-center gap-2 text-sm font-bold text-stone-800">
              <Check className="text-primary h-4 w-4" />
              Tâches effectuées
            </h3>
            <Card className="border-none shadow-sm">
              <CardContent className="space-y-1 p-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      task.checked ? 'bg-emerald-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <Checkbox
                      id={task.id}
                      checked={task.checked}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none h-6 w-6 border-2"
                    />
                    <span
                      className={`text-sm font-medium ${
                        task.checked ? 'text-stone-900' : 'text-stone-500'
                      }`}
                    >
                      {task.label}
                    </span>
                    {task.checked && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
                    )}
                  </button>
                ))}

                <div className="flex gap-2 px-3 pt-2">
                  <Input
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    placeholder="Autre tâche..."
                    className="h-11"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTask()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0"
                    onClick={addCustomTask}
                  >
                    + Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Photo du résultat */}
          <section className="space-y-3">
            <h3 className="font-heading flex items-center gap-2 text-sm font-bold text-stone-800">
              <Camera className="text-primary h-4 w-4" />
              Photo du jour
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 transition-colors hover:border-emerald-400 hover:text-emerald-600">
                <Camera className="mb-1 h-8 w-8" />
                <span className="text-xs font-medium">Ajouter photo</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              Bientôt disponible. Les photos seront visibles par le client.
            </p>
          </section>

          {/* Note / Conseil */}
          <section className="space-y-3">
            <h3 className="font-heading flex items-center gap-2 text-sm font-bold text-stone-800">
              <Leaf className="text-primary h-4 w-4" />
              Note pour le client
            </h3>
            <Card className="border-none shadow-sm">
              <CardContent className="p-3">
                <Textarea
                  name="proNotes"
                  defaultValue={existingNotes ?? ''}
                  placeholder="Ex: Pucerons traités sur les rosiers. Pensez à arroser ce week-end."
                  className="min-h-[100px] resize-none border-none p-0 text-base focus-visible:ring-0"
                />
              </CardContent>
            </Card>
          </section>

          {/* Prochain passage — OBLIGATOIRE */}
          <section className="space-y-3">
            <h3 className="font-heading flex items-center gap-2 text-sm font-bold text-stone-800">
              <CalendarCheck className="h-4 w-4 text-amber-600" />
              Prochain passage *
            </h3>
            <Card
              className={`border-none shadow-sm ${
                !hasNextVisitDate ? 'ring-2 ring-amber-400 ring-offset-1' : ''
              }`}
            >
              <CardContent className="p-4">
                <Label
                  htmlFor="nextVisitDate"
                  className="mb-2 block text-xs text-stone-500"
                >
                  Quand revenez-vous chez {clientName.split(' ')[0]} ?
                </Label>
                <Input
                  id="nextVisitDate"
                  name="nextVisitDate"
                  type="date"
                  value={nextVisitDate}
                  onChange={(e) => setNextVisitDate(e.target.value)}
                  required
                  className="h-14 text-center text-lg font-bold"
                  min={new Date().toISOString().slice(0, 10)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[7, 14, 21, 28].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        const d = new Date()
                        d.setDate(d.getDate() + days)
                        setNextVisitDate(d.toISOString().slice(0, 10))
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        nextVisitDate === getDefaultNextVisitDate(days)
                          ? 'bg-primary border-primary text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      <Clock className="mr-1 inline h-3 w-3" />
                      {days}j
                    </button>
                  ))}
                </div>
                {visitFrequencyDays && (
                  <p className="mt-2 text-[11px] text-stone-400">
                    Fréquence habituelle : tous les {visitFrequencyDays} jours
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Hidden: tasks summary appended to notes */}
          <input type="hidden" name="tasksSummary" value={checkedTasksText} />
        </main>

        {/* Sticky bottom CTA — dirty hands mode */}
        <div className="fixed right-0 bottom-0 left-0 z-20 border-t bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex max-w-lg gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 flex-1 border-stone-200"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-14 flex-[2] bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700"
              disabled={isPending || !hasNextVisitDate}
            >
              {isPending ? (
                'Enregistrement...'
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Terminer la visite
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
