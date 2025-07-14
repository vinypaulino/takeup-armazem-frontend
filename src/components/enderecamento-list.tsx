'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, MoreHorizontal, Trash2, MapPin } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { EnderecamentoWithDetails } from "@/types/enderecamento"
import { removeEnderecamento } from "@/app/actions/enderecamento-actions"
import { useRouter } from "next/navigation"

interface EnderecamentoListProps {
  enderecamentos: EnderecamentoWithDetails[]
}

export default function EnderecamentoList({ enderecamentos }: EnderecamentoListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteEnderecamento, setDeleteEnderecamento] = useState<EnderecamentoWithDetails | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const filteredEnderecamentos = enderecamentos.filter((enderecamento) => {
    const query = searchQuery.toLowerCase()
    return (
      enderecamento.addressCode?.toLowerCase().includes(query) ||
      enderecamento.package.packageNumber.toLowerCase().includes(query) ||
      enderecamento.package.lot.toLowerCase().includes(query) ||
      enderecamento.takeUpCode?.toLowerCase().includes(query) ||
      enderecamento.customerName?.toLowerCase().includes(query) ||
      enderecamento.streetName?.toLowerCase().includes(query)
    )
  })

  const handleRemoveClick = (enderecamento: EnderecamentoWithDetails) => {
    setDeleteEnderecamento(enderecamento)
    setIsDeleteDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (!deleteEnderecamento) return

    setIsRemoving(true)
    try {
      const result = await removeEnderecamento(deleteEnderecamento.address.id)
      
      if (result.success) {
        // Close dialog and refresh the page
        setIsDeleteDialogOpen(false)
        setDeleteEnderecamento(null)
        router.refresh()
      } else {
        alert(result.message || 'Erro ao remover endereçamento')
      }
    } catch (error) {
      console.error('Error removing enderecamento:', error)
      alert('Erro interno do servidor')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleRemoveCancel = () => {
    setIsDeleteDialogOpen(false)
    setDeleteEnderecamento(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Lista de Endereçamentos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar endereçamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Take-Up</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnderecamentos.map((enderecamento) => (
                  <TableRow key={enderecamento.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-1">
                          {enderecamento.addressCode}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {enderecamento.streetName}, {enderecamento.address.number}
                        </span>
                        {enderecamento.address.complement && (
                          <span className="text-xs text-gray-500">
                            {enderecamento.address.complement}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{enderecamento.package.packageNumber}</span>
                        <span className="text-xs text-gray-600">
                          Lote: {enderecamento.package.lot}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Number(enderecamento.package.weight).toFixed(2)} kg
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{enderecamento.takeUpCode}</Badge>
                    </TableCell>
                    <TableCell>{enderecamento.customerName}</TableCell>
                    <TableCell>
                      {format(new Date(enderecamento.createdAt), "dd/MM/yyyy", { locale: ptBR })}
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
                          <DropdownMenuItem 
                            className="gap-2 text-red-600"
                            onClick={() => handleRemoveClick(enderecamento)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEnderecamentos.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum endereçamento encontrado
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `Nenhum resultado para "${searchQuery}"` 
                  : "Não há endereçamentos cadastrados"
                }
              </p>
              {searchQuery && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Endereçamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o endereçamento do pacote{" "}
              <strong>{deleteEnderecamento?.package.packageNumber}</strong> do endereço{" "}
              <strong>{deleteEnderecamento?.addressCode}</strong>?
              <br />
              <br />
              Esta ação irá liberar o endereço para ser usado por outros pacotes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRemoveCancel} disabled={isRemoving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
