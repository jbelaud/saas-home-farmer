'use server'

import {revalidatePath} from 'next/cache'
import {UpdateUser} from '@/services/types/domain/user-types'
import {updateUserService} from '@/services/user-service'
import {getAuthUser} from '@/services/authentication/auth-utils'

export async function updateUser(userId: string, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return {success: false, message: 'User not found'}
  }
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const image = formData.get('image') as string
  const visibility = formData.get('visibility') as 'public' | 'private'

  const userData: UpdateUser = {
    id: userId,
    name,
    email,
    image,
    visibility,
  }
  try {
    await updateUserService(userId, userData)
    revalidatePath('/account')
    return {success: true, message: 'Profile updated successfully'}
  } catch (error) {
    console.error(error)
    return {success: false, message: 'Failed to update profile'}
  }
}
