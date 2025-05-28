'use client'
import Link from 'next/link'
import React from 'react'
import {useActionState} from 'react'
import {useFormStatus} from 'react-dom'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {cn} from '@/lib/utils'

import {register} from '../action'

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [state, formAction] = useActionState(register, {
    success: false,
    message: '',
  })
  const error = state && !state.success ? state.message : null

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>
            Inscrivez-vous pour accéder à votre espace personnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jean Dupont"
                  required
                />
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
              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>
              <SubmitButton />
              <div className="text-center text-sm">
                Vous avez déjà un compte?{' '}
                <a href="/login" className="underline underline-offset-4">
                  Se connecter
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En vous inscrivant, vous acceptez nos{' '}
        <Link href="/terms">Conditions d&apos;utilisation</Link> et notre{' '}
        <Link href="/privacy">Politique de confidentialité</Link>.
      </div>
    </div>
  )
}

// Composant de bouton de soumission qui montre l'état de chargement
function SubmitButton() {
  const {pending} = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Inscription en cours...' : "S'inscrire"}
    </Button>
  )
}
