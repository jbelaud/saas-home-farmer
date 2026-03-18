import {NextRequest, NextResponse} from 'next/server'

import {getInterventionsByDateRangeWithClientService} from '@/services/facades/intervention-service-facade'

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        {error: 'Paramètres start et end requis'},
        {status: 400}
      )
    }

    const interventions = await getInterventionsByDateRangeWithClientService(
      new Date(start),
      new Date(end)
    )

    return NextResponse.json(interventions)
  } catch (error) {
    console.error('Erreur GET /api/interventions/by-date-range:', error)
    return NextResponse.json({error: 'Erreur serveur'}, {status: 500})
  }
}
