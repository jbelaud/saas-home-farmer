import {toast} from 'sonner'

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
// Composant pour les invitations reçues par l'utilisateur
export default function InvitationsUsers({
  invitations,
  onInvitationUpdate,
}: {
  invitations: PartialInvitationWithUser[]
  onInvitationUpdate: (invitationId: string) => void
}) {
  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const {error} = await authClient.organization.acceptInvitation({
        invitationId,
      })
      console.log(error)
      if (error) {
        toast.error("Erreur lors de l'acceptation de l'invitation", {
          description:
            error.message || error.statusText || 'Une erreur est survenue',
        })
        return
      }
      onInvitationUpdate(invitationId)
      toast.success('Invitation acceptée avec succès')
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error)
      toast.error("Erreur lors de l'acceptation de l'invitation")
    }
  }

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      const {error} = await authClient.organization.rejectInvitation({
        invitationId,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      onInvitationUpdate(invitationId)
      toast.success('Invitation rejetée avec succès')
    } catch (error) {
      console.error("Erreur lors de la réjection de l'invitation:", error)
      toast.error("Erreur lors de la réjection de l'invitation")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invitations reçues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Inviteur</TableHead>
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
                    Aucune invitation reçue
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      {invitation.organization?.name || 'Organisation inconnue'}
                    </TableCell>
                    <TableCell>
                      {invitation.inviter?.name || 'Inviteur inconnue'}
                    </TableCell>

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
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleAcceptInvitation(invitation.id)
                            }
                          >
                            Accepter
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRejectInvitation(invitation.id)
                            }
                          >
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
