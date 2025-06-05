// Types de base
export type File = globalThis.File

// Types d'entités supportées
export type EntityType = 'user' | 'organization' | 'product' | 'generic'

// Types de fichiers pour une entité
export type FileCategory = 'profile' | 'logo' | 'banner' | 'document' | 'image'

// Types pour les opérations
export type UploadFile = {
  file: File
  path: string
}

// Upload avec génération automatique du chemin
export type UploadFileForEntity = {
  file: File
  entityType: EntityType
  entityId: string
  category?: FileCategory
}

export type DeleteFile = {
  path: string
}

export type GetFile = {
  path: string
}

export type ListFiles = {
  path: string
}

// Types de réponse
export type FileResponse = {
  path: string
  url: string
  size: number
  type: string
  name: string
}

export type FileListResponse = FileResponse[]
