'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useRouter} from 'next/navigation'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import * as z from 'zod'

import {createProjectAction} from '@/app/(app)/projects/actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {Organization} from '@/services/types/domain/organization-types'

const projectFormSchema = z.object({
  name: z.string().min(1, 'Le nom du projet est requis'),
  description: z.string().optional(),
  organizationId: z.string().min(1, "L'organisation est requise"),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface CreateProjectFormProps {
  organizations: Organization[]
}

export function CreateProjectForm({organizations}: CreateProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      organizationId: '',
    },
  })

  async function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('organizationId', data.organizationId)
    if (data.description) {
      formData.append('description', data.description)
    }

    const result = await createProjectAction(undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push('/projects')
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

  if (organizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nouveau projet</CardTitle>
          <CardDescription>Aucune organisation disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vous devez être membre d&apos;au moins une organisation pour créer
            un projet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau projet</CardTitle>
        <CardDescription>
          Créez un nouveau projet dans une de vos organisations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Organisation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une organisation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nom du projet</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Mon super projet" />
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
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Décrivez brièvement ce projet..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/projects')}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le projet'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
