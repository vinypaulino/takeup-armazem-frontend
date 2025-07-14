'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import type { Street } from '@/types/street'
import { deleteStreet } from '@/app/actions/street-actions'

interface StreetDeleteDialogProps {
  street: Street
  open: boolean
  onClose: () => void
}

export function StreetDeleteDialog({ street, open, onClose }: StreetDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteStreet(street.id)
      
      if (result.success) {
        console.log("Rua excluída com sucesso:", result.message)
        
        onClose()
        router.refresh() // Refresh the page to update the list
      } else {
        console.error("Erro ao excluir rua:", result.message)
        alert("Erro ao excluir rua: " + (result.message || "Erro ao excluir rua"))
      }
    } catch (error) {
      console.error('Error deleting street:', error)
      alert("Erro inesperado ao excluir rua. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-left">
            Tem certeza que deseja excluir a rua <strong>&quot;{street.name}&quot;</strong>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Atenção: Esta ação não pode ser desfeita
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• A rua será permanentemente removida do sistema</li>
                  <li>• Endereços associados a esta rua podem ser afetados</li>
                  <li>• Históricos relacionados podem ser perdidos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir Rua'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
