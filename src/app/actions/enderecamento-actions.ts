'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { 
  EnderecamentoWithDetails,
  CreateEnderecamentoDto, 
  EnderecamentoValidationErrors,
  EnderecamentoStats,
  AvailablePackage,
  AvailableAddress
} from '@/types/enderecamento'
import type { Address } from '@/types/address'
import { getAllPackages } from './package-actions'
import { getAddresses, updateAddress } from './address-actions'

/**
 * Validation schemas using Zod
 */
const createEnderecamentoSchema = z.object({
  packageId: z.string()
    .min(1, 'Pacote é obrigatório')
    .uuid('ID do pacote deve ser um UUID válido'),
  addressId: z.string()
    .min(1, 'Endereço é obrigatório')
    .uuid('ID do endereço deve ser um UUID válido')
})

/**
 * Validate form data against a schema
 */
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreateEnderecamentoDto, 
  errors?: EnderecamentoValidationErrors 
} {
  const formObject = Object.fromEntries(data.entries())
  
  try {
    const validatedData = schema.parse(formObject) as CreateEnderecamentoDto
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: EnderecamentoValidationErrors = {}
      
      error.issues.forEach(err => {
        const field = err.path[0] as keyof EnderecamentoValidationErrors
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
 * Generate human-readable address code from address data
 */
function generateAddressCode(address: Address): string {
  // Create code like "A-01-002" (Street-Number-Complement)
  const streetPrefix = address.street.name.split(' ')[1]?.charAt(0)?.toUpperCase() || 'X'
  const paddedNumber = address.number.padStart(3, '0')
  return `${streetPrefix}-${paddedNumber}`
}

/**
 * Get all enderecamentos (packages assigned to addresses)
 * An enderecamento exists when an address has status 'filled' and contains packages
 */
export async function getEnderecamentos(): Promise<EnderecamentoWithDetails[]> {
  try {
    const [packages, addresses] = await Promise.all([
      getAllPackages(),
      getAddresses()
    ])

    // Find filled addresses and match them with packages
    const filledAddresses = addresses.filter(addr => addr.status === 'filled')
    const enderecamentos: EnderecamentoWithDetails[] = []

    // For each filled address, find packages assigned to it
    // Since we don't have direct package-address mapping in the backend,
    // we'll use a simple matching logic for now
    for (const address of filledAddresses) {
      // For simulation, we'll match the first available package to each filled address
      // In a real system, this would be stored in the database
      const unassignedPackage = packages.find(pkg => 
        !enderecamentos.some(end => end.package.id === pkg.id)
      )

      if (unassignedPackage) {
        const enderecamento: EnderecamentoWithDetails = {
          id: `END_${address.id}_${unassignedPackage.id}`, // Generate ID
          package: unassignedPackage,
          address: address,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addressCode: generateAddressCode(address),
          streetName: address.street.name,
          fullAddress: `${address.street.name}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}`,
          customerName: 'Cliente não identificado', // Would need to fetch from take-up
          takeUpCode: unassignedPackage.takeUpId.substring(0, 8)
        }
        enderecamentos.push(enderecamento)
      }
    }

    return enderecamentos
  } catch (error) {
    console.error('Error fetching enderecamentos:', error)
    throw error
  }
}

/**
 * Get enderecamento statistics for dashboard
 */
export async function getEnderecamentoStats(): Promise<EnderecamentoStats> {
  try {
    const [packages, addresses, enderecamentos] = await Promise.all([
      getAllPackages(),
      getAddresses(),
      getEnderecamentos()
    ])

    const filledAddresses = addresses.filter(addr => addr.status === 'filled')
    const emptyAddresses = addresses.filter(addr => addr.status === 'empty')
    const assignedPackageIds = enderecamentos.map(end => end.package.id)
    const unassignedPackages = packages.filter(pkg => !assignedPackageIds.includes(pkg.id))

    const occupancyPercentage = addresses.length > 0 
      ? Math.round((filledAddresses.length / addresses.length) * 100) 
      : 0

    return {
      totalEnderecamentos: enderecamentos.length,
      totalPackagesAssigned: enderecamentos.length,
      totalPackagesUnassigned: unassignedPackages.length,
      warehouseOccupancyPercentage: occupancyPercentage,
      addressesOccupied: filledAddresses.length,
      addressesAvailable: emptyAddresses.length,
      totalAddresses: addresses.length,
      recentEnderecamentos: enderecamentos.slice(0, 5) // Latest 5
    }
  } catch (error) {
    console.error('Error fetching enderecamento stats:', error)
    throw error
  }
}

/**
 * Get available packages for enderecamento (packages not yet assigned to addresses)
 */
export async function getAvailablePackages(): Promise<AvailablePackage[]> {
  try {
    const [packages, enderecamentos] = await Promise.all([
      getAllPackages(),
      getEnderecamentos()
    ])

    const assignedPackageIds = enderecamentos.map(end => end.package.id)
    const availablePackages = packages.filter(pkg => !assignedPackageIds.includes(pkg.id))

    // Transform to AvailablePackage with additional display info
    return availablePackages.map(pkg => ({
      ...pkg,
      customerName: 'Cliente não identificado', // Would need to fetch from take-up
      takeUpCode: pkg.takeUpId.substring(0, 8)
    }))
  } catch (error) {
    console.error('Error fetching available packages:', error)
    throw error
  }
}

/**
 * Get available addresses for enderecamento (addresses with 'empty' status)
 */
export async function getAvailableAddresses(): Promise<AvailableAddress[]> {
  try {
    const addresses = await getAddresses()
    const emptyAddresses = addresses.filter(addr => addr.status === 'empty')

    return emptyAddresses.map(addr => ({
      ...addr,
      addressCode: generateAddressCode(addr),
      fullAddress: `${addr.street.name}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ''}`
    }))
  } catch (error) {
    console.error('Error fetching available addresses:', error)
    throw error
  }
}

/**
 * Create a new enderecamento by assigning a package to an address
 * This updates the address status to 'filled'
 */
export async function createEnderecamento(
  prevState: { errors?: EnderecamentoValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: EnderecamentoValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, createEnderecamentoSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const enderecamentoData: CreateEnderecamentoDto = validation.data as CreateEnderecamentoDto

    // Validate package exists and is available
    const availablePackages = await getAvailablePackages()
    const packageExists = availablePackages.some(pkg => pkg.id === enderecamentoData.packageId)
    if (!packageExists) {
      return {
        errors: {
          packageId: ['Pacote não encontrado ou já endereçado']
        }
      }
    }

    // Validate address exists and is available
    const availableAddresses = await getAvailableAddresses()
    const addressExists = availableAddresses.some(addr => addr.id === enderecamentoData.addressId)
    if (!addressExists) {
      return {
        errors: {
          addressId: ['Endereço não encontrado ou já ocupado']
        }
      }
    }

    // Update address status to 'filled' to create the enderecamento
    const updateFormData = new FormData()
    const address = availableAddresses.find(addr => addr.id === enderecamentoData.addressId)!
    updateFormData.append('streetId', address.street.id.toString())
    updateFormData.append('number', address.number)
    updateFormData.append('complement', address.complement)
    updateFormData.append('status', 'filled')

    const updateResult = await updateAddress(enderecamentoData.addressId, { message: '' }, updateFormData)
    
    if (updateResult.errors) {
      return {
        errors: {
          general: ['Erro ao criar endereçamento: falha ao atualizar endereço']
        }
      }
    }

    console.log('✅ Enderecamento created successfully')
    
    // Revalidate relevant pages
    revalidatePath('/dashboard/enderecamento')
    revalidatePath('/dashboard/addresses')
    revalidatePath('/dashboard')
    
    return { message: 'Endereçamento criado com sucesso!' }
    
  } catch (error) {
    console.error('❌ Error creating enderecamento:', error)
    return { 
      errors: { 
        general: ['Erro interno do servidor'] 
      } 
    }
  }
}

/**
 * Remove an enderecamento by freeing the address (updating status to 'empty')
 */
export async function removeEnderecamento(addressId: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Get address details
    const addresses = await getAddresses()
    const address = addresses.find(addr => addr.id === addressId)
    
    if (!address) {
      return {
        success: false,
        message: 'Endereço não encontrado'
      }
    }

    if (address.status !== 'filled') {
      return {
        success: false,
        message: 'Endereço não está ocupado'
      }
    }

    // Update address status to 'empty' to remove the enderecamento
    const updateFormData = new FormData()
    updateFormData.append('streetId', address.street.id.toString())
    updateFormData.append('number', address.number)
    updateFormData.append('complement', address.complement)
    updateFormData.append('status', 'empty')

    const updateResult = await updateAddress(addressId, { message: '' }, updateFormData)
    
    if (updateResult.errors) {
      return {
        success: false,
        message: 'Erro ao remover endereçamento'
      }
    }

    console.log('✅ Enderecamento removed successfully')
    
    // Revalidate relevant pages
    revalidatePath('/dashboard/enderecamento')
    revalidatePath('/dashboard/addresses')
    revalidatePath('/dashboard')
    
    return { 
      success: true, 
      message: 'Endereçamento removido com sucesso!' 
    }
    
  } catch (error) {
    console.error('❌ Error removing enderecamento:', error)
    return { 
      success: false, 
      message: 'Erro interno do servidor' 
    }
  }
}

/**
 * Get a specific enderecamento by address ID
 */
export async function getEnderecamento(addressId: string): Promise<EnderecamentoWithDetails | null> {
  try {
    const enderecamentos = await getEnderecamentos()
    return enderecamentos.find(end => end.address.id === addressId) || null
  } catch (error) {
    console.error('Error fetching enderecamento:', error)
    throw error
  }
}

/**
 * Search enderecamentos with filters
 */
export async function searchEnderecamentos(query: string): Promise<EnderecamentoWithDetails[]> {
  try {
    const enderecamentos = await getEnderecamentos()
    
    if (!query.trim()) {
      return enderecamentos
    }

    const lowercaseQuery = query.toLowerCase().trim()
    
    return enderecamentos.filter(end =>
      end.package.packageNumber.toLowerCase().includes(lowercaseQuery) ||
      end.package.lot.toLowerCase().includes(lowercaseQuery) ||
      end.addressCode?.toLowerCase().includes(lowercaseQuery) ||
      end.streetName?.toLowerCase().includes(lowercaseQuery) ||
      end.customerName?.toLowerCase().includes(lowercaseQuery) ||
      end.takeUpCode?.toLowerCase().includes(lowercaseQuery)
    )
  } catch (error) {
    console.error('Error searching enderecamentos:', error)
    throw error
  }
} 
