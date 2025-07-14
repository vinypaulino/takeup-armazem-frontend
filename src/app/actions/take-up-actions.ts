'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { 
  TakeUp, 
  CreateTakeUpDto, 
  UpdateTakeUpDto, 
  TakeUpValidationErrors,
  TakeUpStats,
  CustomerOption
} from '@/types/take-up'
import type { Customer } from '@/types/customer'
import { 
  createResource, 
  updateResource, 
  deleteResource,
  fetchFromBackend,
  transformBackendResponse,
  transformBackendResponseArray
} from '@/lib/api'

/**
 * Validation schemas using Zod
 */
const createTakeUpSchema = z.object({
  customerId: z.string()
    .min(1, 'Cliente é obrigatório')
    .uuid('ID do cliente deve ser um UUID válido')
})

const updateTakeUpSchema = z.object({
  customerId: z.string()
    .min(1, 'Cliente é obrigatório')
    .uuid('ID do cliente deve ser um UUID válido')
})

/**
 * Validate form data against a schema
 */
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreateTakeUpDto | UpdateTakeUpDto, 
  errors?: TakeUpValidationErrors 
} {
  const formObject = Object.fromEntries(data.entries())
  
  try {
    const validatedData = schema.parse(formObject) as CreateTakeUpDto | UpdateTakeUpDto
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: TakeUpValidationErrors = {}
      
      error.issues.forEach(err => {
        const field = err.path[0] as keyof TakeUpValidationErrors
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
 * Get all take-ups with customer and package information
 */
export async function getTakeUps(): Promise<TakeUp[]> {
  try {
    const rawTakeUps = await fetchFromBackend<Record<string, unknown>[]>('/take-ups', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const takeUps = transformBackendResponseArray(rawTakeUps) as unknown as TakeUp[]
    return takeUps
  } catch (error) {
    console.error('Error fetching take-ups:', error)
    throw error
  }
}

/**
 * Get a specific take-up by ID with full customer and package data
 */
export async function getTakeUp(id: string): Promise<TakeUp> {
  try {
    const rawTakeUp = await fetchFromBackend<Record<string, unknown>>(`/take-ups/${id}`, {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const takeUp = transformBackendResponse(rawTakeUp) as unknown as TakeUp
    return takeUp
  } catch (error) {
    console.error(`Error fetching take-up ${id}:`, error)
    throw error
  }
}

/**
 * Get all customers for dropdown selection
 */
export async function getCustomersForSelection(): Promise<CustomerOption[]> {
  try {
    const rawCustomers = await fetchFromBackend<Record<string, unknown>[]>('/customers', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const customers = transformBackendResponseArray(rawCustomers) as unknown as Customer[]
    
    return customers.map(customer => ({
      value: customer.id,
      label: customer.name,
      cnpj: customer.cnpj
    }))
  } catch (error) {
    console.error('Error fetching customers for selection:', error)
    throw error
  }
}

/**
 * Validate customer exists
 */
async function validateCustomerExists(customerId: string): Promise<boolean> {
  try {
    await fetchFromBackend<Record<string, unknown>>(`/customers/${customerId}`, {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    return true
  } catch (error) {
    console.error(`Customer validation failed for ${customerId}:`, error)
    return false
  }
}

/**
 * Create a new take-up
 */
export async function createTakeUp(
  prevState: { errors?: TakeUpValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: TakeUpValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, createTakeUpSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const takeUpData: CreateTakeUpDto = validation.data as CreateTakeUpDto

    // Validate customer exists
    const customerExists = await validateCustomerExists(takeUpData.customerId)
    if (!customerExists) {
      return {
        errors: {
          customerId: ['Cliente não encontrado']
        }
      }
    }

    // Create take-up in backend
    const rawTakeUp = await createResource<Record<string, unknown>>('/take-ups', takeUpData)
    const newTakeUp = transformBackendResponse(rawTakeUp) as unknown as TakeUp
    
    console.log('✅ Take-up created successfully for customer:', newTakeUp.customer.name)
    
    // Revalidate pages that might show take-up data
    revalidatePath('/dashboard/take-up')
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error('❌ Error creating take-up:', error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('Customer not found')) {
      return { 
        errors: { 
          customerId: ['Cliente não encontrado'] 
        } 
      }
    }
    
    if (error instanceof Error && error.message.includes('customerId')) {
      return { 
        errors: { 
          customerId: ['ID do cliente é inválido'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao criar take-up. Tente novamente.'] 
      } 
    }
  }
  
  // Redirect after successful operation (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect('/dashboard/take-up')
}

/**
 * Update an existing take-up
 */
export async function updateTakeUp(
  id: string,
  prevState: { errors?: TakeUpValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: TakeUpValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, updateTakeUpSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const takeUpData: UpdateTakeUpDto = validation.data as UpdateTakeUpDto

    // Validate customer exists
    const customerExists = await validateCustomerExists(takeUpData.customerId)
    if (!customerExists) {
      return {
        errors: {
          customerId: ['Cliente não encontrado']
        }
      }
    }

    // Update take-up in backend
    const rawTakeUp = await updateResource<Record<string, unknown>>(`/take-ups/${id}`, takeUpData)
    const updatedTakeUp = transformBackendResponse(rawTakeUp) as unknown as TakeUp
    
    console.log('✅ Take-up updated successfully for customer:', updatedTakeUp.customer.name)
    
    // Revalidate pages that might show take-up data
    revalidatePath('/dashboard/take-up')
    revalidatePath(`/dashboard/take-up/${id}`)
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error(`❌ Error updating take-up ${id}:`, error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('Customer not found')) {
      return { 
        errors: { 
          customerId: ['Cliente não encontrado'] 
        } 
      }
    }
    
    if (error instanceof Error && error.message.includes('TakeUp not found')) {
      return { 
        errors: { 
          general: ['Take-up não encontrado'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao atualizar take-up. Tente novamente.'] 
      } 
    }
  }
  
  // Redirect after successful operation (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect('/dashboard/take-up')
}

/**
 * Delete a take-up (will cascade delete associated packages)
 */
export async function deleteTakeUp(id: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Delete take-up from backend
    await deleteResource(`/take-ups/${id}`)
    
    // Revalidate pages that might show take-up data
    revalidatePath('/dashboard/take-up')
    revalidatePath('/dashboard')
    
    console.log(`Take-up ${id} deleted successfully`)
    
    return { success: true, message: 'Take-up excluído com sucesso' }
    
  } catch (error) {
    console.error(`Error deleting take-up ${id}:`, error)
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('404')) {
      return { success: false, message: 'Take-up não encontrado' }
    }
    
    return { success: false, message: 'Erro ao excluir take-up. Tente novamente.' }
  }
}

/**
 * Search take-ups by customer name or ID
 */
export async function searchTakeUps(query: string): Promise<TakeUp[]> {
  try {
    const rawTakeUps = await fetchFromBackend<Record<string, unknown>[]>('/take-ups', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const allTakeUps = transformBackendResponseArray(rawTakeUps) as unknown as TakeUp[]
    
    if (!query.trim()) {
      return allTakeUps
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    return allTakeUps.filter(takeUp => 
      takeUp.customer.name.toLowerCase().includes(searchTerm) ||
      takeUp.customer.cnpj.toLowerCase().includes(searchTerm) ||
      takeUp.id.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching take-ups:', error)
    throw error
  }
}

/**
 * Get take-up statistics for dashboard
 */
export async function getTakeUpStats(): Promise<TakeUpStats> {
  try {
    const rawTakeUps = await fetchFromBackend<Record<string, unknown>[]>('/take-ups', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const takeUps = transformBackendResponseArray(rawTakeUps) as unknown as TakeUp[]
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const newTakeUpsThisMonth = takeUps.filter(takeUp => 
      new Date(takeUp.createdAt) >= startOfMonth
    ).length
    
    const totalPackages = takeUps.reduce((sum, takeUp) => sum + takeUp.packages.length, 0)
    const avgPackagesPerTakeUp = takeUps.length > 0 ? totalPackages / takeUps.length : 0
    
    const recentTakeUps = takeUps
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    return {
      totalTakeUps: takeUps.length,
      totalPackages,
      newTakeUpsThisMonth,
      avgPackagesPerTakeUp: Math.round(avgPackagesPerTakeUp * 100) / 100, // Round to 2 decimals
      recentTakeUps
    }
  } catch (error) {
    console.error('Error fetching take-up stats:', error)
    throw error
  }
}

/**
 * Get take-ups for a specific customer
 */
export async function getTakeUpsByCustomer(customerId: string): Promise<TakeUp[]> {
  try {
    const rawTakeUps = await fetchFromBackend<Record<string, unknown>[]>('/take-ups', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const allTakeUps = transformBackendResponseArray(rawTakeUps) as unknown as TakeUp[]
    
    return allTakeUps.filter(takeUp => takeUp.customerId === customerId)
  } catch (error) {
    console.error(`Error fetching take-ups for customer ${customerId}:`, error)
    throw error
  }
} 
