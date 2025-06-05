import fileServiceInterceptor from './interceptors/file-service-logger-interceptor'

export const uploadFileService = fileServiceInterceptor.uploadFileService
export const uploadFileForEntityService =
  fileServiceInterceptor.uploadFileForEntityService
export const deleteFileService = fileServiceInterceptor.deleteFileService
export const getFileService = fileServiceInterceptor.getFileService
export const listFilesService = fileServiceInterceptor.listFilesService
