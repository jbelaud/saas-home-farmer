'use client'
import {zodResolver} from '@hookform/resolvers/zod'
import {AlertCircle} from 'lucide-react'
import {isRedirectError} from 'next/dist/client/components/redirect-error'
import Link from 'next/link'
import React, {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'

import {
  registerCredentialAction,
  registerProviderAction,
} from '@/app/[locale]/(auth)/action'
import {authRegisterFormSchema} from '@/components/features/auth/auth-form-validation'
import {Alert, AlertDescription} from '@/components/ui/alert'
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
import {cn} from '@/lib/utils'

type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type ValidationError = {
  field: keyof FormValues
  message: string
}

type FormState = {
  success: boolean
  errors?: ValidationError[]
  message?: string
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(authRegisterFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleProviderAction = async (provider: 'google' | 'apple') => {
    try {
      const result = await registerProviderAction(provider)
      if (result?.success) {
        // La redirection sera gérée par NextAuth
      }
    } catch (error) {
      console.error('Erreur lors de la connexion avec le provider:', error)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setFormError(null)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    try {
      const result = (await registerCredentialAction(
        {
          success: false,
          message: '',
        },
        formData
      )) as FormState

      if (result && !result?.success) {
        // Afficher le message d'erreur général
        setFormError(
          result.message || "Une erreur est survenue lors de l'inscription"
        )
        toast.error('Erreur', {
          description:
            result.message || "Une erreur est survenue lors de l'inscription",
        })

        // Gérer les erreurs par champs
        if (result.errors) {
          result.errors.forEach((error) => {
            form.setError(error.field, {
              type: 'manual',
              message: error.message,
            })
          })
        }
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      const errorMessage = "Une erreur est survenue lors de l'inscription"
      setFormError(errorMessage)
      toast.error('Erreur', {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>
            {showForm
              ? 'Inscrivez-vous pour accéder à votre espace personnel'
              : "Choisissez votre méthode d'inscription"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleProviderAction('apple')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              S&apos;inscrire avec Apple
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleProviderAction('google')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              S&apos;inscrire avec Google
            </Button>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Ou
              </span>
            </div>

            {!showForm ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                Créer un compte avec email
              </Button>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {formError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="jean@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
                  </Button>

                  <div className="text-center text-sm">
                    Vous avez déjà un compte?{' '}
                    <Link
                      href="/login"
                      className="underline underline-offset-4"
                    >
                      Se connecter
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </div>
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
