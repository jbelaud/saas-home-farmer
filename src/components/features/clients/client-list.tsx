'use client'

import {MapPin, Phone, Sun, TreeDeciduous} from 'lucide-react'
import Link from 'next/link'

import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'
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

export function ClientList({clients}: {clients: GardenClientModel[]}) {
  if (clients.length === 0) {
    return null
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <Link key={client.id} href={`/clients/${client.id}`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
                {client.hasTaxAdvantage && (
                  <Badge variant="secondary" className="text-xs">
                    SAP
                  </Badge>
                )}
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
                    {EXPOSURE_LABELS[client.exposure] ?? client.exposure}
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
      ))}
    </div>
  )
}
