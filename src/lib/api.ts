import { redirect } from 'next/navigation'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * Transforms backend response fields from snake_case to camelCase
 * @param data - The backend response data
 * @returns Transformed data with camelCase fields
 */
export function transformBackendResponse(data: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    transformed[camelKey] = value
  }
  
  return transformed
}

/**
 * Transforms an array of backend response objects
 * @param data - Array of backend response objects
 * @returns Array of transformed objects with camelCase fields
 */
export function transformBackendResponseArray(data: Record<string, unknown>[]): Record<string, unknown>[] {
  return data.map(item => transformBackendResponse(item))
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class BackendUnavailableError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'BackendUnavailableError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Fetches data from the backend API with proper error handling
 * @param endpoint - The API endpoint (e.g., '/customers')
 * @param options - Fetch options (method, headers, body, etc.)
 * @param shouldRedirectOnError - Whether to redirect to error page on failure (default: true)
 * @returns Promise with the response data
 */
export async function fetchFromBackend<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  shouldRedirectOnError: boolean = true
): Promise<T> {
  const fullUrl = `${BACKEND_URL}${endpoint}`
  const controller = new AbortController()
  
  try {
    console.log(`🚀 Fetching from backend: ${options.method || 'GET'} ${fullUrl}`)
    
    // Set timeout for the request
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout
    
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    })
    
    clearTimeout(timeoutId)
    
    // Handle different HTTP status codes
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch {
        // If not JSON, use the text as is
        errorMessage = errorText || errorMessage
      }
      
      console.error(`❌ Backend responded with error: ${response.status} ${response.statusText}`)
      
      // Handle specific status codes
      switch (response.status) {
        case 404:
          if (shouldRedirectOnError) {
            redirect('/error/not-found')
          }
          throw new ApiError(404, 'Recurso não encontrado')
        case 500:
        case 502:
        case 503:
        case 504:
          if (shouldRedirectOnError) {
            redirect('/error/backend-unavailable')
          }
          throw new BackendUnavailableError('Serviço temporariamente indisponível')
        default:
          throw new ApiError(response.status, errorMessage)
      }
    }
    
    // Handle successful responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log(`✅ Backend request successful: ${response.status}`)
      return data
    } else {
      // For non-JSON responses (like DELETE operations)
      console.log(`✅ Backend request successful: ${response.status}`)
      return {} as T
    }
    
  } catch (error) {
    clearTimeout(controller.signal.aborted ? undefined : setTimeout(() => controller.abort(), 0))
    
    if (error instanceof ApiError || error instanceof BackendUnavailableError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
      console.error(`❌ Network error for ${fullUrl}:`, error)
      
      if (shouldRedirectOnError) {
        redirect('/error/backend-unavailable')
      }
      
      throw new NetworkError('Erro de conexão com o servidor', error as Error)
    }
    
    // Handle other errors
    console.error(`❌ Unexpected error for ${fullUrl}:`, error)
    
    if (shouldRedirectOnError) {
      redirect('/error/backend-unavailable')
    }
    
    throw new NetworkError('Erro inesperado ao conectar com o servidor', error as Error)
  }
}

/**
 * Checks if the backend is available
 * @returns Promise<boolean> - true if backend is available, false otherwise
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await fetchFromBackend('/health', { method: 'GET' }, false)
    return true
  } catch (error) {
    console.warn('Backend availability check failed:', error)
    return false
  }
}

/**
 * Creates a new resource in the backend
 * @param endpoint - The API endpoint
 * @param data - The data to create
 * @returns Promise with the created resource
 */
export async function createResource<T = unknown>(
  endpoint: string,
  data: unknown
): Promise<T> {
  return fetchFromBackend<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Updates an existing resource in the backend
 * @param endpoint - The API endpoint
 * @param data - The data to update
 * @returns Promise with the updated resource
 */
export async function updateResource<T = unknown>(
  endpoint: string,
  data: unknown
): Promise<T> {
  return fetchFromBackend<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Deletes a resource from the backend
 * @param endpoint - The API endpoint
 * @returns Promise<void>
 */
export async function deleteResource(endpoint: string): Promise<void> {
  return fetchFromBackend<void>(endpoint, {
    method: 'DELETE',
  })
}

/**
 * Fetches a list of resources from the backend
 * @param endpoint - The API endpoint
 * @returns Promise with the list of resources
 */
export async function fetchResourceList<T = unknown>(endpoint: string): Promise<T[]> {
  return fetchFromBackend<T[]>(endpoint, {
    method: 'GET',
  })
}

/**
 * Fetches a single resource by ID from the backend
 * @param endpoint - The API endpoint
 * @param id - The resource ID
 * @returns Promise with the resource
 */
export async function fetchResource<T = unknown>(
  endpoint: string,
  id: string
): Promise<T> {
  return fetchFromBackend<T>(`${endpoint}/${id}`, {
    method: 'GET',
  })
} 
