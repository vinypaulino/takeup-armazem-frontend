'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { 
  fetchResourceList, 
  fetchResource, 
  createResource, 
  updateResource, 
  deleteResource,
  fetchFromBackend,
  transformBackendResponse,
  transformBackendResponseArray
} from '@/lib/api'
import { 
  Customer, 
  CreateCustomerDto, 
  UpdateCustomerDto,
  CustomerValidationErrors
} from '@/types/customer'

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  cnpj: z.string()
    .min(1, 'CNPJ é obrigatório')
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve ter o formato XX.XXX.XXX/XXXX-XX')
})

const updateCustomerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional(),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve ter o formato XX.XXX.XXX/XXXX-XX')
    .optional(),
})

// Helper function to validate form data
function validateFormData(data: FormData, schema: z.ZodSchema): { 
  success: boolean, 
  data?: CreateCustomerDto | UpdateCustomerDto, 
  errors?: CustomerValidationErrors 
} {
  const formObject = Object.fromEntries(data.entries())
  const result = schema.safeParse(formObject)
  
  if (!result.success) {
    const errors: CustomerValidationErrors = {}
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      if (!errors[field as keyof CustomerValidationErrors]) {
        errors[field as keyof CustomerValidationErrors] = []
      }
      errors[field as keyof CustomerValidationErrors]!.push(issue.message)
    })
    return { success: false, errors }
  }
  
  return { success: true, data: result.data as CreateCustomerDto | UpdateCustomerDto }
}

/**
 * Fetch all customers from the backend
 */
export async function getCustomers(): Promise<Customer[]> {
  try {
    const rawCustomers = await fetchFromBackend<Record<string, unknown>[]>('/customers', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const customers = transformBackendResponseArray(rawCustomers) as unknown as Customer[]
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

/**
 * Fetch a single customer by ID
 */
export async function getCustomer(id: string): Promise<Customer> {
  try {
    const rawCustomer = await fetchResource<Record<string, unknown>>('/customers', id)
    const customer = transformBackendResponse(rawCustomer) as unknown as Customer
    return customer
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    throw error
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(
  prevState: { errors?: CustomerValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: CustomerValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, createCustomerSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const customerData: CreateCustomerDto = validation.data as CreateCustomerDto

    // Create customer in backend
    const rawCustomer = await createResource<Record<string, unknown>>('/customers', customerData)
    const newCustomer = transformBackendResponse(rawCustomer) as unknown as Customer
    
    console.log('✅ Customer created successfully:', newCustomer.name)
    
    // Revalidate pages that might show customer data
    revalidatePath('/dashboard/clientes')
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error('❌ Error creating customer:', error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('CNPJ')) {
      return { 
        errors: { 
          cnpj: ['CNPJ já está em uso'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao criar cliente. Tente novamente.'] 
      } 
    }
  }
  
  // Redirect after successful operation (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect('/dashboard/clientes')
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  id: string,
  prevState: { errors?: CustomerValidationErrors, message?: string },
  formData: FormData
): Promise<{ errors?: CustomerValidationErrors, message?: string }> {
  try {
    // Validate form data
    const validation = validateFormData(formData, updateCustomerSchema)
    if (!validation.success) {
      return { errors: validation.errors }
    }

    const customerData: UpdateCustomerDto = validation.data as UpdateCustomerDto

    // Update customer in backend
    const rawCustomer = await updateResource<Record<string, unknown>>(`/customers/${id}`, customerData)
    const updatedCustomer = transformBackendResponse(rawCustomer) as unknown as Customer
    
    console.log('✅ Customer updated successfully:', updatedCustomer.name)
    
    // Revalidate pages that might show customer data
    revalidatePath('/dashboard/clientes')
    revalidatePath(`/dashboard/clientes/${id}`)
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error(`❌ Error updating customer ${id}:`, error)
    
    // Handle validation errors from backend
    if (error instanceof Error && error.message.includes('CNPJ')) {
      return { 
        errors: { 
          cnpj: ['CNPJ já está em uso'] 
        } 
      }
    }
    
    return { 
      errors: { 
        general: ['Erro ao atualizar cliente. Tente novamente.'] 
      } 
    }
  }
  
  // Redirect after successful operation (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect('/dashboard/clientes')
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Delete customer from backend
    await deleteResource(`/customers/${id}`)
    
    // Revalidate pages that might show customer data
    revalidatePath('/dashboard/clientes')
    revalidatePath('/dashboard')
    
    console.log(`Customer ${id} deleted successfully`)
    
    return { success: true, message: 'Cliente excluído com sucesso' }
    
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error)
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('404')) {
      return { success: false, message: 'Cliente não encontrado' }
    }
    
    if (error instanceof Error && error.message.includes('constraint')) {
      return { success: false, message: 'Não é possível excluir este cliente pois ele possui take-ups associados' }
    }
    
    return { success: false, message: 'Erro ao excluir cliente. Tente novamente.' }
  }
}

/**
 * Search customers by name or CNPJ
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const rawCustomers = await fetchFromBackend<Record<string, unknown>[]>('/customers', {
      method: 'GET',
    }, false) // Don't redirect on error in server actions
    const allCustomers = transformBackendResponseArray(rawCustomers) as unknown as Customer[]
    
    if (!query.trim()) {
      return allCustomers
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    return allCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.cnpj.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching customers:', error)
    throw error
  }
}

/**
 * Get customer statistics for dashboard
 */
export async function getCustomerStats(): Promise<{
  totalCustomers: number
  newCustomersThisMonth: number
  recentCustomers: Customer[]
}> {
  try {
    const rawCustomers = await fetchResourceList<Record<string, unknown>>('/customers')
    const customers = transformBackendResponseArray(rawCustomers) as unknown as Customer[]
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const newCustomersThisMonth = customers.filter(customer => 
      new Date(customer.createdAt) >= startOfMonth
    ).length
    
    const recentCustomers = customers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    return {
      totalCustomers: customers.length,
      newCustomersThisMonth,
      recentCustomers
    }
  } catch (error) {
    console.error('Error fetching customer stats:', error)
    throw error
  }
} 
