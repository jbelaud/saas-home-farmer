'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import Image from 'next/image'
import QRCode from 'qrcode'
import {useEffect, useState} from 'react'
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

import {
  update2FAAction,
  updateUserSettingsAction,
  verifyTotpAction,
} from './action'
import {twoFactorFormSchema} from './two-factor-form-validation'

type FormValues = z.infer<typeof twoFactorFormSchema>

export function TwoFactorForm({user}: {user: User}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [totpURI, setTotpURI] = useState<string>('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [validationCode, setValidationCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isUpdatingType, setIsUpdatingType] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(twoFactorFormSchema),
    defaultValues: {
      action: user.twoFactorEnabled ? 'disable' : 'enable',
      password: '',
    },
  })

  const selectedAction = form.watch('action')

  // Générer le QR code quand l'URI TOTP est disponible
  useEffect(() => {
    if (totpURI) {
      QRCode.toDataURL(totpURI, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((dataUrl) => {
          setQrCodeDataUrl(dataUrl)
          return dataUrl
        })
        .catch((err) => {
          console.error('Erreur lors de la génération du QR code:', err)
        })
    }
  }, [totpURI])

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

  // Nouvelle fonction pour changer le type de 2FA
  const handleChangeTwoFactorType = async (type: 'otp' | 'totp') => {
    if (!user.twoFactorEnabled) {
      toast('Erreur', {
        description:
          "Vous devez d'abord activer l'authentification à deux facteurs",
      })
      return
    }

    setIsUpdatingType(true)
    const formData = new FormData()
    formData.append('twoFactorType', type)

    const result = await updateUserSettingsAction(undefined, formData)
    setIsUpdatingType(false)

    if (result.success) {
      toast('Succès', {
        description: `Type de 2FA changé vers ${type.toUpperCase()}`,
      })
    } else {
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
    setQrCodeDataUrl('')
  }

  const handleValidateCode = async () => {
    if (!validationCode.trim()) {
      toast('Erreur', {
        description: 'Veuillez saisir un code de validation',
      })
      return
    }

    setIsValidating(true)

    try {
      const formData = new FormData()
      formData.append('code', validationCode)
      formData.append('backupCode', backupCodes[0] || '')

      const result = await verifyTotpAction(undefined, formData)

      if (result.success) {
        toast('Succès', {
          description: result.message,
        })
        setShowValidationModal(false)
        setValidationCode('')
        // Optionnel : fermer aussi la modal des codes de sauvegarde
        handleBackupCodesClose()
      } else {
        toast('Erreur', {
          description: result.message,
        })
      }
    } catch {
      toast('Erreur', {
        description: 'Erreur lors de la validation du code.',
      })
    } finally {
      setIsValidating(false)
    }
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

        {/* Sélection du type de 2FA - visible seulement si 2FA est activé */}
        {user.twoFactorEnabled && (
          <div className="rounded-lg border p-4">
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium">
                  Type d&apos;authentification
                </h5>
                <p className="text-muted-foreground text-sm">
                  Choisissez votre méthode préférée pour l&apos;authentification
                  à deux facteurs
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={
                    user.settings?.twoFactorType === 'totp'
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleChangeTwoFactorType('totp')}
                  disabled={isUpdatingType}
                >
                  {isUpdatingType && user.settings?.twoFactorType === 'totp'
                    ? 'Mise à jour...'
                    : 'TOTP'}
                </Button>

                <Button
                  variant={
                    user.settings?.twoFactorType === 'otp'
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleChangeTwoFactorType('otp')}
                  disabled={isUpdatingType}
                >
                  {isUpdatingType && user.settings?.twoFactorType === 'otp'
                    ? 'Mise à jour...'
                    : 'OTP'}
                </Button>
              </div>

              <p className="text-muted-foreground text-xs">
                TOTP : Application d&apos;authentification (Google Auth, Authy)
                | OTP : Codes envoyés par email
              </p>
            </div>
          </div>
        )}
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
              Votre authentification à deux facteurs a été activée. Scannez le
              QR code et notez vos codes de sauvegarde.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="text-center">
                <h4 className="mb-3 text-sm font-medium">QR Code</h4>
                <p className="text-muted-foreground mb-3 text-sm">
                  Scannez ce QR code avec votre application
                  d&apos;authentification (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center">
                  <Image
                    src={qrCodeDataUrl}
                    alt="QR Code pour configuration 2FA"
                    width={200}
                    height={200}
                    className="rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Codes de sauvegarde */}
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

            {/* URI TOTP (optionnel) */}
            {totpURI && (
              <div>
                <h4 className="mb-2 text-sm font-medium">
                  URI TOTP (optionnel)
                </h4>
                <p className="text-muted-foreground mb-2 text-sm">
                  Si le QR code ne fonctionne pas, vous pouvez utiliser cette
                  URI manuellement :
                </p>
                <div className="bg-muted rounded p-2 font-mono text-xs break-all">
                  {totpURI}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowValidationModal(true)}
              className="w-full sm:w-auto"
            >
              Valider la configuration
            </Button>
            <Button
              onClick={handleBackupCodesClose}
              className="w-full sm:w-auto"
            >
              J&apos;ai configuré mon application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour valider le code */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Valider la configuration 2FA</DialogTitle>
            <DialogDescription>
              Saisissez le premier code de sauvegarde pour valider que votre
              application d&apos;authentification fonctionne correctement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Code de validation
              </label>
              <Input
                type="text"
                placeholder="Saisissez le premier code de sauvegarde"
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value)}
                className="mt-2 text-center font-mono text-lg tracking-wider"
              />
              <p className="text-muted-foreground mt-2 text-sm">
                Utilisez le premier code de la liste :{' '}
                <span className="font-mono">{backupCodes[0]}</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowValidationModal(false)
                setValidationCode('')
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidateCode}
              disabled={isValidating || !validationCode.trim()}
            >
              {isValidating ? 'Validation...' : 'Valider'}
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
