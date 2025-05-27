'use server'

import {revalidatePath} from 'next/cache'
import {UpdateUser} from '@/services/types/domain/user-types'
import {updateUserService} from '@/services/user-service'
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
  }
  try {
    await updateUserService(userId, user)
    revalidatePath('/account')
    return {success: true, message: 'Profile updated successfully'}
  } catch (error) {
    console.error(error)
    return {success: false, message: 'Failed to update profile'}
  }
}
