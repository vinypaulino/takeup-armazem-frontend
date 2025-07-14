'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { 
  Package, 
  CreatePackageDto, 
  UpdatePackageDto, 
  PackageValidationErrors,
  PackageStats
} from '@/types/take-up'
import { 
  fetchFromBackend,
  transformBackendResponse,
  transformBackendResponseArray
} from '@/lib/api'

/**
 * Validation schemas using Zod
 */
const createPackageSchema = z.object({
  packageNumber: z.string()
    .min(1, 'Número do pacote é obrigatório')
    .max(100, 'Número do pacote deve ter no máximo 100 caracteres')
    .trim(),
  lot: z.string()
    .min(1, 'Lote é obrigatório')
    .max(100, 'Lote deve ter no máximo 100 caracteres')
    .trim(),
  weight: z.coerce.number()
    .min(0.01, 'Peso deve ser maior que 0')
    .max(99999.99, 'Peso deve ser no máximo 99999.99 kg'),
  takeUpId: z.string()
    .min(1, 'Take-up é obrigatório')
    .uuid('ID do take-up deve ser um UUID válido')
})

const updatePackageSchema = z.object({
  packageNumber: z.string()
    .min(1, 'Número do pacote é obrigatório')
    .max(100, 'Número do pacote deve ter no máximo 100 caracteres')
    .trim(),
  lot: z.string()
    .min(1, 'Lote é obrigatório')
    .max(100, 'Lote deve ter no máximo 100 caracteres')
    .trim(),
  weight: z.coerce.number()
    .min(0.01, 'Peso deve ser maior que 0')
    .max(99999.99, 'Peso deve ser no máximo 99999.99 kg')
})

/**
 * Validate form data against a schema
 */
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreatePackageDto | UpdatePackageDto, 
  errors?: PackageValidationErrors 
} {
  const formObject = Object.fromEntries(data.entries())
  
  try {
    const validatedData = schema.parse(formObject) as CreatePackageDto | UpdatePackageDto
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: PackageValidationErrors = {}
      
      error.issues.forEach(err => {
        const field = err.path[0] as keyof PackageValidationErrors
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
 * Get all packages across all take-ups
 */
export async function getAllPackages(): Promise<Package[]> {
  try {
    const rawPackages = await fetchFromBackend<Record<string, unknown>[]>('/take-ups/packages', {
      method: 'GET',
    }, false) // shouldRedirectOnError
    const packages = transformBackendResponseArray(rawPackages) as unknown as Package[]
    return packages
  } catch (error) {
    console.error('Error fetching all packages:', error)
    throw error
  }
}

/**
 * Get packages for a specific take-up
 */
export async function getPackagesByTakeUp(takeUpId: string): Promise<Package[]> {
  try {
    const rawPackages = await fetchFromBackend<Record<string, unknown>[]>(`/take-ups/${takeUpId}/packages`, {
      method: 'GET',
    }, false) // shouldRedirectOnError
    const packages = transformBackendResponseArray(rawPackages) as unknown as Package[]
    return packages
  } catch (error) {
    console.error(`Error fetching packages for take-up ${takeUpId}:`, error)
    throw error
  }
}

/**
 * Get a specific package by ID
 */
export async function getPackage(id: string): Promise<Package> {
  try {
    const rawPackage = await fetchFromBackend<Record<string, unknown>>(`/take-ups/packages/${id}`, {
      method: 'GET',
    }, false) // shouldRedirectOnError
    const packageData = transformBackendResponse(rawPackage) as unknown as Package
    return packageData
  } catch (error) {
    console.error(`Error fetching package ${id}:`, error)
    throw error
  }
}

/**
 * Validate take-up exists
 */
async function validateTakeUpExists(takeUpId: string): Promise<boolean> {
  try {
    await fetchFromBackend<Record<string, unknown>>(`/take-ups/${takeUpId}`, {
      method: 'GET',
    }, false) // shouldRedirectOnError
    return true
  } catch (error) {
    console.error(`Take-up validation failed for ${takeUpId}:`, error)
    return false
  }
}

/**
 * Check if package number already exists in the same take-up
 */
async function validateUniquePackageNumber(packageNumber: string, takeUpId: string, excludeId?: string): Promise<boolean> {
  try {
    const packages = await getPackagesByTakeUp(takeUpId)
    
    const duplicatePackage = packages.find(pkg => 
      pkg.packageNumber === packageNumber && 
      pkg.id !== excludeId
    )
    
    return !duplicatePackage
  } catch (error) {
    console.error(`Package number validation failed:`, error)
    // If we can't validate, allow the operation to proceed
    return true
  }
}

/**
 * Create a new package for a take-up
 */
export async function createPackage(
  prevState: { errors?: PackageValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: PackageValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, createPackageSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const packageData: CreatePackageDto = validation.data as CreatePackageDto

    // Validate take-up exists
    const takeUpExists = await validateTakeUpExists(packageData.takeUpId)
    if (!takeUpExists) {
      return {
        errors: {
          takeUpId: ['Take-up não encontrado']
        }
      }
    }

    // Validate unique package number within take-up
    const isUniquePackageNumber = await validateUniquePackageNumber(
      packageData.packageNumber, 
      packageData.takeUpId
    )
    if (!isUniquePackageNumber) {
      return {
        errors: {
          packageNumber: ['Número do pacote já existe neste take-up']
        }
      }
    }

    // Create package in backend via take-up endpoint
    const rawPackage = await fetchFromBackend<Record<string, unknown>>(
      `/take-ups/packages`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageNumber: packageData.packageNumber,
          lot: packageData.lot,
          weight: packageData.weight,
          takeUpId: packageData.takeUpId
        })
      },
      false // shouldRedirectOnError
    )
    const newPackage = transformBackendResponse(rawPackage) as unknown as Package
    
    console.log('✅ Package created successfully:', newPackage.packageNumber)
    
    // Revalidate pages that might show package data
    revalidatePath('/dashboard/take-up')
    revalidatePath(`/dashboard/take-up/${packageData.takeUpId}`)
    revalidatePath('/dashboard/pacotes')
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error('❌ Error creating package:', error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('TakeUp not found')) {
      return { 
        errors: { 
          takeUpId: ['Take-up não encontrado'] 
        } 
      }
    }
    
    if (error instanceof Error && error.message.includes('packageNumber')) {
      return { 
        errors: { 
          packageNumber: ['Número do pacote já existe ou é inválido'] 
        } 
      }
    }
    
    if (error instanceof Error && error.message.includes('weight')) {
      return { 
        errors: { 
          weight: ['Peso inválido'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao criar pacote. Tente novamente.'] 
      } 
    }
  }
  
  // Return success without redirect to stay on the same page
  return { message: 'Pacote criado com sucesso' }
}

/**
 * Update an existing package
 */
export async function updatePackage(
  id: string,
  prevState: { errors?: PackageValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: PackageValidationErrors, message?: string }> {
  try {
    // Validate form data first
    const validation = validateFormData(formData, updatePackageSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const packageData: UpdatePackageDto = validation.data as UpdatePackageDto

    // Try to get current package to access takeUpId for validation
    let currentPackage: Package | null = null
    try {
      currentPackage = await getPackage(id)
    } catch (error) {
      // If package doesn't exist, return appropriate error
      console.error(`❌ Package ${id} not found:`, error)
      return { 
        errors: { 
          general: ['Pacote não encontrado'] 
        } 
      }
    }

    // Validate unique package number within take-up (excluding current package)
    const isUniquePackageNumber = await validateUniquePackageNumber(
      packageData.packageNumber, 
      currentPackage.takeUpId,
      id
    )
    if (!isUniquePackageNumber) {
      return {
        errors: {
          packageNumber: ['Número do pacote já existe neste take-up']
        }
      }
    }

    // Update package in backend
    const rawPackage = await fetchFromBackend<Record<string, unknown>>(
      `/take-ups/packages/${id}`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData)
      },
      false // shouldRedirectOnError
    )
    const updatedPackage = transformBackendResponse(rawPackage) as unknown as Package
    
    console.log('✅ Package updated successfully:', updatedPackage.packageNumber)
    
    // Revalidate pages that might show package data
    revalidatePath('/dashboard/take-up')
    revalidatePath(`/dashboard/take-up/${updatedPackage.takeUpId}`)
    revalidatePath('/dashboard/pacotes')
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error(`❌ Error updating package ${id}:`, error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('Package not found')) {
      return { 
        errors: { 
          general: ['Pacote não encontrado'] 
        } 
      }
    }
    
    if (error instanceof Error && error.message.includes('packageNumber')) {
      return { 
        errors: { 
          packageNumber: ['Número do pacote já existe ou é inválido'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao atualizar pacote. Tente novamente.'] 
      } 
    }
  }
  
  // Return success without redirect to stay on the same page
  return { message: 'Pacote atualizado com sucesso' }
}

/**
 * Delete a package
 */
export async function deletePackage(id: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Try to get package info before deletion for revalidation
    let takeUpId: string | null = null
    try {
      const packageData = await getPackage(id)
      takeUpId = packageData.takeUpId
    } catch (error) {
      // If package doesn't exist, return appropriate error
      console.error(`❌ Package ${id} not found for deletion:`, error)
      return { success: false, message: 'Pacote não encontrado' }
    }
    
    // Delete package from backend
    await fetchFromBackend(
      `/take-ups/packages/${id}`,
      {
        method: 'DELETE',
      },
      false // shouldRedirectOnError
    )
    
    // Revalidate pages that might show package data
    revalidatePath('/dashboard/take-up')
    if (takeUpId) {
      revalidatePath(`/dashboard/take-up/${takeUpId}`)
    }
    revalidatePath('/dashboard/pacotes')
    revalidatePath('/dashboard')
    
    console.log(`Package ${id} deleted successfully`)
    
    return { success: true, message: 'Pacote excluído com sucesso' }
    
  } catch (error) {
    console.error(`Error deleting package ${id}:`, error)
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('404')) {
      return { success: false, message: 'Pacote não encontrado' }
    }
    
    return { success: false, message: 'Erro ao excluir pacote. Tente novamente.' }
  }
}

/**
 * Search packages by package number or lot
 */
export async function searchPackages(query: string): Promise<Package[]> {
  try {
    const rawPackages = await fetchFromBackend<Record<string, unknown>[]>('/packages', {
      method: 'GET',
    }, false) // shouldRedirectOnError
    const allPackages = transformBackendResponseArray(rawPackages) as unknown as Package[]
    
    if (!query.trim()) {
      return allPackages
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    return allPackages.filter(packageData => 
      packageData.packageNumber.toLowerCase().includes(searchTerm) ||
      packageData.lot.toLowerCase().includes(searchTerm) ||
      packageData.id.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching packages:', error)
    throw error
  }
}

/**
 * Get package statistics for dashboard
 */
export async function getPackageStats(): Promise<PackageStats> {
  try {
    const rawPackages = await fetchFromBackend<Record<string, unknown>[]>('/take-ups/packages', {
      method: 'GET',
    }, false) // shouldRedirectOnError
    const packages = transformBackendResponseArray(rawPackages) as unknown as Package[]
    
    const totalWeight = packages.reduce((sum, pkg) => sum + Number(pkg.weight), 0)
    const avgWeight = packages.length > 0 ? totalWeight / packages.length : 0
    
    const recentPackages = packages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
    
    return {
      totalPackages: packages.length,
      totalWeight: Math.round(totalWeight * 100) / 100, // Round to 2 decimals
      avgWeight: Math.round(avgWeight * 100) / 100,     // Round to 2 decimals
      recentPackages
    }
  } catch (error) {
    console.error('Error fetching package stats:', error)
    throw error
  }
} 
