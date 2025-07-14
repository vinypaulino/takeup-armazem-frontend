'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Loader2, Package, User } from "lucide-react"
import { TakeUp } from "@/types/take-up"
import { deleteTakeUp } from "@/app/actions/take-up-actions"


interface TakeUpDeleteDialogProps {
  takeUp: TakeUp
  open: boolean
  onClose: () => void
}

export function TakeUpDeleteDialog({ 
  takeUp, 
  open, 
  onClose 
}: TakeUpDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteTakeUp(takeUp.id)
      
      if (result.success) {
        console.log("Take-Up excluído com sucesso:", result.message)
        
        // Close the dialog
        onClose()
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        console.error("Erro ao excluir take-up:", result.message)
        alert("Erro ao excluir take-up: " + (result.message || "Erro inesperado ao excluir take-up"))
      }
    } catch (error) {
      console.error('Error deleting take-up:', error)
      alert("Erro inesperado ao excluir take-up. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  const totalWeight = takeUp.packages.reduce((sum, pkg) => {
    const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
    return sum + weight
  }, 0)

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este take-up e todos os seus pacotes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span><strong>Cliente:</strong> {takeUp.customer.name}</span>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              <strong>CNPJ:</strong> {takeUp.customer.cnpj}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Take-Up ID:</strong> {takeUp.id}
            </p>
          </div>

          {takeUp.packages.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Pacotes que serão excluídos:
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-orange-700">
                  • <strong>{takeUp.packages.length}</strong> pacote{takeUp.packages.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-700">
                  • <strong>{totalWeight.toFixed(1)} kg</strong> peso total
                </p>
                {takeUp.packages.length <= 3 ? (
                  takeUp.packages.map((pkg) => (
                    <p key={pkg.id} className="text-xs text-orange-600 ml-2">
                      - {pkg.packageNumber} ({pkg.lot}) - {typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0}kg
                    </p>
                  ))
                ) : (
                  <>
                    {takeUp.packages.slice(0, 2).map((pkg) => (
                      <p key={pkg.id} className="text-xs text-orange-600 ml-2">
                        - {pkg.packageNumber} ({pkg.lot}) - {typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0}kg
                      </p>
                    ))}
                    <p className="text-xs text-orange-600 ml-2">
                      ... e mais {takeUp.packages.length - 2} pacotes
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Atenção:</strong> Esta ação não pode ser desfeita. O take-up e todos os seus 
            pacotes serão excluídos permanentemente do sistema.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Excluir Take-Up
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
