"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { MapPin, Search, MoreHorizontal, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import type { Address } from "@/types/address"
import { deleteAddress } from "@/app/actions/address-actions"
import { formatDate } from "@/lib/utils"

interface AddressesListProps {
  addresses: Address[]
}

export default function AddressesList({ addresses }: AddressesListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredAddresses = addresses.filter(
    (address) =>
      address.street.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.complement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address)
  }

  const handleDelete = async () => {
    if (!addressToDelete) return

    setIsDeleting(true)
    
    try {
      const result = await deleteAddress(addressToDelete.id)
      
      if (result.success) {
        console.log("Endereço excluído com sucesso:", result.message)
        setAddressToDelete(null)
        // Refresh the page to show updated data
        router.refresh()
      } else {
        console.error("Erro ao excluir endereço:", result.message)
        alert("Erro ao excluir endereço: " + (result.message || "Erro inesperado"))
      }
    } catch (error) {
      console.error("Erro ao excluir endereço:", error)
      alert("Erro ao excluir endereço. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setAddressToDelete(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'empty':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Vazio</Badge>
      case 'filled':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Ocupado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Lista de Endereços</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por rua, número, complemento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAddresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'Nenhum endereço encontrado' : 'Nenhum endereço cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Nenhum endereço corresponde aos filtros aplicados'
                  : 'Comece criando um novo endereço para o armazém'
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/dashboard/enderecos/novo">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Endereço
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rua</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Complemento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAddresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell className="font-medium">
                        {address.street.name}
                      </TableCell>
                      <TableCell className="font-mono">
                        {address.number}
                      </TableCell>
                      <TableCell>
                        {address.complement || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(address.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(address.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/enderecos/${address.id}`} className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onClick={() => handleDeleteClick(address)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredAddresses.length > 0 && (
            <div className="flex items-center justify-between pt-4 text-sm text-gray-500 border-t">
              <span>
                {filteredAddresses.length} de {addresses.length} endereços
              </span>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Limpar busca
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o endereço &quot;{addressToDelete?.street.name} - {addressToDelete?.number}&quot;?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
