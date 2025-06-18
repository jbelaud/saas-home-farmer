'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {Key, Shield} from 'lucide-react'
import Link from 'next/link'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import {z} from 'zod'

import {verifyBackupCodeAction} from '@/app/[locale]/(auth)/action'
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

const recoveryCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Le code de sauvegarde est requis')
    .regex(
      /^[0-9A-Za-z-]+$/,
      'Le code ne doit contenir que des lettres, chiffres ou tirets'
    ),
})

type RecoveryCodeFormValues = z.infer<typeof recoveryCodeSchema>

export function RecoveryCodeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RecoveryCodeFormValues>({
    resolver: zodResolver(recoveryCodeSchema),
    defaultValues: {
      code: '',
    },
  })

  async function onSubmit(data: RecoveryCodeFormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('code', data.code)

    const result = await verifyBackupCodeAction({success: false}, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast('Succès', {
        description: result.message,
      })
    } else {
      toast('Erreur', {
        description: result.message,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Shield className="text-primary h-5 w-5" />
          <CardTitle className="text-xl">Récupération de compte</CardTitle>
        </div>
        <CardDescription>
          Entrez l&apos;un de vos codes de sauvegarde pour accéder à votre
          compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            Les codes de sauvegarde sont générés lors de l&apos;activation de
            l&apos;authentification à deux facteurs. Chaque code ne peut être
            utilisé qu&apos;une seule fois.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Code de sauvegarde</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Ex: ABC123DEF456"
                      className="text-center font-mono text-lg tracking-wider"
                      maxLength={12}
                      autoComplete="off"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Vérification...' : 'Accéder au compte'}
            </Button>
          </form>
        </Form>

        <div className="text-muted-foreground text-center text-sm">
          <p>
            Vous n&apos;avez pas de code de sauvegarde ?{' '}
            <Link
              href="/login"
              className="hover:text-primary underline underline-offset-4"
            >
              Retour à la connexion
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
