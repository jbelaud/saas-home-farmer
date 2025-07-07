export type Pagination = {
  limit: number
  offset: number
}
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    total: number // ← Nombre total d'éléments
    page: number // ← Page actuelle
    limit: number // ← Éléments par page
    totalPages: number // ← Nombre total de pages
  }
}

export type ActionResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
}
