import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string to Brazilian date format (DD/MM/YYYY)
 * Handles null, undefined, and invalid dates gracefully
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Data não informada'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Formats a date string to Brazilian date and time format (DD/MM/YYYY HH:MM)
 * Handles null, undefined, and invalid dates gracefully
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Data não informada'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Formats a date string to a relative time format (e.g., "há 2 dias")
 * Handles null, undefined, and invalid dates gracefully
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Data não informada'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return 'Hoje'
    } else if (diffInDays === 1) {
      return 'Ontem'
    } else if (diffInDays < 7) {
      return `Há ${diffInDays} dias`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `Há ${months} mês${months > 1 ? 'es' : ''}`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `Há ${years} ano${years > 1 ? 's' : ''}`
    }
  } catch {
    return 'Data inválida'
  }
}
