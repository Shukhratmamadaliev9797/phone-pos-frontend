// ==== User Model ====
declare interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

// ==== User Request Payloads ====
declare interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'user' | 'admin' | 'moderator'
}

declare interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  avatar?: string
  role?: 'user' | 'admin' | 'moderator'
}

// ==== User Response Types ====
declare type UsersListResponse = PaginationResult<User>

declare interface UserResponse {
  user: User
}
