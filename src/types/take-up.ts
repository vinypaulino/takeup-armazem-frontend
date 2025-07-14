/**
 * Take-Up and Package Types and Interfaces
 * 
 * Matches the backend API structure for Take-Up and Package entities.
 * Backend uses snake_case (created_at, updated_at) but frontend uses camelCase.
 * 
 * Take-Up represents a warehouse operation for a customer.
 * Packages are items contained within a Take-Up operation.
 */

import type { Customer } from './customer'

/**
 * Package interface for frontend use (camelCase format)
 */
export interface Package {
  id: string              // UUID
  packageNumber: string   // Package identifier/barcode
  lot: string            // Lot/batch number
  weight: number         // Package weight in decimal
  takeUpId: string       // UUID of parent take-up
  createdAt: string      // ISO date string
  updatedAt: string      // ISO date string
}

/**
 * Main Take-Up interface for frontend use (camelCase format)
 */
export interface TakeUp {
  id: string             // UUID
  customer: Customer     // Full customer object
  customerId: string     // UUID of customer
  packages: Package[]    // Array of packages in this take-up
  createdAt: string      // ISO date string
  updatedAt: string      // ISO date string
}

/**
 * DTO for creating a new take-up
 */
export interface CreateTakeUpDto {
  customerId: string     // UUID of customer (required)
}

/**
 * DTO for updating an existing take-up
 */
export interface UpdateTakeUpDto {
  customerId: string     // UUID of customer
}

/**
 * DTO for creating a new package
 */
export interface CreatePackageDto {
  packageNumber: string  // Package identifier/barcode
  lot: string           // Lot/batch number
  weight: number        // Package weight
  takeUpId: string      // UUID of parent take-up
}

/**
 * DTO for updating an existing package
 */
export interface UpdatePackageDto {
  packageNumber: string  // Package identifier/barcode
  lot: string           // Lot/batch number
  weight: number        // Package weight
}

/**
 * Validation error structure for take-up forms
 */
export interface TakeUpValidationErrors {
  customerId?: string[]
  general?: string[]
}

/**
 * Validation error structure for package forms
 */
export interface PackageValidationErrors {
  packageNumber?: string[]
  lot?: string[]
  weight?: string[]
  takeUpId?: string[]
  general?: string[]
}

/**
 * Take-Up statistics for dashboard
 */
export interface TakeUpStats {
  totalTakeUps: number
  totalPackages: number
  newTakeUpsThisMonth: number
  avgPackagesPerTakeUp: number
  recentTakeUps: TakeUp[]
}

/**
 * Package statistics
 */
export interface PackageStats {
  totalPackages: number
  totalWeight: number
  avgWeight: number
  recentPackages: Package[]
}

/**
 * Take-Up with summary info (for listing views)
 */
export interface TakeUpSummary {
  id: string
  customer: {
    id: string
    name: string
    cnpj: string
  }
  packageCount: number
  totalWeight: number
  createdAt: string
  updatedAt: string
}

/**
 * API response types for better type safety
 */
export interface TakeUpApiResponse {
  success: boolean
  data?: TakeUp
  error?: string
  message?: string
}

export interface TakeUpListApiResponse {
  success: boolean
  data?: TakeUp[]
  error?: string
  message?: string
}

export interface PackageApiResponse {
  success: boolean
  data?: Package
  error?: string
  message?: string
}

export interface PackageListApiResponse {
  success: boolean
  data?: Package[]
  error?: string
  message?: string
}

/**
 * Search and filter types
 */
export interface TakeUpFilters {
  customerId?: string
  customerName?: string
  dateFrom?: string
  dateTo?: string
  hasPackages?: boolean
}

export interface PackageFilters {
  takeUpId?: string
  packageNumber?: string
  lot?: string
  weightMin?: number
  weightMax?: number
}

/**
 * Form state types for React hook form integration
 */
export interface TakeUpFormState {
  errors?: TakeUpValidationErrors
  message?: string
  isLoading?: boolean
}

export interface PackageFormState {
  errors?: PackageValidationErrors
  message?: string
  isLoading?: boolean
}

/**
 * Dropdown/Select option types
 */
export interface CustomerOption {
  value: string
  label: string
  cnpj: string
}

/**
 * Take-Up operations result types
 */
export interface TakeUpOperationResult {
  success: boolean
  message?: string
  takeUp?: TakeUp
}

export interface PackageOperationResult {
  success: boolean
  message?: string
  package?: Package
}

/**
 * Bulk operations support
 */
export interface BulkPackageOperation {
  packages: CreatePackageDto[]
  takeUpId: string
}

export interface BulkPackageResult {
  success: boolean
  created: number
  failed: number
  errors?: string[]
} 
