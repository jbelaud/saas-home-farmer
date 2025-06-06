import {withAuthAdmin} from '@/components/features/auth/with-auth'

async function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto">
        <h1 className="mb-8 text-2xl font-bold">Administration</h1>
      </div>
    </div>
  )
}
export default withAuthAdmin(AdminPage)
