export type Pagination = {
  limit: number
  offset: number
}
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    rowCount: number
    pageSize: number
  }
}
