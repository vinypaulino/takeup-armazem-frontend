'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function BackendUnavailablePage() {
  const router = useRouter()

  const handleTryAgain = () => {
    // Go back to the previous page and refresh
    router.back()
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Serviço Temporariamente Indisponível
          </CardTitle>
          <CardDescription className="text-gray-600">
            Não foi possível conectar com o servidor. Tente novamente em alguns instantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">O que aconteceu?</h3>
            <p className="text-sm text-gray-600">
              O sistema está temporariamente indisponível. Isso pode ser devido a manutenção ou problemas técnicos.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">O que posso fazer?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Aguarde alguns minutos e tente novamente</li>
              <li>• Verifique sua conexão com a internet</li>
              <li>• Entre em contato com o suporte se o problema persistir</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleTryAgain} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
