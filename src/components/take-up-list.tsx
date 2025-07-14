'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MoreHorizontal, Edit, Trash2, Package, Eye, Filter, SortAsc, SortDesc, Weight, Download, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { TakeUp } from '@/types/take-up'
import { formatDate, formatDateTime } from '@/lib/utils'
import { TakeUpDeleteDialog } from './take-up-delete-dialog'

interface TakeUpListProps {
  takeUps: TakeUp[]
}

type SortOption = 'name' | 'date' | 'packages' | 'weight'
type SortDirection = 'asc' | 'desc'

export default function TakeUpList({ takeUps }: TakeUpListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTakeUp, setSelectedTakeUp] = useState<TakeUp | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Enhanced filtering states
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [packageCountFilter, setPackageCountFilter] = useState<'all' | 'none' | 'low' | 'high'>('all')
  const [weightRangeFilter, setWeightRangeFilter] = useState<'all' | 'light' | 'medium' | 'heavy'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Enhanced filter and sort logic
  const filteredAndSortedTakeUps = useMemo(() => {
    let filtered = takeUps

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(takeUp =>
        takeUp.id.toLowerCase().includes(query) ||
        takeUp.customer.name.toLowerCase().includes(query) ||
        takeUp.customer.cnpj.toLowerCase().includes(query) ||
        takeUp.packages.some(pkg => 
          pkg.packageNumber.toLowerCase().includes(query) ||
          pkg.lot.toLowerCase().includes(query)
        )
      )
    }

    // Apply package count filter
    if (packageCountFilter !== 'all') {
      filtered = filtered.filter(takeUp => {
        const packageCount = takeUp.packages.length
        switch (packageCountFilter) {
          case 'none': return packageCount === 0
          case 'low': return packageCount > 0 && packageCount <= 5
          case 'high': return packageCount > 5
          default: return true
        }
      })
    }

    // Apply weight range filter
    if (weightRangeFilter !== 'all') {
      filtered = filtered.filter(takeUp => {
        const totalWeight = takeUp.packages.reduce((sum, pkg) => {
          const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
          return sum + weight
        }, 0)
        
        switch (weightRangeFilter) {
          case 'light': return totalWeight <= 10
          case 'medium': return totalWeight > 10 && totalWeight <= 50
          case 'heavy': return totalWeight > 50
          default: return true
        }
      })
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(takeUp => {
        const takeUpDate = new Date(takeUp.createdAt)
        
        switch (dateFilter) {
          case 'today': return takeUpDate >= today
          case 'week': {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return takeUpDate >= weekAgo
          }
          case 'month': {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return takeUpDate >= monthAgo
          }
          default: return true
        }
      })
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date
      
      switch (sortBy) {
        case 'name':
          aValue = a.customer.name.toLowerCase()
          bValue = b.customer.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'packages':
          aValue = a.packages.length
          bValue = b.packages.length
          break
        case 'weight':
          aValue = a.packages.reduce((sum, pkg) => {
            const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
            return sum + weight
          }, 0)
          bValue = b.packages.reduce((sum, pkg) => {
            const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
            return sum + weight
          }, 0)
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
  }, [takeUps, searchQuery, sortBy, sortDirection, packageCountFilter, weightRangeFilter, dateFilter])

  // Pagination calculations
  const totalItems = filteredAndSortedTakeUps.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTakeUps = filteredAndSortedTakeUps.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, sortDirection, packageCountFilter, weightRangeFilter, dateFilter, itemsPerPage])

  const handleDeleteClick = (takeUp: TakeUp) => {
    setSelectedTakeUp(takeUp)
    setDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false)
    setSelectedTakeUp(null)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setPackageCountFilter('all')
    setWeightRangeFilter('all')
    setDateFilter('all')
    setSortBy('date')
    setSortDirection('desc')
    setCurrentPage(1)
  }

  const handleExportData = () => {
    // Create CSV content
    const csvContent = [
      ['ID', 'Cliente', 'CNPJ', 'Pacotes', 'Peso Total (kg)', 'Criado em', 'Atualizado em'],
      ...filteredAndSortedTakeUps.map(takeUp => {
        const totalWeight = takeUp.packages.reduce((sum, pkg) => {
          const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
          return sum + weight
        }, 0)
        
        return [
          takeUp.id,
          takeUp.customer.name,
          takeUp.customer.cnpj,
          takeUp.packages.length.toString(),
          totalWeight.toFixed(2),
          formatDateTime(takeUp.createdAt),
          formatDateTime(takeUp.updatedAt)
        ]
      })
    ].map(row => row.join(',')).join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `take-ups-${new Date().toISOString().split('T')[0]}.csv`)
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

  // Calculate statistics for display
  const stats = useMemo(() => {
    return {
      total: filteredAndSortedTakeUps.length,
      totalPackages: filteredAndSortedTakeUps.reduce((sum, takeUp) => sum + takeUp.packages.length, 0),
      totalWeight: filteredAndSortedTakeUps.reduce((sum, takeUp) => 
        sum + takeUp.packages.reduce((pkgSum, pkg) => {
          const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
          return pkgSum + weight
        }, 0), 0
      ),
      currentPageStart: totalItems === 0 ? 0 : startIndex + 1,
      currentPageEnd: Math.min(endIndex, totalItems),
    }
  }, [filteredAndSortedTakeUps, startIndex, endIndex, totalItems])

  const hasActiveFilters = searchQuery || packageCountFilter !== 'all' || weightRangeFilter !== 'all' || dateFilter !== 'all'

  if (takeUps.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Nenhum take-up encontrado
        </h3>
        <p className="mt-1 text-gray-500">
          Comece criando um novo take-up para o armazém.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard/take-up/novo">
              <Package className="mr-2 h-4 w-4" />
              Novo Take-Up
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Search and Controls */}
      <div className="flex flex-col gap-4">
        {/* Search and Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, CNPJ, ID ou pacote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome do Cliente</SelectItem>
                      <SelectItem value="date">Data de Criação</SelectItem>
                      <SelectItem value="packages">Quantidade de Pacotes</SelectItem>
                      <SelectItem value="weight">Peso Total</SelectItem>
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
                  <label className="text-sm font-medium">Pacotes</label>
                  <Select value={packageCountFilter} onValueChange={(value) => setPackageCountFilter(value as 'all' | 'none' | 'low' | 'high')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="none">Sem pacotes</SelectItem>
                      <SelectItem value="low">Poucos (1-5)</SelectItem>
                      <SelectItem value="high">Muitos (5+)</SelectItem>
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
                      <SelectItem value="medium">Médio (10-50kg)</SelectItem>
                      <SelectItem value="heavy">Pesado (&gt;50kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as 'all' | 'today' | 'week' | 'month')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
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
                      <SelectItem value="100">100 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Display */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{stats.total} take-ups</span>
          <span>{stats.totalPackages} pacotes</span>
          <span>{stats.totalWeight.toFixed(1)} kg total</span>
          {totalPages > 1 && (
            <span>Página {currentPage} de {totalPages}</span>
          )}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Filtros aplicados
            </Badge>
          )}
        </div>
      </div>

      {/* Take-Up Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  ID
                  {sortBy === 'name' && (
                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Cliente
                  {sortBy === 'name' && (
                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Pacotes
                  {sortBy === 'packages' && (
                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Peso Total
                  {sortBy === 'weight' && (
                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Criado
                  {sortBy === 'date' && (
                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTakeUps.map((takeUp) => {
              const totalWeight = takeUp.packages.reduce((sum, pkg) => {
                const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
                return sum + weight
              }, 0)
              
              return (
                <TableRow key={takeUp.id}>
                  <TableCell className="font-mono text-sm">
                    {takeUp.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{takeUp.customer.name}</span>
                      <span className="text-sm text-gray-500">{takeUp.customer.cnpj}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{takeUp.packages.length}</span>
                      {takeUp.packages.length === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Vazio
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-green-600" />
                      <span className="font-mono">{totalWeight.toFixed(1)} kg</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(takeUp.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(takeUp.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/take-up/${takeUp.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/take-up/${takeUp.id}/editar`} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(takeUp)}
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* No Results Message */}
      {filteredAndSortedTakeUps.length === 0 && (searchQuery || hasActiveFilters) && (
        <div className="text-center py-8">
          <Search className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Nenhum resultado encontrado
          </h3>
          <p className="mt-1 text-gray-500">
            {searchQuery 
              ? `Nenhum take-up corresponde aos termos "${searchQuery}".`
              : "Nenhum take-up corresponde aos filtros aplicados."
            }
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="text-sm text-gray-500">
            Mostrando {stats.currentPageStart} a {stats.currentPageEnd} de {stats.total} take-ups
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

      {/* Items Per Page Info */}
      {filteredAndSortedTakeUps.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
          <div>
            {stats.totalPackages} pacotes total • {stats.totalWeight.toFixed(1)} kg total
          </div>
          <div>
            {itemsPerPage} por página • {totalPages} páginas
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {selectedTakeUp && (
        <TakeUpDeleteDialog
          takeUp={selectedTakeUp}
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
        />
      )}
    </div>
  )
} 
