'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import * as z from 'zod'

import {updateOrganizationAction} from '@/components/features/organization/action'
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
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {Organization} from '@/services/types/domain/organization-types'

import {organizationFormSchema} from './organization-form-validation'

type FormValues = z.infer<typeof organizationFormSchema>

export function EditOrganizationForm({
  organization,
}: {
  organization: Organization
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description ?? '',
      image: organization.image ?? '',
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value)
      }
    }

    const result = await updateOrganizationAction(undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast('Succès', {
        description: result.message,
      })
    } else {
      for (const error of result?.errors ?? []) {
        form.setError(error.field, {type: 'manual', message: error.message})
      }
      toast('Erreur', {
        description: result.message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" {...form.register('id')} />

        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'organisation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({field}) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="slug-de-lorganisation" {...field} />
              </FormControl>
              <FormDescription>
                Utilisé dans l&apos;URL de l&apos;organisation. Doit contenir
                uniquement des lettres minuscules, des chiffres et des tirets.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de l'organisation"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({field}) => (
            <FormItem>
              <FormLabel>Image de l&apos;organisation</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/organization-image.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL de l&apos;image de l&apos;organisation. Laissez vide pour
                supprimer l&apos;image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mb-8">
          {isSubmitting
            ? 'Mise à jour...'
            : 'Mettre à jour l&apos;organisation'}
        </Button>
      </form>
    </Form>
  )
}
