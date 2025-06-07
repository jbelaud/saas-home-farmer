'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import * as z from 'zod'

import {
  updateUserAction,
  uploadProfileImageAction,
} from '@/components/features/user/action'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {FileUpload} from '@/components/ui/file-upload'
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
import {User} from '@/services/types/domain/user-types'

import {userFormSchema} from '../admin/users/user-form-validation'

type FormValues = z.infer<typeof userFormSchema>

export function EditUserProfileForm({user}: {user: User}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarImage, setAvatarImage] = useState(user.image ?? '')

  const form = useForm<FormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? '',
      visibility: user.visibility,
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    }

    const result = await updateUserAction(undefined, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast('Success', {
        description: result.message,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      })
    } else {
      for (const error of result?.errors ?? []) {
        form.setError(error.field, {type: 'manual', message: error.message})
      }
      toast('Error', {
        description: result.message,
        action: {
          label: 'OK',
          onClick: () => console.log('Undo'),
        },
      })
    }
  }

  async function handleFileUpload(files: File[]) {
    if (files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProfileImageAction(undefined, formData)

      if (result.success && result.imageUrl) {
        // Mettre à jour le champ image dans le formulaire avec l'URL du fichier uploadé
        form.setValue('image', result.imageUrl)
        setAvatarImage(result.imageUrl)

        toast('Succès', {
          description: result.message,
        })
      } else {
        toast('Erreur', {
          description: result.message || "Erreur lors de l'upload",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error)
      toast('Erreur', {
        description: "Impossible d'uploader l'image. Veuillez réessayer.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Form {...form}>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-[100px] w-[100px]">
          <AvatarImage src={avatarImage} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground text-sm">{user.name}</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" {...form.register('id')} />
        <div className="space-y-2">
          <FileUpload
            onChange={handleFileUpload}
            onlyimage={true}
            multi={false}
            isUploading={isUploading}
          />
          {isUploading && (
            <p className="text-muted-foreground text-sm">Upload en cours...</p>
          )}
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
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
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({field}) => (
            <FormItem>
              <FormLabel>Profile Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mb-8">
          {isSubmitting ? 'Updating...' : 'Enregistrer'}
        </Button>
      </form>
    </Form>
  )
}
