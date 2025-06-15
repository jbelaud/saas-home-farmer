'use client'
import React from 'react'
import {useActionState} from 'react'
import {useFormStatus} from 'react-dom'

import {registerMagicLinkAction} from '@/app/[locale]/(auth)/action'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

type MagicLinkValidationError = {
  field: 'email' | 'name'
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

  const error = state && !state.success ? state.message : null
  const success = state?.success ? state.message : null

  return (
    <form action={formAction}>
      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-500">{success}</div>}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" placeholder="Jean Dupont" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jean@example.com"
            required
          />
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
