'use client'

import {Trash2} from 'lucide-react'
import {useState, useTransition} from 'react'
import {toast} from 'sonner'

import {deleteAdminMemberInvitationAction} from '@/app/[locale]/admin/organizations/actions'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function CancelAdminInvitationButton({
  organizationId,
  invitationId,
  userEmail,
}: {
  organizationId: string
  invitationId: string
  userEmail: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      const res = await deleteAdminMemberInvitationAction(
        organizationId,
        invitationId
      )
      if (res.success) {
        toast.success('Invitation annulée')
        setOpen(false)
      } else {
        toast.error(res.message || "Erreur lors de l'annulation")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
        </DialogHeader>
        <p>
          Voulez-vous vraiment supprimer l&apos;invitation pour{' '}
          <b>{userEmail}</b> ?
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? 'Annulation...' : 'Annuler invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
