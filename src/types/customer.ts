/**
 * Customer entity type for frontend use (camelCase)
 * Note: Backend returns snake_case (created_at, updated_at) but is transformed to camelCase
 */
export interface Customer {
  id: string         // UUID
  name: string       // Company name
  cnpj: string       // Brazilian company registration number
  createdAt: string  // ISO 8601 timestamp (transformed from created_at)
  updatedAt: string  // ISO 8601 timestamp (transformed from updated_at)
}

/**
 * DTO for creating a new customer
 */
export interface CreateCustomerDto {
  name: string
  cnpj: string
}

/**
 * DTO for updating an existing customer
 */
export interface UpdateCustomerDto {
  name?: string
  cnpj?: string
}

/**
 * Customer form data for client-side forms
 */
export interface CustomerFormData {
  name: string
  cnpj: string
}

/**
 * Customer with additional computed fields for UI
 */
export interface CustomerWithStats extends Customer {
  takeUpsCount?: number
  packagesCount?: number
  lastActivity?: string
}

/**
 * Customer validation errors
 */
export interface CustomerValidationErrors {
  name?: string[]
  cnpj?: string[]
  general?: string[]
}

/**
 * Customer search/filter options
 */
export interface CustomerFilters {
  search?: string
  sortBy?: 'name' | 'cnpj' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Customer API response wrapper
 */
export interface CustomerApiResponse {
  data: Customer | Customer[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
} 
