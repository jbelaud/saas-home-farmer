import withAuth from '@/components/features/auth/withAuth'
import DashboardPage from '../../../components/features/dashboard/dashboard'

function Page() {
  return <DashboardPage />
}

export default withAuth(Page)
