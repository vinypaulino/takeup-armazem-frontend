/**
 * Enderecamento Types and Interfaces
 * 
 * Enderecamento represents the assignment of packages to specific addresses in the warehouse.
 * When an enderecamento is created, it updates the address status to 'filled'.
 * When removed, the address status returns to 'empty'.
 */

import type { Address } from './address'
import type { Package } from './take-up'

/**
 * Enderecamento interface representing package-address assignment
 */
export interface Enderecamento {
  id: string              // UUID
  package: Package        // Full package details
  address: Address        // Full address details
  createdAt: string       // ISO date string when enderecamento was created
  updatedAt: string       // ISO date string when last updated
}

/**
 * Enderecamento with expanded details for display
 */
export interface EnderecamentoWithDetails extends Enderecamento {
  customerName?: string   // Customer name from package's take-up
  takeUpCode?: string     // Take-up identifier
  addressCode?: string    // Human-readable address code (e.g., "A-01-002")
  streetName?: string     // Street name
  fullAddress?: string    // Complete address string
}

/**
 * DTO for creating a new enderecamento
 */
export interface CreateEnderecamentoDto {
  packageId: string       // UUID of package to assign
  addressId: string       // UUID of address to assign to
}

/**
 * Enderecamento validation errors
 */
export interface EnderecamentoValidationErrors {
  packageId?: string[]
  addressId?: string[]
  general?: string[]
}

/**
 * Enderecamento statistics for dashboard
 */
export interface EnderecamentoStats {
  totalEnderecamentos: number
  totalPackagesAssigned: number
  totalPackagesUnassigned: number
  warehouseOccupancyPercentage: number
  addressesOccupied: number
  addressesAvailable: number
  totalAddresses: number
  recentEnderecamentos: Enderecamento[]
}

/**
 * Available package for enderecamento (packages without address assignment)
 */
export interface AvailablePackage extends Package {
  customerName: string    // Customer name for display
  takeUpCode?: string     // Take-up identifier for display
}

/**
 * Available address for enderecamento (addresses with 'empty' status)
 */
export interface AvailableAddress extends Address {
  addressCode?: string    // Human-readable address code
  fullAddress?: string    // Complete address string for display
}

/**
 * Enderecamento search/filter options
 */
export interface EnderecamentoFilters {
  search?: string
  packageNumber?: string
  addressCode?: string
  streetName?: string
  customerName?: string
  takeUpId?: string
  addressId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'packageNumber' | 'addressCode' | 'customerName'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Enderecamento API response wrapper
 */
export interface EnderecamentoApiResponse {
  data: Enderecamento | Enderecamento[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
}

/**
 * Form state for enderecamento operations
 */
export interface EnderecamentoFormState {
  errors?: EnderecamentoValidationErrors
  message?: string
  isLoading?: boolean
}

/**
 * Enderecamento operation result
 */
export interface EnderecamentoOperationResult {
  success: boolean
  message?: string
  enderecamento?: Enderecamento
}

/**
 * Bulk enderecamento operations
 */
export interface BulkEnderecamentoOperation {
  addressId: string
  packageIds: string[]
}

export interface BulkEnderecamentoResult {
  success: boolean
  created: number
  failed: number
  errors?: string[]
} 
