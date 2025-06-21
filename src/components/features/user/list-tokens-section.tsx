'use client'

import {Session} from 'better-auth'
import {formatDistanceToNow} from 'date-fns'
import {fr} from 'date-fns/locale'
import {Copy, Monitor, Smartphone, Trash2} from 'lucide-react'
import {useEffect, useState} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {authClient} from '@/lib/better-auth/auth-client'

export function ListTokensSection() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const {data} = await authClient.listSessions()
      setSessions(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
      toast.error('Impossible de charger les sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setIsDeleting(sessionId)
      await authClient.revokeSession({token: sessionId})
      toast.success('Session révoquée avec succès')
      await loadSessions() // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la révocation:', error)
      toast.error('Impossible de révoquer la session')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token)
      toast.success('Token copié dans le presse-papiers')
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
      toast.error('Impossible de copier le token')
    }
  }

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)
    return isMobile ? (
      <Smartphone className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    )
  }

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Navigateur inconnu'

    // Extraction simplifiée du navigateur
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'

    return 'Navigateur inconnu'
  }

  useEffect(() => {
    loadSessions()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessions actives</CardTitle>
          <CardDescription>
            Gérez vos sessions et tokens d&apos;accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">Chargement des sessions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions actives</CardTitle>
        <CardDescription>
          Gérez vos sessions et tokens d&apos;accès. Vous pouvez révoquer les
          sessions suspectes ou inutilisées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center">
            Aucune session active trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appareil</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Adresse IP
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Token</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Dernière activité
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="flex items-center gap-2">
                      {getDeviceIcon(session.userAgent ?? undefined)}
                      <div>
                        <div className="font-medium">
                          {getDeviceInfo(session.userAgent ?? undefined)}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm md:hidden">
                          <span>{session.ipAddress ?? 'Non disponible'}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 lg:hidden"
                            onClick={() => handleCopyToken(session.token)}
                            title="Copier le token"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="bg-muted rounded px-1 py-0.5 text-sm">
                        {session.ipAddress || 'Non disponible'}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted rounded px-1 py-0.5 text-xs">
                          {session.token.substring(0, 16)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyToken(session.token)}
                          title="Copier le token complet"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={isDeleting === session.id}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {isDeleting === session.id
                          ? 'Révocation...'
                          : 'Révoquer'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" onClick={loadSessions} disabled={isLoading}>
            Actualiser
          </Button>
          <p className="text-muted-foreground text-xs">
            {sessions.length} session(s) active(s)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
