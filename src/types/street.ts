/**
 * Street Types and Interfaces
 * 
 * Matches the backend API structure for the Street entity.
 * Backend uses snake_case (created_at, updated_at) but frontend uses camelCase.
 */

/**
 * Main Street interface for frontend use (camelCase format)
 */
export interface Street {
  id: number
  name: string
  createdAt: string  // ISO date string
  updatedAt: string  // ISO date string
}

/**
 * DTO for creating a new street
 */
export interface CreateStreetDto {
  name: string
}

/**
 * DTO for updating an existing street
 */
export interface UpdateStreetDto {
  name: string
}

/**
 * Validation error structure for street forms
 */
export interface StreetValidationErrors {
  name?: string[]
  general?: string[]
}

/**
 * Street statistics for dashboard
 */
export interface StreetStats {
  totalStreets: number
  recentStreets: Street[]
}

/**
 * API response format (from backend - snake_case)
 * Used internally for transformation
 */
export interface StreetApiResponse {
  id: number
  name: string
  created_at?: string
  updated_at?: string
  createdAt?: string  // Alternative format
  updatedAt?: string  // Alternative format
} 
