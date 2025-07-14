'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Package as PackageIcon, 
  Weight, 
  Hash, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  Download
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Package } from "@/types/take-up"
import PackageDeleteDialog from "./package-delete-dialog"
import PackageFormDialog from "./package-form-dialog"

interface PackageListProps {
  packages: Package[]
}

type SortOption = 'packageNumber' | 'weight' | 'createdAt' | 'lot'
type SortDirection = 'asc' | 'desc'

export default function PackageList({ packages }: PackageListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deletePackage, setDeletePackage] = useState<Package | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editPackage, setEditPackage] = useState<Package | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filtering and sorting states
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [weightRangeFilter, setWeightRangeFilter] = useState<'all' | 'light' | 'medium' | 'heavy'>('all')
  const [customerFilter, setCustomerFilter] = useState<'all' | string>('all')
  const [lotFilter, setLotFilter] = useState<'all' | string>('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Enhanced filter and sort logic
  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((pkg) =>
        pkg.packageNumber.toLowerCase().includes(query) ||
        pkg.lot.toLowerCase().includes(query) ||
        pkg.takeUpId.toLowerCase().includes(query) ||
        pkg.id.toLowerCase().includes(query)
      )
    }

    // Apply weight range filter
    if (weightRangeFilter !== 'all') {
      filtered = filtered.filter(pkg => {
        const weight = pkg.weight
        switch (weightRangeFilter) {
          case 'light': return weight <= 10
          case 'medium': return weight > 10 && weight <= 25
          case 'heavy': return weight > 25
          default: return true
        }
      })
    }

    // Apply customer filter
    if (customerFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.takeUpId === customerFilter)
    }

    // Apply lot filter
    if (lotFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.lot === lotFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date
      
      switch (sortBy) {
        case 'packageNumber':
          aValue = a.packageNumber.toLowerCase()
          bValue = b.packageNumber.toLowerCase()
          break
        case 'weight':
          aValue = a.weight
          bValue = b.weight
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'lot':
          aValue = a.lot.toLowerCase()
          bValue = b.lot.toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return sorted
  }, [packages, searchQuery, weightRangeFilter, customerFilter, lotFilter, sortBy, sortDirection])

  // Pagination calculations
  const totalItems = filteredAndSortedPackages.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPackages = filteredAndSortedPackages.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, sortDirection, weightRangeFilter, customerFilter, lotFilter, itemsPerPage])

  const handleDeleteClick = (pkg: Package) => {
    setDeletePackage(pkg)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false)
    setDeletePackage(null)
  }

  const handleEditClick = (pkg: Package) => {
    setEditPackage(pkg)
    setIsEditDialogOpen(true)
  }

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false)
    setEditPackage(null)
  }

  const handleTakeUpClick = (takeUpId: string) => {
    router.push(`/dashboard/take-up/${takeUpId}`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setWeightRangeFilter('all')
    setCustomerFilter('all')
    setLotFilter('all')
    setSortBy('createdAt')
    setSortDirection('desc')
    setCurrentPage(1)
  }

  const handleExportData = () => {
    // Create CSV content
    const csvContent = [
      ['Número', 'Lote', 'Peso (kg)', 'Take-Up', 'Criado em'],
      ...filteredAndSortedPackages.map(pkg => [
        pkg.packageNumber,
        pkg.lot,
        pkg.weight.toString(),
        pkg.takeUpId,
        format(new Date(pkg.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      ])
    ].map(row => row.join(',')).join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pacotes-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(totalPages, page)))

  // Get unique values for filters
  const uniqueLots = [...new Set(packages.map(pkg => pkg.lot))]

  const hasActiveFilters = searchQuery || weightRangeFilter !== 'all' || 
                          customerFilter !== 'all' || lotFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* Search and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por número, lote, take-up..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ordenar por</label>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="packageNumber">Número do Pacote</SelectItem>
                          <SelectItem value="weight">Peso</SelectItem>
                          <SelectItem value="createdAt">Data de Criação</SelectItem>
                          <SelectItem value="lot">Lote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Direção</label>
                      <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Crescente</SelectItem>
                          <SelectItem value="desc">Decrescente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Peso</label>
                      <Select value={weightRangeFilter} onValueChange={(value) => setWeightRangeFilter(value as 'all' | 'light' | 'medium' | 'heavy')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="light">Leve (≤10kg)</SelectItem>
                          <SelectItem value="medium">Médio (10-25kg)</SelectItem>
                          <SelectItem value="heavy">Pesado (&gt;25kg)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lote</label>
                      <Select value={lotFilter} onValueChange={(value) => setLotFilter(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {uniqueLots.map(lot => (
                            <SelectItem key={lot} value={lot}>{lot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Itens por página</label>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 por página</SelectItem>
                          <SelectItem value="10">10 por página</SelectItem>
                          <SelectItem value="25">25 por página</SelectItem>
                          <SelectItem value="50">50 por página</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{totalItems} de {packages.length} pacotes</span>
                      {totalPages > 1 && (
                        <span>Página {currentPage} de {totalPages}</span>
                      )}
                      {hasActiveFilters && (
                        <Badge variant="secondary">
                          Filtros aplicados
                        </Badge>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Limpar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Número
                    </div>
                  </TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Peso
                    </div>
                  </TableHead>
                  <TableHead>Take-Up</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Criado
                    </div>
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-mono font-medium">
                      {pkg.packageNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pkg.lot}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                                                {Number(pkg.weight).toFixed(2)} kg
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleTakeUpClick(pkg.takeUpId)}
                        className="h-auto p-0 font-mono text-blue-600 hover:text-blue-800"
                      >
                        {pkg.takeUpId.substring(0, 8)}...
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(pkg.createdAt), "dd/MM/yyyy", { locale: ptBR })}
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
                            className="gap-2"
                            onClick={() => handleEditClick(pkg)}
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-red-600"
                            onClick={() => handleDeleteClick(pkg)}
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

          {filteredAndSortedPackages.length === 0 && (
            <div className="text-center py-8">
              <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pacote encontrado</h3>
              <p className="text-gray-600">
                {searchQuery || hasActiveFilters ? "Nenhum pacote corresponde aos filtros aplicados" : "Não há pacotes cadastrados"}
              </p>
              {hasActiveFilters && (
                <div className="mt-4">
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} pacotes
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Primeira página</span>
              </Button>
              
              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNumber)}
                      className="w-9 h-9 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
              
              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2"
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Última página</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Dialog */}
      {deletePackage && (
        <PackageDeleteDialog
          package={deletePackage}
          open={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
        />
      )}

      {/* Edit Dialog */}
      {editPackage && (
        <PackageFormDialog
          open={isEditDialogOpen}
          onClose={handleEditDialogClose}
          takeUpId={editPackage.takeUpId}
          package={editPackage}
          mode="edit"
        />
      )}
    </div>
  )
} 
