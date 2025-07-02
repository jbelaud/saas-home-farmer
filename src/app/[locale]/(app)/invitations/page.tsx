'use client'

import {useEffect, useState} from 'react'
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

interface Invitation {
  id: string
  email: string
  role: string
  status: 'accepted' | 'canceled' | 'rejected' | 'pending'
  expiresAt: Date
  organizationId: string
  inviterId: string
  teamId?: string
}

export default function AcceptInvitationPage() {
  const {currentUserOrganization} = useOrganization()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!currentUserOrganization?.organization?.id) {
        setIsLoading(false)
        return
      }

      try {
        const result = await authClient.organization.listInvitations({
          query: {
            organizationId: currentUserOrganization.organization.id,
          },
        })
        setInvitations(result.data || [])
      } catch (error) {
        console.error('Erreur lors du chargement des invitations:', error)
        toast.error('Erreur lors du chargement des invitations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitations()
  }, [currentUserOrganization])

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await authClient.organization.acceptInvitation({
        invitationId,
      })
      setInvitations(invitations.filter((inv) => inv.id !== invitationId))
      toast.success('Invitation acceptée avec succès')
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error)
      toast.error("Erreur lors de l'acceptation de l'invitation")
    }
  }

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await authClient.organization.rejectInvitation({
        invitationId,
      })
      setInvitations(invitations.filter((inv) => inv.id !== invitationId))
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitations </CardTitle>
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
                    Aucune invitation en attente
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
                    <TableCell>
                      {new Date(invitation.expiresAt).toLocaleDateString()}
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
    </div>
  )
}
