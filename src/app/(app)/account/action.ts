'use server'

import {revalidatePath} from 'next/cache'
import {UpdateUser} from '@/services/types/domain/user-types'
import {updateUserSafeService} from '@/services/user-service'
export async function updateUser(userId: string, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const image = formData.get('image') as string
  const visibility = formData.get('visibility') as 'public' | 'private'

  const user: UpdateUser = {
    id: userId,
    name,
    email,
    image,
    visibility,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  try {
    await updateUserSafeService(userId, user)
    revalidatePath('/user')
    return {success: true, message: 'Profile updated successfully'}
  } catch {
    return {success: false, message: 'Failed to update profile'}
  }
}
