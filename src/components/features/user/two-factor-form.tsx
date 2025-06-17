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
import {Switch} from '@/components/ui/switch'
import {User} from '@/services/types/domain/user-types'

import {update2FAAction} from './action'
import {twoFactorFormSchema} from './two-factor-form-validation'

type FormValues = z.infer<typeof twoFactorFormSchema>

export function TwoFactorForm({user}: {user: User}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [totpURI, setTotpURI] = useState<string>('')

  const form = useForm<FormValues>({
    resolver: zodResolver(twoFactorFormSchema),
    defaultValues: {
      action: user.twoFactorEnabled ? 'disable' : 'enable',
      password: '',
    },
  })

  const selectedAction = form.watch('action')

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    }

    const result = await update2FAAction(undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast('Succès', {
        description: result.message,
      })

      // Si c'est une activation et qu'on a des codes de sauvegarde
      if (selectedAction === 'enable' && result.backupCodes && result.totpURI) {
        setBackupCodes(result.backupCodes)
        setTotpURI(result.totpURI)
        setShowBackupCodes(true)
      }

      // Réinitialiser le formulaire après succès
      form.reset()
      setShowModal(false)
      // Mettre à jour l'action en fonction du nouveau statut
      form.setValue('action', user.twoFactorEnabled ? 'enable' : 'disable')
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

  const handleSwitchChange = (enabled: boolean) => {
    const action = enabled ? 'enable' : 'disable'
    form.setValue('action', action)
    form.setValue('password', '') // Réinitialiser le mot de passe
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    form.reset()
    form.setValue('action', user.twoFactorEnabled ? 'disable' : 'enable')
  }

  const handleBackupCodesClose = () => {
    setShowBackupCodes(false)
    setBackupCodes([])
    setTotpURI('')
  }

  return (
    <>
      <div className="space-y-4">
        <h4 className="text-sm font-medium">
          Authentification à deux facteurs
        </h4>

        {/* Statut actuel avec switch */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Statut actuel</p>
            <p className="text-muted-foreground text-sm">
              {user.twoFactorEnabled
                ? 'Authentification à deux facteurs activée'
                : 'Authentification à deux facteurs désactivée'}
            </p>
          </div>
          <Switch
            checked={user.twoFactorEnabled ?? false}
            onCheckedChange={handleSwitchChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Modal pour le mot de passe */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction === 'enable' ? 'Activer' : 'Désactiver'}{' '}
              l&apos;authentification à deux facteurs
            </DialogTitle>
            <DialogDescription>
              {selectedAction === 'enable'
                ? 'Pour activer l&apos;authentification à deux facteurs, veuillez confirmer votre mot de passe.'
                : 'Pour désactiver l&apos;authentification à deux facteurs, veuillez confirmer votre mot de passe.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Entrez votre mot de passe"
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
                  {isSubmitting
                    ? 'Traitement...'
                    : selectedAction === 'enable'
                      ? 'Activer 2FA'
                      : 'Désactiver 2FA'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal pour les codes de sauvegarde */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configuration 2FA réussie</DialogTitle>
            <DialogDescription>
              Votre authentification à deux facteurs a été activée. Voici vos
              codes de sauvegarde :
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Codes de sauvegarde</h4>
              <p className="text-muted-foreground mb-3 text-sm">
                Conservez ces codes en lieu sûr. Ils vous permettront
                d&apos;accéder à votre compte si vous perdez votre appareil.
              </p>
              <div className="bg-muted grid grid-cols-2 gap-2 rounded-lg p-3">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-background rounded border p-2 text-center font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            {totpURI && (
              <div>
                <h4 className="mb-2 text-sm font-medium">URI TOTP</h4>
                <p className="text-muted-foreground mb-2 text-sm">
                  Utilisez cette URI pour configurer votre application
                  d&apos;authentification :
                </p>
                <div className="bg-muted rounded p-2 font-mono text-xs break-all">
                  {totpURI}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleBackupCodesClose}>
              J&apos;ai noté mes codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function TwoFactorSection({user}: {user: User}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sécurité</h3>
        <p className="text-muted-foreground text-sm">
          Gérez les paramètres de sécurité de votre compte, y compris
          l&apos;authentification à deux facteurs.
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="p-6">
          <TwoFactorForm user={user} />
        </div>
      </div>
    </div>
  )
}
