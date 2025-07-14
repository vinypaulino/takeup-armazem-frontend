// Customer types
export * from './customer'

// Take-up types
export * from './takeup'

// Package types
export * from './package'

// Address and Street types
export * from './address'

// Common types used across the application
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
}

export interface FormState {
  isSubmitting: boolean
  errors: Record<string, string[]>
  message?: string
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: unknown, item: T) => React.ReactNode
}

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
}

export interface DashboardStats {
  totalCustomers: number
  totalTakeUps: number
  totalPackages: number
  totalAddresses: number
  emptyAddresses: number
  filledAddresses: number
  totalWeight: number
  averageWeight: number
}

export interface NotificationMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type SortOrder = 'asc' | 'desc'

export type FilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' 
