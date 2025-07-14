'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { 
  Street, 
  CreateStreetDto, 
  UpdateStreetDto, 
  StreetValidationErrors,
  StreetStats
} from '@/types/street'
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
const createStreetSchema = z.object({
  name: z.string()
    .min(1, 'Nome da rua é obrigatório')
    .max(255, 'Nome da rua deve ter no máximo 255 caracteres')
    .trim()
})

const updateStreetSchema = createStreetSchema

/**
 * Validate form data against a schema
 */
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreateStreetDto | UpdateStreetDto, 
  errors?: StreetValidationErrors 
} {
  const formObject = Object.fromEntries(data.entries())
  
  try {
    const validatedData = schema.parse(formObject) as CreateStreetDto | UpdateStreetDto
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: StreetValidationErrors = {}
      
      error.issues.forEach(err => {
        const field = err.path[0] as keyof StreetValidationErrors
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
 * Get all streets
 */
export async function getStreets(): Promise<Street[]> {
  try {
    const rawStreets = await fetchResourceList<Record<string, unknown>>('/streets')
    const streets = transformBackendResponseArray(rawStreets) as unknown as Street[]
    return streets
  } catch (error) {
    console.error('Error fetching streets:', error)
    throw error
  }
}

/**
 * Get a specific street by ID
 */
export async function getStreet(id: number): Promise<Street> {
  try {
    const rawStreet = await fetchResource<Record<string, unknown>>('/streets', id.toString())
    const street = transformBackendResponse(rawStreet) as unknown as Street
    return street
  } catch (error) {
    console.error(`Error fetching street ${id}:`, error)
    throw error
  }
}

/**
 * Create a new street
 */
export async function createStreet(
  prevState: { errors?: StreetValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: StreetValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, createStreetSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const streetData: CreateStreetDto = validation.data as CreateStreetDto

    // Create street in backend
    const rawStreet = await createResource<Record<string, unknown>>('/streets', streetData)
    const newStreet = transformBackendResponse(rawStreet) as unknown as Street
    
    console.log('✅ Street created successfully:', newStreet.name)
    
    // Revalidate pages that might show street data
    revalidatePath('/dashboard/rua')
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error('❌ Error creating street:', error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('name')) {
      return { 
        errors: { 
          name: ['Nome da rua já está em uso'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao criar rua. Tente novamente.'] 
      } 
    }
  }
  
  // Redirect after successful operation (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect('/dashboard/rua')
}

/**
 * Update an existing street
 */
export async function updateStreet(
  id: number,
  prevState: { errors?: StreetValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: StreetValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, updateStreetSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const streetData: UpdateStreetDto = validation.data as UpdateStreetDto

    // Update street in backend
    const rawStreet = await updateResource<Record<string, unknown>>(`/streets/${id}`, streetData)
    const updatedStreet = transformBackendResponse(rawStreet) as unknown as Street
    
    console.log('✅ Street updated successfully:', updatedStreet.name)
    
    // Revalidate pages that might show street data
    revalidatePath('/dashboard/rua')
    revalidatePath(`/dashboard/rua/${id}`)
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error(`❌ Error updating street ${id}:`, error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('name')) {
      return { 
        errors: { 
          name: ['Nome da rua já está em uso'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao atualizar rua. Tente novamente.'] 
      } 
    }
  }
  
  // Redirect after successful operation (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect('/dashboard/rua')
}

/**
 * Delete a street
 */
export async function deleteStreet(id: number): Promise<{ success: boolean, message?: string }> {
  try {
    // Delete street from backend
    await deleteResource(`/streets/${id}`)
    
    // Revalidate pages that might show street data
    revalidatePath('/dashboard/rua')
    revalidatePath('/dashboard')
    
    console.log(`Street ${id} deleted successfully`)
    
    return { success: true, message: 'Rua excluída com sucesso' }
    
  } catch (error) {
    console.error(`Error deleting street ${id}:`, error)
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('404')) {
      return { success: false, message: 'Rua não encontrada' }
    }
    
    if (error instanceof Error && error.message.includes('constraint')) {
      return { success: false, message: 'Não é possível excluir esta rua pois ela possui endereços associados' }
    }
    
    return { success: false, message: 'Erro ao excluir rua. Tente novamente.' }
  }
}

/**
 * Search streets by name
 */
export async function searchStreets(query: string): Promise<Street[]> {
  try {
    const rawStreets = await fetchResourceList<Record<string, unknown>>('/streets')
    const allStreets = transformBackendResponseArray(rawStreets) as unknown as Street[]
    
    if (!query.trim()) {
      return allStreets
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    return allStreets.filter(street => 
      street.name.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching streets:', error)
    throw error
  }
}

/**
 * Get street statistics for dashboard
 */
export async function getStreetStats(): Promise<StreetStats> {
  try {
    const rawStreets = await fetchResourceList<Record<string, unknown>>('/streets')
    const streets = transformBackendResponseArray(rawStreets) as unknown as Street[]
    
    const recentStreets = streets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    return {
      totalStreets: streets.length,
      recentStreets
    }
  } catch (error) {
    console.error('Error fetching street stats:', error)
    throw error
  }
} 
