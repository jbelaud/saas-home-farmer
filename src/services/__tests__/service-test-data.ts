import {User} from '../types/domain/user-types'

export const currentAuthUserId = 'ae760f8e-4aa6-4d71-a4c8-344429b7ae21' //faker.string.uuid()
export const differentUserId = 'de760f8e-4aa6-4d71-a4c8-344429b7ae28' //faker.string.uuid()

export const userTest = {
  id: currentAuthUserId,
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date(),
  image: null,
  roles: ['user'],
  visibility: 'private',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User

export const userTestAdmin = {
  id: currentAuthUserId,
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date(),
  image: null,
  roles: ['admin'],
  visibility: 'private',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User
