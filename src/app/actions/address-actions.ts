'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { 
  Address, 
  CreateAddressDto, 
  UpdateAddressDto, 
  AddressValidationErrors,
  AddressSummary
} from '@/types/address'
import { 
  fetchResourceList, 
  fetchResource, 
  createResource, 
  updateResource, 
  deleteResource,
  transformBackendResponse,
  transformBackendResponseArray
} from '@/lib/api'

/**
 * Validation schemas using Zod
 */
const createAddressSchema = z.object({
  streetId: z.coerce.number()
    .min(1, 'Rua é obrigatória'),
  number: z.string()
    .min(1, 'Número é obrigatório')
    .max(50, 'Número deve ter no máximo 50 caracteres')
    .trim(),
  complement: z.string()
    .max(255, 'Complemento deve ter no máximo 255 caracteres')
    .trim(),
  status: z.enum(['empty', 'filled'])
})

const updateAddressSchema = createAddressSchema

/**
 * Validate form data against a schema
 */
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreateAddressDto | UpdateAddressDto, 
  errors?: AddressValidationErrors 
} {
  const formObject = Object.fromEntries(data.entries())
  
  try {
    const validatedData = schema.parse(formObject) as CreateAddressDto | UpdateAddressDto
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: AddressValidationErrors = {}
      
      error.issues.forEach((err) => {
        const field = err.path[0] as keyof AddressValidationErrors
        if (!errors[field]) {
          errors[field] = []
        }
        errors[field]!.push(err.message)
      })
      
      return { success: false, errors }
    }
    
    return { 
      success: false, 
      errors: { general: ['Erro de validação desconhecido'] }
    }
  }
}

/**
 * Get all addresses from the backend
 */
export async function getAddresses(): Promise<Address[]> {
  try {
    const response = await fetchResourceList<Address>('/addresses')
    
    // Transform the response if needed
    if (Array.isArray(response)) {
      return transformBackendResponseArray(response as unknown as Record<string, unknown>[]) as unknown as Address[]
    }
    
    return response
  } catch (error) {
    console.error('Error fetching addresses:', error)
    throw error
  }
}

/**
 * Get a specific address by ID
 */
export async function getAddress(id: string): Promise<Address> {
  try {
    const response = await fetchResource<Address>('/addresses', id)
    
    // Transform the response if needed
    return transformBackendResponse(response as unknown as Record<string, unknown>) as unknown as Address
  } catch (error) {
    console.error('Error fetching address:', error)
    throw error
  }
}

/**
 * Validate that a street exists
 */
async function validateStreetExists(streetId: number): Promise<boolean> {
  try {
    await fetchResource('/streets', streetId.toString())
    return true
  } catch (error) {
    console.error('Street validation error:', error)
    return false
  }
}

/**
 * Create a new address
 */
export async function createAddress(
  prevState: { errors?: AddressValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: AddressValidationErrors, message?: string }> {
  const validation = validateFormData(formData, createAddressSchema)
  
  if (!validation.success) {
    return { errors: validation.errors }
  }

  const addressData = validation.data as CreateAddressDto

  try {
    // Validate that the street exists
    const streetExists = await validateStreetExists(addressData.streetId)
    if (!streetExists) {
      return {
        errors: {
          streetId: ['Rua selecionada não existe']
        }
      }
    }

    // Create the address in the backend
    await createResource<Address>('/addresses', {
      streetId: addressData.streetId,
      number: addressData.number,
      complement: addressData.complement,
      status: addressData.status
    })

    // Revalidate the addresses page to show the new data
    revalidatePath('/dashboard/enderecos')
    
    return { 
      message: 'Endereço criado com sucesso!' 
    }
  } catch (error) {
    console.error('Error creating address:', error)
    
    return { 
      errors: { 
        general: ['Erro ao criar endereço. Tente novamente.'] 
      } 
    }
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  id: string,
  prevState: { errors?: AddressValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: AddressValidationErrors, message?: string }> {
  const validation = validateFormData(formData, updateAddressSchema)
  
  if (!validation.success) {
    return { errors: validation.errors }
  }

  const addressData = validation.data as UpdateAddressDto

  try {
    // Validate that the street exists if streetId is provided
    if (addressData.streetId !== undefined) {
      const streetExists = await validateStreetExists(addressData.streetId)
      if (!streetExists) {
        return {
          errors: {
            streetId: ['Rua selecionada não existe']
          }
        }
      }
    }

    // Update the address in the backend
    await updateResource<Address>(`/addresses/${id}`, {
      streetId: addressData.streetId,
      number: addressData.number,
      complement: addressData.complement,
      status: addressData.status
    })

    // Revalidate the addresses page to show the updated data
    revalidatePath('/dashboard/enderecos')
    revalidatePath(`/dashboard/enderecos/${id}`)
    
    return { 
      message: 'Endereço atualizado com sucesso!' 
    }
  } catch (error) {
    console.error('Error updating address:', error)
    
    return { 
      errors: { 
        general: ['Erro ao atualizar endereço. Tente novamente.'] 
      } 
    }
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string): Promise<{ success: boolean, message?: string }> {
  try {
    await deleteResource(`/addresses/${id}`)

    // Revalidate the addresses page to show the updated data
    revalidatePath('/dashboard/enderecos')
    
    return { 
      success: true,
      message: 'Endereço excluído com sucesso!' 
    }
  } catch (error) {
    console.error('Error deleting address:', error)
    
    return { 
      success: false,
      message: 'Erro ao excluir endereço. Tente novamente.' 
    }
  }
}

/**
 * Search addresses by query
 */
export async function searchAddresses(query: string): Promise<Address[]> {
  try {
    const addresses = await getAddresses()
    
    const filteredAddresses = addresses.filter((address) => {
      const searchTerm = query.toLowerCase()
      return (
        address.number.toLowerCase().includes(searchTerm) ||
        address.complement.toLowerCase().includes(searchTerm) ||
        address.street.name.toLowerCase().includes(searchTerm) ||
        address.id.toLowerCase().includes(searchTerm)
      )
    })
    
    return filteredAddresses
  } catch (error) {
    console.error('Error searching addresses:', error)
    throw error
  }
}

/**
 * Get address statistics for dashboard
 */
export async function getAddressStats(): Promise<AddressSummary> {
  try {
    const addresses = await getAddresses()
    
    const totalAddresses = addresses.length
    const emptyAddresses = addresses.filter(addr => addr.status === 'empty').length
    const filledAddresses = addresses.filter(addr => addr.status === 'filled').length
    
    // Group by street
    const streetMap = new Map<number, {
      streetId: number
      streetName: string
      totalAddresses: number
      emptyAddresses: number
      filledAddresses: number
    }>()
    
    addresses.forEach(address => {
      const streetId = address.street.id
      const streetName = address.street.name
      
      if (!streetMap.has(streetId)) {
        streetMap.set(streetId, {
          streetId,
          streetName,
          totalAddresses: 0,
          emptyAddresses: 0,
          filledAddresses: 0
        })
      }
      
      const streetStats = streetMap.get(streetId)!
      streetStats.totalAddresses++
      
      if (address.status === 'empty') {
        streetStats.emptyAddresses++
      } else {
        streetStats.filledAddresses++
      }
    })
    
    // Get recent addresses (last 5)
    const recentAddresses = addresses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    return {
      totalAddresses,
      emptyAddresses,
      filledAddresses,
      addressesByStreet: Array.from(streetMap.values()),
      recentAddresses
    }
  } catch (error) {
    console.error('Error getting address stats:', error)
    throw error
  }
}

/**
 * Get addresses by street
 */
export async function getAddressesByStreet(streetId: number): Promise<Address[]> {
  try {
    const addresses = await getAddresses()
    return addresses.filter(address => address.street.id === streetId)
  } catch (error) {
    console.error('Error fetching addresses by street:', error)
    throw error
  }
} 
