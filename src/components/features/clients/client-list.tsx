'use client'

import {
  Check,
  MapPin,
  Palette,
  Phone,
  Search,
  Sun,
  TreeDeciduous,
  X,
} from 'lucide-react'
import Link from 'next/link'
import {useCallback, useMemo, useState, useTransition} from 'react'

import {updateClientCardColorAction} from '@/app/[locale]/(app)/clients/actions'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {GardenClientModel} from '@/db/models/farmer-model'

const EXPOSURE_LABELS: Record<string, string> = {
  full_sun: 'Plein soleil',
  partial_shade: 'Mi-ombre',
  full_shade: 'Ombre',
}

const SOIL_LABELS: Record<string, string> = {
  clay: 'Argileux',
  sandy: 'Sablonneux',
  loamy: 'Limoneux',
  chalky: 'Calcaire',
  peaty: 'Tourbeux',
  silty: 'Silteux',
}

const PRESET_COLORS = [
  {label: 'Vert', value: '#dcfce7', border: '#86efac'},
  {label: 'Bleu', value: '#dbeafe', border: '#93c5fd'},
  {label: 'Jaune', value: '#fef9c3', border: '#fde047'},
  {label: 'Orange', value: '#ffedd5', border: '#fdba74'},
  {label: 'Rose', value: '#fce7f3', border: '#f9a8d4'},
  {label: 'Violet', value: '#f3e8ff', border: '#d8b4fe'},
  {label: 'Rouge', value: '#fee2e2', border: '#fca5a5'},
  {label: 'Menthe', value: '#d1fae5', border: '#6ee7b7'},
]

function ColorPicker({
  clientId,
  currentColor,
  onColorChange,
}: {
  clientId: string
  currentColor: string | null
  onColorChange: (clientId: string, color: string | null) => void
}) {
  const [isPending, startTransition] = useTransition()

  const handleColorSelect = (color: string | null) => {
    onColorChange(clientId, color)
    startTransition(async () => {
      await updateClientCardColorAction(clientId, color)
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={(e) => e.preventDefault()}
          disabled={isPending}
        >
          <Palette className="h-3.5 w-3.5 text-stone-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3"
        align="end"
        onClick={(e) => e.preventDefault()}
      >
        <p className="mb-2 text-xs font-bold text-stone-500 uppercase">
          Couleur de la carte
        </p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color.value,
                borderColor: color.border,
              }}
              title={color.label}
              onClick={() => handleColorSelect(color.value)}
            >
              {currentColor === color.value && (
                <Check className="h-3.5 w-3.5 text-stone-700" />
              )}
            </button>
          ))}
        </div>
        {currentColor && (
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-center gap-1 rounded px-2 py-1 text-xs text-stone-500 hover:bg-stone-100"
            onClick={() => handleColorSelect(null)}
          >
            <X className="h-3 w-3" />
            Retirer la couleur
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function ClientList({clients}: {clients: GardenClientModel[]}) {
  const [search, setSearch] = useState('')
  const [localColors, setLocalColors] = useState<Record<string, string | null>>(
    () => {
      const map: Record<string, string | null> = {}
      for (const c of clients) {
        if (c.cardColor) map[c.id] = c.cardColor
      }
      return map
    }
  )

  const handleColorChange = useCallback(
    (clientId: string, color: string | null) => {
      setLocalColors((prev) => ({...prev, [clientId]: color}))
    },
    []
  )

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase().trim()
    return clients.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.addressCity.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [clients, search])

  if (clients.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          type="search"
          placeholder="Rechercher un client (nom, ville, tél\u2026)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-10 text-base"
        />
        {search && (
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            onClick={() => setSearch('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filteredClients.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          Aucun client ne correspond à &laquo; {search} &raquo;
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const color =
              localColors[client.id] !== undefined
                ? localColors[client.id]
                : client.cardColor

            return (
              <div key={client.id} className="relative">
                <Link href={`/clients/${client.id}`}>
                  <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    style={color ? {backgroundColor: color} : undefined}
                  >
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-semibold">
                            {client.firstName} {client.lastName}
                          </p>
                          {client.phone && (
                            <p className="flex items-center gap-1 text-sm text-stone-500">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {client.hasTaxAdvantage && (
                            <Badge variant="secondary" className="text-xs">
                              SAP
                            </Badge>
                          )}
                          <ColorPicker
                            clientId={client.id}
                            currentColor={color ?? null}
                            onColorChange={handleColorChange}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-stone-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {client.addressStreet}, {client.addressZip}{' '}
                          {client.addressCity}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {client.surfaceSqm && (
                          <Badge variant="outline" className="text-xs">
                            {client.surfaceSqm} m²
                          </Badge>
                        )}
                        {client.exposure && (
                          <Badge variant="outline" className="text-xs">
                            <Sun className="mr-1 h-3 w-3" />
                            {EXPOSURE_LABELS[client.exposure] ??
                              client.exposure}
                          </Badge>
                        )}
                        {client.soilType && (
                          <Badge variant="outline" className="text-xs">
                            <TreeDeciduous className="mr-1 h-3 w-3" />
                            {SOIL_LABELS[client.soilType] ?? client.soilType}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
