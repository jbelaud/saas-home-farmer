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
import {useState} from 'react'

import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
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

export default function NewClientWireframe() {
  const [step, setStep] = useState(1)

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-white px-4 py-3">
        <Link href="/fr/wireframes/farmer/dashboard">
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

      <main className="mx-auto max-w-lg p-4">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <User className="text-primary h-5 w-5" />
                Infos Personnelles
              </h2>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input
                      id="firstname"
                      placeholder="Ex: Jean"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input
                      id="lastname"
                      placeholder="Ex: Dupont"
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
                      type="email"
                      placeholder="jean.dupont@email.com"
                      className="h-12 pl-10 text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="h-14 w-full text-lg"
              onClick={nextStep}
            >
              Suivant
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <MapPin className="text-primary h-5 w-5" />
                Adresse & Accès
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse du chantier</Label>
                  <Textarea
                    id="address"
                    placeholder="12 Rue des Lilas, 75000 Paris"
                    className="min-h-[80px] text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access">Code / Interphone</Label>
                  <Input
                    id="access"
                    placeholder="Ex: Bât A, 3ème étage, Code 1234"
                    className="h-12"
                  />
                </div>

                <Button
                  variant="outline"
                  className="hover:text-primary hover:border-primary hover:bg-primary/5 h-12 w-full border-2 border-dashed text-stone-500"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Géolocaliser ma position
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <Home className="text-primary h-5 w-5" />
                Le Potager
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="50"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expo">Exposition</Label>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sud">Sud (Plein soleil)</SelectItem>
                      <SelectItem value="mi-ombre">Mi-ombre</SelectItem>
                      <SelectItem value="nord">Nord (Ombre)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sol">Type de sol</Label>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="argileux">Argileux (Lourd)</SelectItem>
                      <SelectItem value="limoneux">Limoneux (Riche)</SelectItem>
                      <SelectItem value="sableux">Sableux (Léger)</SelectItem>
                      <SelectItem value="calcaire">Calcaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eau">Point d&apos;eau</Label>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="robinet">Robinet extérieur</SelectItem>
                      <SelectItem value="recuperateur">Récupérateur</SelectItem>
                      <SelectItem value="puits">Puits / Forage</SelectItem>
                      <SelectItem value="aucun">Aucun (Arrosoir)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-14 flex-1"
                onClick={prevStep}
              >
                Retour
              </Button>
              <Button
                size="lg"
                className="h-14 flex-1 text-lg"
                onClick={nextStep}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <Camera className="text-primary h-5 w-5" />
                État des lieux
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez une photo du jardin pour le dossier.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button className="hover:border-primary hover:text-primary hover:bg-primary/5 flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-500 transition-colors">
                  <Camera className="mb-2 h-8 w-8" />
                  <span className="text-xs font-medium">Prendre photo</span>
                </button>
                <div className="flex aspect-square items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                  <span className="text-xs">Vide</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-stone-800">
                <FileText className="text-primary h-5 w-5" />
                Notes & Contraintes
              </h2>
              <Textarea
                placeholder="Chien méchant ? Point d'eau ? Demandes spécifiques..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-14 flex-1"
                onClick={prevStep}
              >
                Retour
              </Button>
              <Button
                size="lg"
                className="h-14 flex-[2] bg-emerald-600 text-lg hover:bg-emerald-700"
              >
                <Check className="mr-2 h-5 w-5" />
                Créer le client
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
