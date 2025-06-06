import {getAdminDashboardStatsDal} from '@/app/dal/admin-dashboard-dal'
import {AdminDashboard} from '@/components/features/admin/dashboard/admin-dashboard'

export default async function AdminDashboardContent() {
  const stats = await getAdminDashboardStatsDal()

  return <AdminDashboard stats={stats} />
}
