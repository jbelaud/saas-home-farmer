'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import {z} from 'zod'

import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {User} from '@/services/types/domain/user-types'

import {changeEmailAction} from './action'
import {changeEmailFormSchema} from './user-form-validation'

type FormValues = z.infer<typeof changeEmailFormSchema>

export function ChangeEmailForm({user}: {user: User}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(changeEmailFormSchema),
    defaultValues: {
      newEmail: '',
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    }

    const result = await changeEmailAction(undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast('Succès', {
        description: result.message,
      })

      // Réinitialiser le formulaire après succès
      form.reset()
      setShowModal(false)
    } else {
      for (const error of result?.errors ?? []) {
        form.setError(error.field as never, {
          type: 'manual',
          message: error.message,
        })
      }
      toast('Erreur', {
        description: result.message,
      })
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    form.reset()
  }

  return (
    <>
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Changement d&apos;email</h4>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Adresse email actuelle</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            disabled={isSubmitting}
          >
            Changer l&apos;email
          </Button>
        </div>
      </div>

      {/* Modal pour le changement d'email */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer l&apos;adresse email</DialogTitle>
            <DialogDescription>
              Pour changer votre adresse email, veuillez saisir votre nouvelle
              adresse email. Un email de vérification sera envoyé à votre
              adresse actuelle.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newEmail"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nouvelle adresse email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nouveau@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Changement en cours...' : "Changer l'email"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
