import withAuth from '@/components/features/auth/with-auth'
import {InterventionReportForm} from '@/components/features/interventions/intervention-report-form'
import {getGardenClientsByOrganizationService} from '@/services/facades/garden-client-service-facade'

async function Page() {
  const clientsResult = await getGardenClientsByOrganizationService({
    limit: 200,
    offset: 0,
  })

  const clientOptions = clientsResult.data.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    addressStreet: c.addressStreet,
  }))

  return <InterventionReportForm clients={clientOptions} />
}

export default withAuth(Page)
