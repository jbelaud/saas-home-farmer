import {useEffect, useState} from 'react'
import {toast} from 'sonner'

import {useOrganization} from '@/components/context/organizarion-provider'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {authClient} from '@/lib/better-auth/auth-client'
import {formatDate} from '@/lib/helper/date-helper'

import {PartialInvitationWithUser} from './invitations-content'

// Composant pour les invitations envoyées par l'organisation
export default function InvitationsOrganization() {
  const {currentUserOrganization} = useOrganization()
  const [invitations, setInvitationsOrganization] = useState<
    PartialInvitationWithUser[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!currentUserOrganization?.organization?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Récupérer les invitations envoyées par l'organisation (pour les owners)

        const result = await authClient.organization.listInvitations({
          query: {
            organizationId: currentUserOrganization.organization.id,
          },
        })
        setInvitationsOrganization(result.data || [])
      } catch (error) {
        console.error('Erreur lors du chargement des invitations:', error)
        toast.error('Erreur lors du chargement des invitations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitations()
  }, [currentUserOrganization])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement des invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veuillez patienter pendant le chargement des invitations...</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Invitations envoyées par {currentUserOrganization?.organization?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d&apos;expiration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Aucune invitation envoyée
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invitation.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{invitation.status}</Badge>
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {formatDate(new Date(invitation.expiresAt ?? new Date()))}
                  </TableCell>
                  <TableCell>
                    {invitation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          En attente
                        </Button>
                      </div>
                    )}
                    {invitation.status === 'accepted' && (
                      <Badge variant="default" className="text-xs">
                        Acceptée
                      </Badge>
                    )}
                    {invitation.status === 'rejected' && (
                      <Badge variant="destructive" className="text-xs">
                        Rejetée
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
