'use client'
import React from 'react'
import {useActionState} from 'react'
import {useFormStatus} from 'react-dom'

import {registerMagicLinkAction} from '@/app/[locale]/(auth)/action'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

type MagicLinkValidationError = {
  field: 'email'
  message: string
}

type MagicLinkFormState = {
  success: boolean
  errors?: MagicLinkValidationError[]
  message?: string
}

export function RegisterMagicLinkForm() {
  const [state, formAction] = useActionState<MagicLinkFormState, FormData>(
    registerMagicLinkAction,
    {
      success: false,
      message: '',
      errors: [],
    }
  )

  // Gestion des erreurs : message général + erreurs par champ
  const generalError =
    state && !state.success && !state.errors?.length ? state.message : null
  const success = state?.success ? state.message : null

  // Trouver l'erreur spécifique pour le champ email
  const emailError = state?.errors?.find(
    (error) => error.field === 'email'
  )?.message

  return (
    <form action={formAction}>
      {generalError && (
        <div className="mb-4 text-sm text-red-500">{generalError}</div>
      )}
      {success && <div className="mb-4 text-sm text-green-500">{success}</div>}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jean@example.com"
            required
            className={emailError ? 'border-red-500' : ''}
          />
          {emailError && (
            <div className="text-sm text-red-500">{emailError}</div>
          )}
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const {pending} = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Envoi en cours...' : "Envoyer le lien d'inscription"}
    </Button>
  )
}
