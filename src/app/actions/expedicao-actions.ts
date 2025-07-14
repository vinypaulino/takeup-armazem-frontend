'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { 
  Expedicao, 
  ExpedicaoWithDetails,
  CreateExpedicaoDto, 
  UpdateExpedicaoDto, 
  ExpedicaoValidationErrors,
  ExpedicaoStats,
  ExpedicaoStatus,
  AvailablePackageForShipping
} from '@/types/expedicao'
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
const createExpedicaoSchema = z.object({
  code: z.string()
    .min(1, 'Código é obrigatório')
    .max(50, 'Código deve ter no máximo 50 caracteres'),
  destination: z.string()
    .min(1, 'Destino é obrigatório')
    .max(255, 'Destino deve ter no máximo 255 caracteres'),
  responsible: z.string()
    .min(1, 'Responsável é obrigatório')
    .max(100, 'Nome do responsável deve ter no máximo 100 caracteres'),
  carrier: z.string()
    .min(1, 'Transportadora é obrigatória')
    .max(100, 'Nome da transportadora deve ter no máximo 100 caracteres'),
  tracking: z.string()
    .min(1, 'Código de rastreamento é obrigatório')
    .max(100, 'Código de rastreamento deve ter no máximo 100 caracteres'),
  packageIds: z.array(z.string().uuid('IDs dos pacotes devem ser UUIDs válidos'))
    .min(1, 'Pelo menos um pacote deve ser selecionado'),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional()
})

// updateExpedicaoSchema removed as it's not currently used

/**
 * Validate form data against a schema
 */
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreateExpedicaoDto | UpdateExpedicaoDto, 
  errors?: ExpedicaoValidationErrors 
} {
  const formObject: Record<string, FormDataEntryValue | FormDataEntryValue[]> = Object.fromEntries(data.entries())
  
  // Handle packageIds array from FormData
  if (formObject.packageIds) {
    const packageIds = Array.isArray(formObject.packageIds) 
      ? formObject.packageIds 
      : [formObject.packageIds]
    formObject.packageIds = packageIds
  }
  
  try {
    const validatedData = schema.parse(formObject) as CreateExpedicaoDto | UpdateExpedicaoDto
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ExpedicaoValidationErrors = {}
      
      error.issues.forEach((err) => {
        const field = err.path[0] as keyof ExpedicaoValidationErrors
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
 * Get all expeditions
 */
export async function getExpedicoes(): Promise<ExpedicaoWithDetails[]> {
  try {
    const response = await fetchFromBackend<Expedicao[]>('/expedicoes', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const transformedResponse = transformBackendResponseArray(response as unknown as Record<string, unknown>[]) as unknown as ExpedicaoWithDetails[]
    
    // Add computed fields for display
    return transformedResponse.map(expedicao => ({
      ...expedicao,
      customerNames: [], // This would be populated by the backend
      takeUpCodes: [], // This would be populated by the backend
      daysInTransit: expedicao.status !== 'Preparando' ? 
        Math.floor((new Date().getTime() - new Date(expedicao.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      isOverdue: expedicao.expectedDelivery ? 
        new Date() > new Date(expedicao.expectedDelivery) && expedicao.status !== 'Entregue' : false
    }))
  } catch (error) {
    console.error('Error fetching expeditions:', error)
    // Return empty array with fallback data when backend is unavailable
    return []
  }
}

/**
 * Get expedition statistics
 */
export async function getExpedicaoStats(): Promise<ExpedicaoStats> {
  try {
    const response = await fetchFromBackend<ExpedicaoStats>('/expedicoes/stats', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    return transformBackendResponse(response as unknown as Record<string, unknown>) as unknown as ExpedicaoStats
  } catch (error) {
    console.error('Error fetching expedition stats:', error)
    // Return default stats if backend fails
    return {
      totalExpedicoes: 0,
      totalPackagesShipped: 0,
      expeditionsInProgress: 0,
      expeditionsDelivered: 0,
      expeditionsOverdue: 0,
      averageTransitDays: 0,
      totalWeightShipped: 0,
      recentExpedicoes: [],
      statusBreakdown: {
        'Preparando': 0,
        'Expedido': 0,
        'Em Trânsito': 0,
        'Entregue': 0
      }
    }
  }
}

/**
 * Get available packages for shipping
 */
export async function getAvailablePackagesForShipping(): Promise<AvailablePackageForShipping[]> {
  try {
    const response = await fetchFromBackend<AvailablePackageForShipping[]>('/packages/available-for-shipping', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    return transformBackendResponseArray(response as unknown as Record<string, unknown>[]) as unknown as AvailablePackageForShipping[]
  } catch (error) {
    console.error('Error fetching available packages:', error)
    // Return empty array when backend is unavailable
    return []
  }
}

/**
 * Create a new expedition
 */
export async function createExpedicao(
  prevState: { errors?: ExpedicaoValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: ExpedicaoValidationErrors, message?: string }> {
  try {
    const validation = validateFormData(formData, createExpedicaoSchema)
    
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const expedicaoData = validation.data as CreateExpedicaoDto

    // Create the expedition
    await createResource<Expedicao>('/expedicoes', {
      code: expedicaoData.code,
      destination: expedicaoData.destination,
      responsible: expedicaoData.responsible,
      carrier: expedicaoData.carrier,
      tracking: expedicaoData.tracking,
      package_ids: expedicaoData.packageIds, // Backend expects snake_case
      expected_delivery: expedicaoData.expectedDelivery,
      notes: expedicaoData.notes,
      status: 'Preparando' // Default status
    })

    revalidatePath('/dashboard/expedicao')
    redirect('/dashboard/expedicao')
  } catch (error) {
    console.error('Error creating expedition:', error)
    
    return {
      errors: {
        general: ['Erro ao criar expedição. Tente novamente.']
      }
    }
  }
}

/**
 * Update expedition status
 */
export async function updateExpedicaoStatus(
  expeditionId: string,
  newStatus: ExpedicaoStatus,
  notes?: string
): Promise<{ success: boolean, message?: string }> {
  try {
    const updateData: Record<string, unknown> = {
      status: newStatus
    }

    if (notes) {
      updateData.notes = notes
    }

    // Set actual delivery date if status is "Entregue"
    if (newStatus === 'Entregue') {
      updateData.actual_delivery = new Date().toISOString()
    }

    await updateResource(`/expedicoes/${expeditionId}`, updateData)
    
    revalidatePath('/dashboard/expedicao')
    
    return {
      success: true,
      message: `Status da expedição atualizado para "${newStatus}" com sucesso.`
    }
  } catch (error) {
    console.error('Error updating expedition status:', error)
    
    return {
      success: false,
      message: 'Erro ao atualizar status da expedição. Tente novamente.'
    }
  }
}

/**
 * Delete an expedition
 */
export async function deleteExpedicao(expeditionId: string): Promise<{ success: boolean, message?: string }> {
  try {
    await deleteResource(`/expedicoes/${expeditionId}`)
    
    revalidatePath('/dashboard/expedicao')
    
    return {
      success: true,
      message: 'Expedição excluída com sucesso.'
    }
  } catch (error) {
    console.error('Error deleting expedition:', error)
    
    return {
      success: false,
      message: 'Erro ao excluir expedição. Tente novamente.'
    }
  }
}

/**
 * Search expeditions by query
 */
export async function searchExpedicoes(query: string): Promise<ExpedicaoWithDetails[]> {
  try {
    if (!query.trim()) {
      return getExpedicoes()
    }

    const response = await fetchFromBackend<Expedicao[]>(`/expedicoes/search?q=${encodeURIComponent(query)}`)
    const transformedResponse = transformBackendResponseArray(response as unknown as Record<string, unknown>[]) as unknown as ExpedicaoWithDetails[]
    
    // Add computed fields for display
    return transformedResponse.map(expedicao => ({
      ...expedicao,
      customerNames: [],
      takeUpCodes: [],
      daysInTransit: expedicao.status !== 'Preparando' ? 
        Math.floor((new Date().getTime() - new Date(expedicao.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      isOverdue: expedicao.expectedDelivery ? 
        new Date() > new Date(expedicao.expectedDelivery) && expedicao.status !== 'Entregue' : false
    }))
  } catch (error) {
    console.error('Error searching expeditions:', error)
    throw error
  }
}

/**
 * Get expedition by ID
 */
export async function getExpedicao(id: string): Promise<ExpedicaoWithDetails> {
  try {
    const response = await fetchFromBackend<Expedicao>(`/expedicoes/${id}`)
    const expedicao = transformBackendResponse(response as unknown as Record<string, unknown>) as unknown as ExpedicaoWithDetails
    
    // Add computed fields
    return {
      ...expedicao,
      customerNames: [],
      takeUpCodes: [],
      daysInTransit: expedicao.status !== 'Preparando' ? 
        Math.floor((new Date().getTime() - new Date(expedicao.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      isOverdue: expedicao.expectedDelivery ? 
        new Date() > new Date(expedicao.expectedDelivery) && expedicao.status !== 'Entregue' : false
    }
  } catch (error) {
    console.error('Error fetching expedition:', error)
    throw error
  }
}
