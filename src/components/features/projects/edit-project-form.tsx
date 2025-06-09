'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import * as z from 'zod'

import {updateProjectAction} from '@/app/[locale]/(app)/team/[slug]/projects/actions'
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
import {Textarea} from '@/components/ui/textarea'
import {Project} from '@/services/types/domain/project-types'

const projectFormSchema = z.object({
  name: z.string().min(1, 'Le nom du projet est requis'),
  description: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface EditProjectFormProps {
  project: Project
  canEdit: boolean
}

export function EditProjectForm({project, canEdit}: EditProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  })

  async function onSubmit(data: ProjectFormValues) {
    if (!canEdit) {
      toast.error("Vous n'avez pas les droits pour modifier ce projet")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.description) {
      formData.append('description', data.description)
    }

    const result = await updateProjectAction(project.id, undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
    } else {
      if (result.errors) {
        for (const error of result.errors) {
          form.setError(error.field as keyof ProjectFormValues, {
            type: 'manual',
            message: error.message,
          })
        }
      }
      toast.error(result.message || 'Une erreur est survenue')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du projet</CardTitle>
        <CardDescription>
          Modifiez les informations de base du projet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nom du projet</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!canEdit} />
                  </FormControl>
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
                      {...field}
                      disabled={!canEdit}
                      rows={4}
                      placeholder="Décrivez brièvement ce projet..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canEdit && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le projet'}
              </Button>
            )}

            {!canEdit && (
              <p className="text-muted-foreground text-sm">
                Vous n&apos;avez pas les droits nécessaires pour modifier ce
                projet.
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
