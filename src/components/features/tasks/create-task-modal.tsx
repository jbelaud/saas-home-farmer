'use client'

import React, {useActionState, useState} from 'react'

import {
  createTaskAction,
  FormState,
} from '@/app/[locale]/(app)/team/[slug]/projects/actions'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {TaskStatus} from '@/services/types/domain/project-types'

type User = {
  id: string
  name: string | null
  email: string
}

type CreateTaskModalProps = {
  projectId: string
  organizationId: string
  users: User[]
  children: React.ReactNode
}

const initialState: FormState = {
  success: false,
}

export function CreateTaskModal({
  projectId,
  organizationId,
  users,
  children,
}: CreateTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('todo')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('unassigned')

  const createTaskWithProjectId = createTaskAction.bind(null, projectId)
  const [state, formAction, isPending] = useActionState(
    createTaskWithProjectId,
    initialState
  )

  // Fermer la modal et réinitialiser le state si création réussie
  if (state.success && open) {
    setOpen(false)
    setSelectedStatus('todo')
    setSelectedAssignee('unassigned')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle tâche</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle tâche à votre projet. Remplissez les
            informations ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="status" value={selectedStatus} />
            <input
              type="hidden"
              name="assignedTo"
              value={selectedAssignee === 'unassigned' ? '' : selectedAssignee}
            />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titre *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Développer la fonctionnalité"
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Décrivez la tâche en détail..."
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as TaskStatus)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">
                Assigné à
              </Label>
              <Select
                value={selectedAssignee}
                onValueChange={setSelectedAssignee}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Non assigné</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state.errors && (
              <div className="col-span-4 text-sm text-red-600">
                {state.errors.map((error, index) => (
                  <p key={index}>{error.message}</p>
                ))}
              </div>
            )}

            {state.message && !state.success && (
              <div className="col-span-4 text-sm text-red-600">
                {state.message}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Création...' : 'Créer la tâche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
