/**
 * Package entity type matching the backend API response
 */
export interface Package {
  id: string              // UUID
  packageNumber: string   // Package number/identifier
  lot: string            // Lot number
  weight: number         // Weight with 2 decimal precision
  takeUp: {
    id: string           // Take-up UUID
    customer: {
      id: string         // Customer UUID
      name: string       // Customer name
    }
  }
  createdAt: string      // ISO 8601 timestamp
  updatedAt: string      // ISO 8601 timestamp
}

/**
 * Package with full take-up details
 */
export interface PackageWithFullTakeUp extends Omit<Package, 'takeUp'> {
  takeUp: {
    id: string
    customer: {
      id: string
      name: string
      cnpj: string
    }
    createdAt: string
    updatedAt: string
  }
}

/**
 * DTO for creating a new package
 */
export interface CreatePackageDto {
  packageNumber: string
  lot: string
  weight: number
  takeUpId: string      // UUID of the take-up
}

/**
 * DTO for updating an existing package
 */
export interface UpdatePackageDto {
  packageNumber?: string
  lot?: string
  weight?: number
  takeUpId?: string
}

/**
 * Package form data for client-side forms
 */
export interface PackageFormData {
  packageNumber: string
  lot: string
  weight: number
  takeUpId: string
  customerName?: string    // For display purposes
}

/**
 * Package with additional computed fields for UI
 */
export interface PackageWithStats extends Package {
  customerName?: string
  takeUpCreatedAt?: string
  status?: 'pending' | 'processed' | 'shipped' | 'delivered'
  daysInSystem?: number
}

/**
 * Package validation errors
 */
export interface PackageValidationErrors {
  packageNumber?: string[]
  lot?: string[]
  weight?: string[]
  takeUpId?: string[]
  general?: string[]
}

/**
 * Package search/filter options
 */
export interface PackageFilters {
  search?: string
  takeUpId?: string
  customerId?: string
  customerName?: string
  lot?: string
  packageNumber?: string
  weightMin?: number
  weightMax?: number
  sortBy?: 'packageNumber' | 'lot' | 'weight' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
}

/**
 * Package API response wrapper
 */
export interface PackageApiResponse {
  data: Package | Package[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
}

/**
 * Package summary for dashboard
 */
export interface PackageSummary {
  totalPackages: number
  totalWeight: number
  averageWeight: number
  packagesThisMonth: number
  heaviestPackage: Package | null
  lightestPackage: Package | null
  recentPackages: Package[]
}

/**
 * Package weight statistics
 */
export interface PackageWeightStats {
  total: number
  average: number
  min: number
  max: number
  count: number
}

/**
 * Package grouping by lot
 */
export interface PackagesByLot {
  lot: string
  packages: Package[]
  totalWeight: number
  count: number
} 
