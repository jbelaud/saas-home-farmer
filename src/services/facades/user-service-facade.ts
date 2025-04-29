import userServiceInterceptor from './interceptors/user-service-logger-interceptor'

//POST SERVICE
export const updateUserSafeService =
  userServiceInterceptor.updateUserSafeService
export const getPublicUsersWithPagination =
  userServiceInterceptor.getPublicUsersWithPagination
export const getUserById = userServiceInterceptor.getUserById

export const getUserByEmail = userServiceInterceptor.getUserByEmail
export const createUser = userServiceInterceptor.createUser
