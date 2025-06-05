// Types de base
export type File = globalThis.File

// Types pour les opérations
export type UploadFile = {
  file: File
  path: string
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
