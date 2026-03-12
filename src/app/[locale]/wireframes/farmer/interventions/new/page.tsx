'use client'

import {ArrowLeft, Camera, Check, Leaf, Send} from 'lucide-react'
import Link from 'next/link'
import {useState} from 'react'

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
import {Separator} from '@/components/ui/separator'
import {Textarea} from '@/components/ui/textarea'

export default function NewInterventionWireframe() {
  const [step, setStep] = useState(1)
  const [tasks, setTasks] = useState([
    {id: '1', label: 'Tonte de la pelouse', checked: true},
    {id: '2', label: 'Taille des rosiers', checked: false},
    {id: '3', label: 'Désherbage massifs', checked: false},
    {id: '4', label: 'Arrosage', checked: true},
  ])

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? {...t, checked: !t.checked} : t)))
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/fr/wireframes/farmer/dashboard">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-6 w-6 text-stone-600" />
            </Button>
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-900">
            Rapport de Visite
          </h1>
        </div>
        <div className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
          12 Mars
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 p-4">
        {/* Client Selector (Mock) */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 font-bold text-stone-600">
              MD
            </div>
            <div>
              <h2 className="font-bold text-stone-900">Mme. Dupont</h2>
              <p className="text-muted-foreground text-xs">12 Rue des Lilas</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary ml-auto">
              Changer
            </Button>
          </div>
        </div>

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

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed text-stone-500"
                >
                  + Ajouter une tâche
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
            <div className="group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-stone-200">
              {/* Mock Photo Preview */}
              <div className="absolute inset-0 flex items-center justify-center bg-stone-300">
                <span className="text-4xl">🌿</span>
              </div>
              <div className="absolute right-2 bottom-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                14:30
              </div>
            </div>
            <button className="hover:border-primary hover:text-primary hover:bg-primary/5 flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-500 transition-colors">
              <Camera className="mb-2 h-8 w-8" />
              <span className="text-xs font-medium">Ajouter photo</span>
            </button>
          </div>
        </section>

        {/* Note / Conseil */}
        <section className="space-y-3">
          <h3 className="font-heading flex items-center gap-2 font-bold text-stone-800">
            <Leaf className="text-primary h-5 w-5" />
            Note & Conseil
          </h3>
          <Card>
            <CardContent className="p-4">
              <Textarea
                placeholder="Ex: J'ai traité les pucerons sur les rosiers. Pensez à bien arroser ce week-end s'il fait chaud."
                className="min-h-[100px] resize-none border-none p-0 text-base focus-visible:ring-0"
              />
            </CardContent>
          </Card>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="h-14 flex-1 border-stone-200"
          >
            Brouillon
          </Button>
          <Button
            size="lg"
            className="h-14 flex-[2] bg-emerald-600 text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700"
          >
            <Send className="mr-2 h-5 w-5" />
            Envoyer au client
          </Button>
        </div>
      </main>
    </div>
  )
}
