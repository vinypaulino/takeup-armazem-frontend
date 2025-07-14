import { Customer } from './customer'
import { Package } from './package'

/**
 * Take-up entity type matching the backend API response
 */
export interface TakeUp {
  id: string         // UUID
  customer: {
    id: string       // Customer UUID
    name: string     // Customer name
    cnpj: string     // Customer CNPJ
  }
  createdAt: string  // ISO 8601 timestamp
  updatedAt: string  // ISO 8601 timestamp
}

/**
 * Take-up with full customer details
 */
export interface TakeUpWithFullCustomer {
  id: string
  customer: Customer
  createdAt: string
  updatedAt: string
}

/**
 * Take-up with packages included
 */
export interface TakeUpWithPackages extends TakeUp {
  packages: Package[]
  packagesCount: number
  totalWeight: number
}

/**
 * DTO for creating a new take-up
 */
export interface CreateTakeUpDto {
  customerId: string  // UUID of the customer
}

/**
 * DTO for updating an existing take-up
 */
export interface UpdateTakeUpDto {
  customerId?: string  // UUID of the customer
}

/**
 * Take-up form data for client-side forms
 */
export interface TakeUpFormData {
  customerId: string
  customerName?: string  // For display purposes
}

/**
 * Take-up with additional computed fields for UI
 */
export interface TakeUpWithStats extends TakeUp {
  packagesCount?: number
  totalWeight?: number
  lastActivity?: string
  status?: 'active' | 'completed' | 'cancelled'
}

/**
 * Take-up validation errors
 */
export interface TakeUpValidationErrors {
  customerId?: string[]
  general?: string[]
}

/**
 * Take-up search/filter options
 */
export interface TakeUpFilters {
  search?: string
  customerId?: string
  customerName?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'customerName'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
}

/**
 * Take-up API response wrapper
 */
export interface TakeUpApiResponse {
  data: TakeUp | TakeUp[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
}

/**
 * Take-up summary for dashboard
 */
export interface TakeUpSummary {
  totalTakeUps: number
  activeTakeUps: number
  completedTakeUps: number
  totalPackages: number
  totalWeight: number
  recentTakeUps: TakeUp[]
} 
