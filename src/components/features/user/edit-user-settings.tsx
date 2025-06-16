'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import {z} from 'zod'

import {Button} from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Switch} from '@/components/ui/switch'
import {User} from '@/services/types/domain/user-types'

import {updateUserSettingsAction} from './action'

const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['fr', 'en', 'es', 'de']),
  timezone: z.string(),
  enableTwoFactor: z.boolean(),
  enableEmailNotifications: z.boolean(),
  enablePushNotifications: z.boolean(),
  notificationChannel: z.enum(['email', 'push', 'both', 'none']),
  emailDigest: z.boolean(),
  marketingEmails: z.boolean(),
})

type FormValues = z.infer<typeof settingsFormSchema>

export function EditUserSettingsForm({user}: {user: User}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      theme: user?.settings?.theme ?? 'system',
      language: user?.settings?.language ?? 'fr',
      timezone: user?.settings?.timezone ?? 'Europe/Paris',
      enableTwoFactor: user?.settings?.enableTwoFactor ?? false,
      enableEmailNotifications:
        user?.settings?.enableEmailNotifications ?? true,
      enablePushNotifications: user?.settings?.enablePushNotifications ?? true,
      notificationChannel: user?.settings?.notificationChannel ?? 'both',
      emailDigest: user?.settings?.emailDigest ?? true,
      marketingEmails: user?.settings?.marketingEmails ?? false,
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    }

    const result = await updateUserSettingsAction(undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast('Succès', {
        description: result.message,
      })
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Apparence */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Apparence</h4>
          <FormField
            control={form.control}
            name="theme"
            render={({field}) => (
              <FormItem>
                <FormLabel>Thème</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({field}) => (
              <FormItem>
                <FormLabel>Langue</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sécurité */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Sécurité</h4>
          <FormField
            control={form.control}
            name="enableTwoFactor"
            render={({field}) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Authentification à deux facteurs
                  </FormLabel>
                  <FormDescription>
                    Ajoutez une couche de sécurité supplémentaire à votre compte
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notifications</h4>
          <FormField
            control={form.control}
            name="notificationChannel"
            render={({field}) => (
              <FormItem>
                <FormLabel>Canal de notification</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un canal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email uniquement</SelectItem>
                    <SelectItem value="push">
                      Notifications push uniquement
                    </SelectItem>
                    <SelectItem value="both">Les deux</SelectItem>
                    <SelectItem value="none">Aucune notification</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableEmailNotifications"
            render={({field}) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Notifications par email
                  </FormLabel>
                  <FormDescription>
                    Recevez des notifications importantes par email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enablePushNotifications"
            render={({field}) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Notifications push
                  </FormLabel>
                  <FormDescription>
                    Recevez des notifications en temps réel
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailDigest"
            render={({field}) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Résumé quotidien par email
                  </FormLabel>
                  <FormDescription>
                    Recevez un résumé quotidien de vos activités
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Marketing */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Marketing</h4>
          <FormField
            control={form.control}
            name="marketingEmails"
            render={({field}) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Emails marketing</FormLabel>
                  <FormDescription>
                    Recevez des offres spéciales et des mises à jour
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Mise à jour...' : 'Mettre à jour les paramètres'}
        </Button>
      </form>
    </Form>
  )
}
