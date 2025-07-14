'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, MoreHorizontal, Trash2, Truck, CheckCircle2, Clock, Package, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ExpedicaoWithDetails, ExpedicaoStatus } from "@/types/expedicao"
import { updateExpedicaoStatus, deleteExpedicao as deleteExpedicaoAction } from "@/app/actions/expedicao-actions"
import { useRouter } from "next/navigation"

interface ExpedicaoListProps {
  expedicoes: ExpedicaoWithDetails[]
}

const statusConfig = {
  'Preparando': {
    label: 'Preparando',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock
  },
  'Expedido': {
    label: 'Expedido',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Truck
  },
  'Em Trânsito': {
    label: 'Em Trânsito',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: Package
  },
  'Entregue': {
    label: 'Entregue',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2
  }
}

export default function ExpedicaoList({ expedicoes }: ExpedicaoListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ExpedicaoStatus | 'all'>('all')
  const [deleteExpedicao, setDeleteExpedicao] = useState<ExpedicaoWithDetails | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Status update state variables removed as they're not currently used
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const filteredExpedicoes = expedicoes.filter((expedicao) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = (
      expedicao.code.toLowerCase().includes(query) ||
      expedicao.destination.toLowerCase().includes(query) ||
      expedicao.responsible.toLowerCase().includes(query) ||
      expedicao.carrier.toLowerCase().includes(query) ||
      expedicao.tracking.toLowerCase().includes(query) ||
      expedicao.packages.some(pkg => 
        pkg.packageNumber.toLowerCase().includes(query) ||
        pkg.lot.toLowerCase().includes(query)
      )
    )

    const matchesStatus = statusFilter === 'all' || expedicao.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteClick = (expedicao: ExpedicaoWithDetails) => {
    setDeleteExpedicao(expedicao)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteExpedicao) return

    setIsDeleting(true)
    try {
      const result = await deleteExpedicaoAction(deleteExpedicao.id)
      
      if (result.success) {
        setIsDeleteDialogOpen(false)
        setDeleteExpedicao(null)
        router.refresh()
      } else {
        alert(result.message || 'Erro ao excluir expedição')
      }
    } catch (error) {
      console.error('Error deleting expedition:', error)
      alert('Erro interno do servidor')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setDeleteExpedicao(null)
  }

  const handleStatusUpdate = async (expedicao: ExpedicaoWithDetails, status: ExpedicaoStatus) => {
    setIsUpdatingStatus(true)
    try {
      const result = await updateExpedicaoStatus(expedicao.id, status)
      
      if (result.success) {
        router.refresh()
      } else {
        alert(result.message || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erro interno do servidor')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getNextStatus = (currentStatus: ExpedicaoStatus): ExpedicaoStatus | null => {
    const statusFlow: ExpedicaoStatus[] = ['Preparando', 'Expedido', 'Em Trânsito', 'Entregue']
    const currentIndex = statusFlow.indexOf(currentStatus)
    
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1]
    }
    
    return null
  }

  const StatusBadge = ({ status, isOverdue }: { status: ExpedicaoStatus, isOverdue?: boolean }) => {
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
        {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
      </Badge>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Lista de Expedições</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar expedições..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ExpedicaoStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Preparando">Preparando</SelectItem>
                  <SelectItem value="Expedido">Expedido</SelectItem>
                  <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                  <SelectItem value="Entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Pacotes</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpedicoes.map((expedicao) => {
                  const nextStatus = getNextStatus(expedicao.status)
                  
                  return (
                    <TableRow key={expedicao.id}>
                      <TableCell className="font-medium">{expedicao.code}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{expedicao.destination}</span>
                          <span className="text-xs text-gray-500">{expedicao.carrier}</span>
                          {expedicao.tracking && (
                            <span className="text-xs text-gray-400 font-mono">
                              {expedicao.tracking}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {expedicao.packageCount} pacote{expedicao.packageCount !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-500">
                            {expedicao.totalWeight.toFixed(1)} kg total
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{expedicao.responsible}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(expedicao.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                          {expedicao.daysInTransit !== undefined && (
                            <span className="text-xs text-gray-500">
                              {expedicao.daysInTransit} dias
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={expedicao.status} isOverdue={expedicao.isOverdue} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isUpdatingStatus}>
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {nextStatus && (
                              <>
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleStatusUpdate(expedicao, nextStatus)}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Marcar como {statusConfig[nextStatus].label}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onClick={() => handleDeleteClick(expedicao)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredExpedicoes.length === 0 && (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma expedição encontrada
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? "Nenhuma expedição corresponde aos filtros aplicados"
                  : "Não há expedições cadastradas"
                }
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <div className="mt-4 space-x-2">
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Limpar busca
                  </Button>
                  <Button variant="outline" onClick={() => setStatusFilter('all')}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Expedição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a expedição{" "}
              <strong>{deleteExpedicao?.code}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. A expedição e todas as suas informações serão permanentemente removidas.
              {deleteExpedicao?.packageCount && (
                <>
                  <br />
                  <br />
                  <strong>Pacotes incluídos:</strong> {deleteExpedicao.packageCount} pacote
                  {deleteExpedicao.packageCount !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
