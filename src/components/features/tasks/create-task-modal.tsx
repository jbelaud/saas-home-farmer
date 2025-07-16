'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import React, {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'

import {createTaskAction} from '@/app/[locale]/(app)/team/[slug]/projects/actions'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'

import {taskFormSchema, TaskFormSchemaType} from './task-form-validation'

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

export function CreateTaskModal({
  projectId,
  organizationId,
  users,
  children,
}: CreateTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormSchemaType>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      assignedTo: 'unassigned',
      organizationId,
      projectId,
    },
  })

  async function onSubmit(data: TaskFormSchemaType) {
    setIsSubmitting(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        // Convertir 'unassigned' en chaîne vide pour le backend
        const finalValue =
          key === 'assignedTo' && value === 'unassigned' ? '' : value

        // Ajouter au FormData même si c'est une chaîne vide (pour assignedTo)
        if (finalValue !== '' || key === 'assignedTo') {
          formData.append(key, finalValue.toString())
        }
      }
    }

    const result = await createTaskAction(projectId, undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Succès', {
        description: result.message,
      })
      form.reset()
      setOpen(false)
    } else {
      // Appliquer les erreurs de validation du serveur
      if (result.errors) {
        for (const error of result.errors) {
          form.setError(error.field as keyof TaskFormSchemaType, {
            type: 'manual',
            message: error.message,
          })
        }
      }
      toast.error('Erreur', {
        description: result.message,
      })
    }
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('organizationId')} />
            <input type="hidden" {...form.register('projectId')} />

            <FormField
              control={form.control}
              name="title"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Développer la fonctionnalité"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la tâche en détail..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="done">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Assigné à</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un utilisateur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Non assigné</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer la tâche'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
