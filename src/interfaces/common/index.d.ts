// ==== Common Type Aliases ====
declare type UUID = string | number
declare type ISODateString = string

// ==== Pagination ====
declare interface PaginationQuery {
  page?: number
  take?: number
  search?: string
  searchField?: string
  sortField?: string
  sortOrder?: 'ASC' | 'DESC'
  createdFrom?: string // YYYY-MM-DD
  createdTo?: string // YYYY-MM-DD
}

declare interface PaginationResult<T> {
  count: number
  results: T[]
  totalPages: number
  page: number
  take: number
}

// ==== API Response Wrappers ====
declare interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

declare interface ApiError {
  success: false
  error: string
  message: string
  statusCode?: number
}
