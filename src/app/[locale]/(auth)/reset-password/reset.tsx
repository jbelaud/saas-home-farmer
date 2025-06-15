'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import React, {Suspense, useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import {z} from 'zod'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {authClient} from '@/lib/better-auth/auth-client'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(100, 'Le mot de passe ne doit pas dépasser 100 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const router = useRouter()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {error} = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Email de réinitialisation envoyé')
      setTimeout(() => {
        router.push('/verify-request')
      }, 2000)
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const onResetPassword = async (data: ResetPasswordFormValues) => {
    setIsLoading(true)
    try {
      const {error} = await authClient.resetPassword({
        newPassword: data.password,
        token: token!,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Mot de passe réinitialisé avec succès')
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Réinitialisation du mot de passe
            </CardTitle>
            <CardDescription>
              Entrez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          En cliquant sur continuer, vous acceptez nos{' '}
          <Link href="/terms">Conditions d&apos;utilisation</Link> et notre{' '}
          <Link href="/privacy">Politique de confidentialité</Link>.
        </div>
      </div>
    )
  }

  return (
    <Suspense>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Nouveau mot de passe</CardTitle>
            <CardDescription>Entrez votre nouveau mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onResetPassword)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? 'Réinitialisation en cours...'
                    : 'Réinitialiser le mot de passe'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
