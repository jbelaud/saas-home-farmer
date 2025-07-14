import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'

import {ApiKeyManagement} from '@/components/features/api-key/api-key-management'
import {getAuthUser} from '@/services/authentication/auth-service'

export default async function ApiKeysPage() {
  const t = await getTranslations('ApiKeysPage')
  const user = await getAuthUser()

  if (!user) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border p-6">
          <ApiKeyManagement />
        </div>
      </div>
    </div>
  )
}
