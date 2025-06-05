'use client'
import {Trash2} from 'lucide-react'
import {useState, useTransition} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {removeUserFromOrganizationAction} from './action'

export function RemoveMemberButton({
  organizationId,
  userId,
  userName,
}: {
  organizationId: string
  userId: string
  userName: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await removeUserFromOrganizationAction(organizationId, userId)
      if (res.success) {
        toast.success('Membre supprimé')
        setOpen(false)
      } else {
        toast.error(res.message || 'Erreur lors de la suppression')
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
          Voulez-vous vraiment retirer <b>{userName}</b> de
          l&apos;organisation&nbsp;?
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
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
