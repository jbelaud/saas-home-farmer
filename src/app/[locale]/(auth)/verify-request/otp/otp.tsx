'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {isRedirectError} from 'next/dist/client/components/redirect-error'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import {z} from 'zod'

import {verifyOTPAction} from '@/app/[locale]/(auth)/action'
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

const otpSchema = z.object({
  code: z
    .string()
    .min(6, 'Le code doit contenir 6 chiffres')
    .max(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d{6}$/, 'Le code doit contenir uniquement des chiffres'),
})

type OtpFormValues = z.infer<typeof otpSchema>

export default function OtpVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const hasSentOtp = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get('code') ?? ''

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: codeFromUrl,
    },
  })

  const handleVerifyCode = useCallback(
    async (code: string) => {
      setIsLoading(true)
      try {
        const formData = new FormData()
        formData.append('code', code)

        const result = await verifyOTPAction(
          {success: false, message: ''},
          formData
        )
        console.log('result', result)

        if (result.success) {
          toast.success('Vérification OTP réussie')
          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          toast.error(result.message || 'Code OTP invalide')
        }
      } catch (error) {
        if (isRedirectError(error)) {
          toast.success('Redirection vers le dashboard ...')
        } else {
          toast.error('Une erreur est survenue lors de la vérification OTP')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  // Si on a un code dans l'URL, on le vérifie automatiquement
  useEffect(() => {
    if (codeFromUrl && codeFromUrl.length === 6) {
      handleVerifyCode(codeFromUrl)
    }
  }, [codeFromUrl, handleVerifyCode])

  // Envoyer l'OTP seulement si pas de code dans l'URL
  useEffect(() => {
    if (!codeFromUrl && !hasSentOtp.current) {
      sendOtp()
    }
  }, [codeFromUrl])

  const sendOtp = async () => {
    // Éviter le double envoi en mode DEV
    if (hasSentOtp.current) {
      return
    }

    try {
      setIsSendingOtp(true)
      hasSentOtp.current = true // Marquer comme envoyé immédiatement

      const {error} = await authClient.twoFactor.sendOtp()

      if (error) {
        toast.error("Erreur lors de l'envoi du code OTP")
        console.error('sendOtp error:', error)
      } else {
        toast.success('Code OTP envoyé par email')
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi du code OTP")
      console.error('sendOtp error:', error)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const onSubmit = async (data: OtpFormValues) => {
    await handleVerifyCode(data.code)
  }

  return (
    <div className="lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Vérification OTP</CardTitle>
            <CardDescription>
              {codeFromUrl
                ? 'Vérification automatique du code...'
                : isSendingOtp
                  ? 'Envoi du code OTP...'
                  : 'Entrez le code OTP à 6 chiffres envoyé par email'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Code OTP</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                          disabled={isLoading || isSendingOtp || !!codeFromUrl}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isSendingOtp || !!codeFromUrl}
                >
                  {isLoading ? 'Vérification...' : 'Vérifier le code OTP'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 space-y-2 text-center">
              <div>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Retour à la connexion
                </Link>
              </div>
              <div>
                <Link
                  href="/verify-request/recovery"
                  className="text-muted-foreground hover:text-primary text-sm underline underline-offset-4"
                >
                  Utiliser un code de sauvegarde
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          En cliquant sur continuer, vous acceptez nos{' '}
          <Link href="/terms">Conditions d&apos;utilisation</Link> et notre{' '}
          <Link href="/privacy">Politique de confidentialité</Link>.
        </div>
      </div>
    </div>
  )
}
