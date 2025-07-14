/**
 * Street entity type matching the backend API response
 */
export interface Street {
  id: number         // Numeric ID
  name: string       // Street name
  createdAt: string  // ISO 8601 timestamp
  updatedAt: string  // ISO 8601 timestamp
}

/**
 * Address entity type matching the backend API response
 */
export interface Address {
  id: string         // UUID
  street: {
    id: number       // Street numeric ID
    name: string     // Street name
  }
  number: string     // Address number
  complement: string // Address complement
  status: 'empty' | 'filled'  // Address status
  createdAt: string  // ISO 8601 timestamp
  updatedAt: string  // ISO 8601 timestamp
}

/**
 * Address with full street details
 */
export interface AddressWithFullStreet extends Omit<Address, 'street'> {
  street: Street
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
  name?: string
}

/**
 * DTO for creating a new address
 */
export interface CreateAddressDto {
  streetId: number
  number: string
  complement: string
  status: 'empty' | 'filled'
}

/**
 * DTO for updating an existing address
 */
export interface UpdateAddressDto {
  streetId?: number
  number?: string
  complement?: string
  status?: 'empty' | 'filled'
}

/**
 * Street form data for client-side forms
 */
export interface StreetFormData {
  name: string
}

/**
 * Address form data for client-side forms
 */
export interface AddressFormData {
  streetId: number
  number: string
  complement: string
  status: 'empty' | 'filled'
  streetName?: string  // For display purposes
}

/**
 * Address with additional computed fields for UI
 */
export interface AddressWithStats extends Address {
  streetName?: string
  fullAddress?: string
  daysInCurrentStatus?: number
  lastStatusChange?: string
}

/**
 * Street validation errors
 */
export interface StreetValidationErrors {
  name?: string[]
  general?: string[]
}

/**
 * Address validation errors
 */
export interface AddressValidationErrors {
  streetId?: string[]
  number?: string[]
  complement?: string[]
  status?: string[]
  general?: string[]
}

/**
 * Street search/filter options
 */
export interface StreetFilters {
  search?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Address search/filter options
 */
export interface AddressFilters {
  search?: string
  streetId?: number
  streetName?: string
  number?: string
  status?: 'empty' | 'filled' | 'all'
  sortBy?: 'number' | 'streetName' | 'status' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Street API response wrapper
 */
export interface StreetApiResponse {
  data: Street | Street[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
}

/**
 * Address API response wrapper
 */
export interface AddressApiResponse {
  data: Address | Address[]
  message?: string
  error?: string
  total?: number
  page?: number
  limit?: number
}

/**
 * Address summary for dashboard
 */
export interface AddressSummary {
  totalAddresses: number
  emptyAddresses: number
  filledAddresses: number
  addressesByStreet: Array<{
    streetId: number
    streetName: string
    totalAddresses: number
    emptyAddresses: number
    filledAddresses: number
  }>
  recentAddresses: Address[]
}

/**
 * Street with address count
 */
export interface StreetWithAddressCount extends Street {
  addressCount: number
  emptyAddressCount: number
  filledAddressCount: number
} 
