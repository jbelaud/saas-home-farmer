import userServiceInterceptor from './interceptors/user-service-logger-interceptor'

//POST SERVICE
export const updateUserService = userServiceInterceptor.updateUserService
export const getUserByIdService = userServiceInterceptor.getUserByIdService
export const getUserByEmailService =
  userServiceInterceptor.getUserByEmailService
export const createUserService = userServiceInterceptor.createUserService
