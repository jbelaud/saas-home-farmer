'use client'

import {ArrowLeft, Camera, Check, Leaf, Send} from 'lucide-react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useLocale} from 'next-intl'
import {useActionState, useEffect, useState} from 'react'
import {toast} from 'sonner'

import {
  createInterventionAction,
  InterventionFormState,
} from '@/app/[locale]/(app)/tournees/actions'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
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
  addressStreet: string | null
}

type InterventionReportFormProps = {
  clients: ClientOption[]
}

const DEFAULT_TASKS = [
  {id: '1', label: 'Tonte de la pelouse', checked: false},
  {id: '2', label: 'Taille des rosiers', checked: false},
  {id: '3', label: 'Désherbage massifs', checked: false},
  {id: '4', label: 'Arrosage', checked: false},
  {id: '5', label: 'Semis / Plantation', checked: false},
  {id: '6', label: 'Amendement / Compost', checked: false},
]

function formatTodayDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export function InterventionReportForm({clients}: InterventionReportFormProps) {
  const locale = useLocale()
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [customTask, setCustomTask] = useState('')

  const [state, formAction, isPending] = useActionState<
    InterventionFormState,
    FormData
  >(createInterventionAction, {success: false})

  useEffect(() => {
    if (state.success) {
      toast.success('Rapport créé avec succès')
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

  const selectedClientData = clients.find((c) => c.id === selectedClient)
  const initials = selectedClientData
    ? `${selectedClientData.firstName[0]}${selectedClientData.lastName[0]}`
    : ''

  const checkedTasksText = tasks
    .filter((t) => t.checked)
    .map((t) => t.label)
    .join(', ')

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/tournees`}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-6 w-6 text-stone-600" />
            </Button>
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-900">
            Rapport de Visite
          </h1>
        </div>
        <div className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
          {formatTodayDate()}
        </div>
      </header>

      <form action={formAction}>
        <main className="mx-auto max-w-lg space-y-6 p-4">
          {state.message && !state.success && (
            <p className="mb-4 text-sm text-red-600">{state.message}</p>
          )}

          {/* Client Selector */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {selectedClientData ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 font-bold text-stone-600">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-stone-900">
                      {selectedClientData.firstName}{' '}
                      {selectedClientData.lastName}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {selectedClientData.addressStreet ?? ''}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-stone-500">
                    Sélectionnez un client
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3">
              <Select
                name="gardenClientId"
                value={selectedClient}
                onValueChange={setSelectedClient}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choisir un client" />
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
          </div>

          {/* Hidden fields for planification */}
          <input
            type="hidden"
            name="scheduledDate"
            value={new Date().toISOString().slice(0, 16)}
          />
          <input type="hidden" name="durationMinutes" value="90" />
          <input type="hidden" name="type" value="maintenance" />

          {/* Tâches Réalisées */}
          <section className="space-y-3">
            <h3 className="font-heading flex items-center gap-2 font-bold text-stone-800">
              <Check className="text-primary h-5 w-5" />
              Tâches effectuées
            </h3>
            <Card>
              <CardContent className="space-y-4 p-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={task.id}
                      checked={task.checked}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary h-6 w-6 border-2"
                    />
                    <label
                      htmlFor={task.id}
                      className={`text-base leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.checked ? 'text-stone-900' : 'text-stone-500'}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Input
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    placeholder="Ajouter une tâche..."
                    className="h-10"
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
                    size="sm"
                    className="shrink-0 border-dashed text-stone-500"
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
            <h3 className="font-heading flex items-center gap-2 font-bold text-stone-800">
              <Camera className="text-primary h-5 w-5" />
              Photo du jour
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-500 transition-colors hover:border-emerald-400 hover:text-emerald-600">
                <Camera className="mb-2 h-8 w-8" />
                <span className="text-xs font-medium">Ajouter photo</span>
              </div>
            </div>
            <p className="text-xs text-stone-400">
              Les photos pourront être ajoutées après la création du rapport.
            </p>
          </section>

          {/* Note / Conseil */}
          <section className="space-y-3">
            <h3 className="font-heading flex items-center gap-2 font-bold text-stone-800">
              <Leaf className="text-primary h-5 w-5" />
              Note &amp; Conseil
            </h3>
            <Card>
              <CardContent className="p-4">
                <Textarea
                  name="proNotes"
                  placeholder="Ex: J'ai traité les pucerons sur les rosiers. Pensez à bien arroser ce week-end s'il fait chaud."
                  className="min-h-[100px] resize-none border-none p-0 text-base focus-visible:ring-0"
                />
              </CardContent>
            </Card>
          </section>

          {/* Hidden: tasks summary in proNotes — append checked tasks */}
          <input type="hidden" name="tasksSummary" value={checkedTasksText} />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              className="h-14 flex-[2] bg-emerald-600 text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700"
              disabled={isPending || !selectedClient}
            >
              <Send className="mr-2 h-5 w-5" />
              {isPending ? 'Envoi...' : 'Envoyer au client'}
            </Button>
          </div>
        </main>
      </form>
    </div>
  )
}
