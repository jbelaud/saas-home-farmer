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
  EntityType,
  FileCategory,
  FileListResponse,
  FileResponse,
  GetFile,
  ListFiles,
  UploadFile,
  UploadFileForEntity,
} from './types/domain/file-types'

const {config} = getStorageConfig()

/**
 * Génère un nom de fichier unique basé sur l'entité
 */
const generateFilePath = (
  entityType: EntityType,
  entityId: string,
  file: File,
  category: FileCategory = 'image'
): string => {
  const timestamp = Date.now()
  const fileExtension = file.name.split('.').pop()
  return `${entityType}s/${entityId}/${category}-${timestamp}.${fileExtension}`
}

const getFileUrl = (path: string) => {
  const baseUrl = process.env.SUPABASE_URL
  const bucket = config.bucket

  if (!baseUrl) {
    console.error(
      "SUPABASE_URL n'est pas définie dans les variables d'environnement"
    )
    throw new Error('Configuration manquante : SUPABASE_URL est requise')
  }

  // Ajouter le basePath pour l'URL publique
  const fullPath = `${config.basePath}/${path}`
  return `${baseUrl}/storage/v1/object/public/${bucket}/${fullPath}`
}

/**
 * Upload un fichier avec génération automatique du chemin pour une entité
 *
 * Génère automatiquement un chemin de la forme : `{entityType}s/{entityId}/{category}-{timestamp}.{extension}`
 *
 * Exemples :
 * - User profile: "users/123/profile-1703123456789.jpg"
 * - Organization logo: "organizations/456/logo-1703123456789.png"
 * - Product image: "products/789/image-1703123456789.webp"
 */
export const uploadFileForEntityService = async (
  params: UploadFileForEntity
): Promise<FileResponse> => {
  const {file, entityType, entityId, category = 'image'} = params

  // Validation de la taille
  if (file.size > config.maxFileSize) {
    throw FileErrors.FILE_TOO_LARGE(file.size, config.maxFileSize)
  }

  // Validation du type MIME
  if (!config.allowedMimeTypes.includes(file.type)) {
    throw FileErrors.INVALID_FILE_TYPE(file.type)
  }

  // Générer le chemin automatiquement
  const path = generateFilePath(entityType, entityId, file, category)

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
