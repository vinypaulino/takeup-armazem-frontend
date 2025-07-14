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
import { AlertTriangle, Loader2 } from "lucide-react"
import { Customer } from "@/types/customer"
import { deleteCustomer } from "@/app/actions/customer-actions"
interface CustomerDeleteDialogProps {
  customer: Customer
  isOpen: boolean
  onClose: () => void
}

export default function CustomerDeleteDialog({ 
  customer, 
  isOpen, 
  onClose 
}: CustomerDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteCustomer(customer.id)
      
      if (result.success) {
        console.log("Cliente excluído com sucesso:", result.message)
        
        // Close the dialog
        onClose()
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        console.error("Erro ao excluir cliente:", result.message)
        alert("Erro ao excluir cliente: " + (result.message || "Erro inesperado"))
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert("Erro inesperado ao excluir cliente. Tente novamente.")
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
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o cliente <strong>{customer.name}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>CNPJ:</strong> {customer.cnpj}
          </p>
          <p className="text-sm text-gray-600">
            <strong>ID:</strong> {customer.id}
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os dados relacionados 
            a este cliente serão perdidos permanentemente.
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
                Excluir Cliente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
