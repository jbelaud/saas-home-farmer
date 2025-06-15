'use client'
import Link from 'next/link'
import React from 'react'
import {useActionState} from 'react'
import {useFormStatus} from 'react-dom'

import {loginCredentialAction} from '@/app/[locale]/(auth)/action'
import {authLoginFormSchema} from '@/components/features/auth/auth-form-validation'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

type LoginValidationError = {
  field: keyof typeof authLoginFormSchema._type
  message: string
}

type LoginFormState = {
  success: boolean
  errors?: LoginValidationError[]
  message?: string
}

export function CredentialForm() {
  const [state, formAction] = useActionState<LoginFormState, FormData>(
    loginCredentialAction,
    {
      success: false,
      message: '',
      errors: [],
    }
  )

  const error = state && !state.success ? state.message : null

  return (
    <form action={formAction}>
      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
      <div className="grid gap-6">
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={'user@gmail.com'}
              placeholder="user@gmail.com"
              required
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Mot de passe</Label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Mot de passe oublié?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              defaultValue={'Azerty123'}
              required
            />
          </div>
          <SubmitButton />
        </div>
        <div className="text-center text-sm">
          Pas encore de compte?{' '}
          <Link href="/register" className="underline underline-offset-4">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </form>
  )
}

function SubmitButton() {
  const {pending} = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Connexion en cours...' : 'Se connecter'}
    </Button>
  )
}
