'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {toast} from 'sonner'
import * as z from 'zod'

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {FileUpload} from '@/components/ui/file-upload'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {User} from '@/services/types/domain/user-types'

import {updateUser} from './action'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']),
})

type FormValues = z.infer<typeof formSchema>

export function EditUserProfileForm({user}: {user: User}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image ?? undefined,
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

    const result = await updateUser(user.id, formData)
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
      toast('Error', {
        description: result.message,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      })
    }
  }

  const avatarImage = user.image ?? undefined
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
        <FileUpload />
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
          name="image"
          render={({field}) => (
            <FormItem>
              <FormLabel>Profile Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/your-image.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Leave empty to remove the profile image
              </FormDescription>
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
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  )
}
