import {useState} from 'react'
import {toast} from 'sonner'

import {useOrganization} from '@/components/context/organizarion-provider'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const {currentUserOrganization} = useOrganization()
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const {error} = await authClient.organization.acceptInvitation({
        invitationId,
      })
      if (error) {
        toast.error(error.message)
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

  const handleLeaveOrganization = async () => {
    if (!currentUserOrganization?.organization?.id) {
      toast.error('Organisation non trouvée')
      return
    }

    setIsLeaving(true)
    try {
      await authClient.organization.leave({
        organizationId: currentUserOrganization.organization.id,
      })
      toast.success("Vous avez quitté l'organisation avec succès")
      setIsLeaveModalOpen(false)
      // Rediriger vers la page d'accueil ou rafraîchir la page
      window.location.href = '/dashboard'
    } catch (error) {
      console.error("Erreur lors de la sortie de l'organisation:", error)
      toast.error("Erreur lors de la sortie de l'organisation")
    } finally {
      setIsLeaving(false)
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
                      {invitation.status === 'accepted' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setIsLeaveModalOpen(true)}
                        >
                          Quitter l&apos;organisation
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de confirmation pour quitter l'organisation */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter l&apos;organisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir quitter l&apos;organisation{' '}
              <strong>{currentUserOrganization?.organization?.name}</strong> ?
              Cette action est irréversible et vous perdrez l&apos;accès à
              toutes les ressources de l&apos;organisation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLeaveModalOpen(false)}
              disabled={isLeaving}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveOrganization}
              disabled={isLeaving}
            >
              {isLeaving ? 'Sortie en cours...' : "Quitter l'organisation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
