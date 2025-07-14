/**
 * Expedicao Types and Interfaces
 * 
 * Expedicao represents shipments of packages from the warehouse.
 * Each expedition contains packages, destination, responsible person, carrier, and tracking info.
 * Status flow: Preparando → Expedido → Em Trânsito → Entregue
 */

import type { Package } from './take-up'

/**
 * Expedicao status enum
 */
export type ExpedicaoStatus = 'Preparando' | 'Expedido' | 'Em Trânsito' | 'Entregue'

/**
 * Expedicao interface representing a shipment
 */
export interface Expedicao {
  id: string                    // UUID
  code: string                  // Human-readable expedition code
  destination: string           // Destination address/location
  responsible: string           // Person responsible for the expedition
  carrier: string              // Carrier/transport company
  tracking: string             // Tracking number/code
  status: ExpedicaoStatus      // Current expedition status
  packages: Package[]          // Packages included in this expedition
  totalWeight: number          // Total weight of packages
  packageCount: number         // Number of packages
  createdAt: string           // ISO date string when expedition was created
  updatedAt: string           // ISO date string when last updated
  expectedDelivery?: string    // Expected delivery date (ISO string)
  actualDelivery?: string      // Actual delivery date (ISO string)
  notes?: string              // Additional notes/comments
}

/**
 * Expedicao with expanded details for display
 */
export interface ExpedicaoWithDetails extends Expedicao {
  customerNames?: string[]     // Unique customer names from packages
  takeUpCodes?: string[]       // Unique take-up codes from packages
  statusColor?: string         // Color for status badge
  daysInTransit?: number       // Days since expedition started
  isOverdue?: boolean          // Whether expedition is overdue
}

/**
 * DTO for creating a new expedicao
 */
export interface CreateExpedicaoDto {
  code: string
  destination: string
  responsible: string
  carrier: string
  tracking: string
  packageIds: string[]         // Array of package UUIDs to include
  expectedDelivery?: string    // Optional expected delivery date
  notes?: string
}

/**
 * DTO for updating an existing expedicao
 */
export interface UpdateExpedicaoDto {
  destination?: string
  responsible?: string
  carrier?: string
  tracking?: string
  status?: ExpedicaoStatus
  expectedDelivery?: string
  actualDelivery?: string
  notes?: string
}

/**
 * Expedicao validation errors
 */
export interface ExpedicaoValidationErrors {
  code?: string[]
  destination?: string[]
  responsible?: string[]
  carrier?: string[]
  tracking?: string[]
  packageIds?: string[]
  expectedDelivery?: string[]
  status?: string[]
  general?: string[]
}

/**
 * Expedicao statistics for dashboard
 */
export interface ExpedicaoStats {
  totalExpedicoes: number
  totalPackagesShipped: number
  expeditionsInProgress: number
  expeditionsDelivered: number
  expeditionsOverdue: number
  averageTransitDays: number
  totalWeightShipped: number
  recentExpedicoes: Expedicao[]
  statusBreakdown: {
    [K in ExpedicaoStatus]: number
  }
}

/**
 * Package available for shipping (packages that are assigned to addresses)
 */
export interface PackageForShipping extends Package {
  customerName: string         // Customer name for display
  takeUpCode?: string          // Take-up identifier for display
  addressCode?: string         // Address code where package is located
  isSelected?: boolean         // For UI selection state
}

/**
 * Available package for shipping with full address details
 */
export interface AvailablePackageForShipping extends PackageForShipping {
  streetName: string           // Street name
  addressNumber: string        // Address number
  addressComplement?: string   // Address complement
}

/**
 * Expedicao search/filter options
 */
export interface ExpedicaoFilters {
  search?: string
  status?: ExpedicaoStatus | 'all'
  responsible?: string
  carrier?: string
  destination?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'code' | 'destination' | 'status' | 'expectedDelivery'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Expedicao API response wrapper
 */
export interface ExpedicaoApiResponse {
  data: Expedicao | Expedicao[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
}

/**
 * Form state for expedicao operations
 */
export interface ExpedicaoFormState {
  errors?: ExpedicaoValidationErrors
  message?: string
  isLoading?: boolean
}

/**
 * Expedicao operation result
 */
export interface ExpedicaoOperationResult {
  success: boolean
  message?: string
  expedicao?: Expedicao
}

/**
 * Expedicao status history entry
 */
export interface ExpedicaoStatusHistory {
  status: ExpedicaoStatus
  timestamp: string
  notes?: string
  updatedBy?: string
}

/**
 * Extended expedicao with status history
 */
export interface ExpedicaoWithHistory extends Expedicao {
  statusHistory: ExpedicaoStatusHistory[]
}

/**
 * Bulk status update operation
 */
export interface BulkStatusUpdateOperation {
  expeditionIds: string[]
  newStatus: ExpedicaoStatus
  notes?: string
}

export interface BulkStatusUpdateResult {
  success: boolean
  updated: number
  failed: number
  errors?: string[]
} 
