'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Loader2, Package as PackageIcon, Scale, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Package } from '@/types/take-up'
import { deletePackage } from '@/app/actions/package-actions'


interface PackageDeleteDialogProps {
  package: Package
  open: boolean
  onClose: () => void
}

export default function PackageDeleteDialog({ 
  package: packageData, 
  open, 
  onClose 
}: PackageDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!packageData?.id) return

    setIsDeleting(true)

    try {
      const result = await deletePackage(packageData.id)

      if (result.success) {
        console.log("Pacote excluído com sucesso:", result.message)
        
        onClose()
        
        // Refresh the current page to update the package list
        router.refresh()
        
      } else {
        console.error("Erro ao excluir pacote:", result.message)
        alert("Erro ao excluir pacote: " + (result.message || "Não foi possível excluir o pacote."))
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      alert("Erro inesperado ao excluir o pacote. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Safe weight conversion
  const weight = typeof packageData?.weight === 'number' 
    ? packageData.weight 
    : parseFloat(String(packageData?.weight || '0')) || 0

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirmar Exclusão do Pacote
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.
              </p>
              
              {/* Package Information */}
              {packageData && (
                <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <PackageIcon className="h-4 w-4" />
                    Informações do Pacote
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Número:
                      </span>
                      <span className="font-medium">{packageData.packageNumber}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lote:</span>
                      <Badge variant="outline">{packageData.lot}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        Peso:
                      </span>
                      <span className="font-medium">{weight.toFixed(2)} kg</span>
                    </div>
                    
                    {packageData.id && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono text-xs text-gray-500">
                          {packageData.id.split('-')[0]}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900 mb-1">
                      Atenção: Exclusão Permanente
                    </p>
                    <p className="text-orange-800">
                      O pacote será removido permanentemente do sistema. 
                      Se este pacote está sendo usado em endereçamentos ou expedições,
                      essas operações podem ser afetadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir Pacote'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
