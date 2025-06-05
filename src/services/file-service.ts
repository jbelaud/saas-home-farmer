import {
  deleteFile,
  getFile,
  listFiles,
  uploadFile,
} from '@/db/repositories/files-repository'
import {FileErrors} from '@/lib/files/errors'
import {getStorageConfig} from '@/lib/files/storage/env'

import {
  DeleteFile,
  FileListResponse,
  FileResponse,
  GetFile,
  ListFiles,
  UploadFile,
} from './types/domain/file-types'

const {config} = getStorageConfig()

const getFileUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const bucket = config.bucket
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Upload un fichier avec validation
 */
export const uploadFileService = async (
  params: UploadFile
): Promise<FileResponse> => {
  const {file, path} = params

  // Validation de la taille
  if (file.size > config.maxFileSize) {
    throw FileErrors.FILE_TOO_LARGE(file.size, config.maxFileSize)
  }

  // Validation du type MIME
  if (!config.allowedMimeTypes.includes(file.type)) {
    throw FileErrors.INVALID_FILE_TYPE(file.type)
  }

  await uploadFile(file, path)
  return {
    path,
    url: getFileUrl(path),
    size: file.size,
    type: file.type,
    name: file.name,
  }
}

/**
 * Supprime un fichier
 */
export const deleteFileService = async (params: DeleteFile): Promise<void> => {
  const {path} = params
  return await deleteFile(path)
}

/**
 * Récupère un fichier
 */
export const getFileService = async (
  params: GetFile
): Promise<FileResponse> => {
  const {path} = params
  const blob = await getFile(path)
  return {
    path,
    url: getFileUrl(path),
    size: blob.size,
    type: blob.type,
    name: path.split('/').pop() || '',
  }
}

/**
 * Liste les fichiers d'un répertoire
 */
export const listFilesService = async (
  params: ListFiles
): Promise<FileListResponse> => {
  const {path} = params
  const files = await listFiles(path)
  return files.map((file) => ({
    path: file.name,
    url: getFileUrl(file.name),
    size: file.metadata?.size || 0,
    type: file.metadata?.mimetype || '',
    name: file.name,
  }))
}
