import withAuth from '@/components/features/auth/with-auth'
import {ClientFormWizard} from '@/components/features/clients/client-form-wizard'

function Page() {
  return <ClientFormWizard />
}

export default withAuth(Page)
