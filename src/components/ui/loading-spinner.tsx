import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  message?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
}

export function LoadingSpinner({ size = "md", className, message }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className={cn("animate-spin text-blue-600", sizeMap[size], className)} />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  message?: string
  className?: string
}

export function LoadingCard({ title, message, className }: LoadingCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <LoadingSpinner size="lg" />
      {title && (
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      )}
      {message && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export function LoadingOverlay({ isLoading, message, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <LoadingSpinner message={message} />
        </div>
      )}
    </div>
  )
} 
