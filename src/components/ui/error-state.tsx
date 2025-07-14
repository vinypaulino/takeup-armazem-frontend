import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  showRetry?: boolean
  onRetry?: () => void
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  action,
  showRetry = false,
  onRetry,
  showBackButton = false,
  onBack,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-6", className)}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 max-w-md">{message}</p>
      </div>

      <div className="flex gap-3">
        {showBackButton && onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
        
        {showRetry && onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
        
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

interface ErrorCardProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  className?: string
}

export function ErrorCard({ 
  title = "Erro ao carregar dados", 
  message, 
  showRetry = true, 
  onRetry,
  className 
}: ErrorCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {message && (
              <p className="text-sm text-gray-600">{message}</p>
            )}
          </div>

          {showRetry && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface NetworkErrorProps {
  onRetry?: () => void
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorState
      title="Problema de Conexão"
      message="Não foi possível conectar com o servidor. Verifique sua conexão com a internet e tente novamente."
      showRetry={true}
      onRetry={onRetry}
    />
  )
}

interface NotFoundErrorProps {
  resource?: string
  onBack?: () => void
}

export function NotFoundError({ resource = "recurso", onBack }: NotFoundErrorProps) {
  return (
    <ErrorState
      title="Não Encontrado"
      message={`O ${resource} que você está procurando não foi encontrado ou pode ter sido removido.`}
      showBackButton={true}
      onBack={onBack}
    />
  )
}

interface ServerErrorProps {
  onRetry?: () => void
}

export function ServerError({ onRetry }: ServerErrorProps) {
  return (
    <ErrorState
      title="Erro do Servidor"
      message="Ocorreu um erro interno no servidor. Nossa equipe foi notificada e está trabalhando para resolver o problema."
      showRetry={true}
      onRetry={onRetry}
    />
  )
} 
