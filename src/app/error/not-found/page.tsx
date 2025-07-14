'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileX, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FileX className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Página Não Encontrada
          </CardTitle>
          <CardDescription className="text-gray-600">
            O conteúdo que você está procurando não foi encontrado ou não existe mais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">O que aconteceu?</h3>
            <p className="text-sm text-gray-600">
              A página ou recurso solicitado não foi encontrado em nossos registros.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">O que posso fazer?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verifique se o endereço está correto</li>
              <li>• Volte para a página anterior</li>
              <li>• Navegue para o dashboard principal</li>
              <li>• Entre em contato com o suporte se necessário</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleGoBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Ir para o Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
