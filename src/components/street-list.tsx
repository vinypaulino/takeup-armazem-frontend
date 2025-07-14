'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MoreHorizontal, Edit, Trash2, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { Street } from '@/types/street'
import { formatDate } from '@/lib/utils'
import { StreetDeleteDialog } from './street-delete-dialog'

interface StreetListProps {
  initialStreets: Street[]
}

export default function StreetList({ initialStreets }: StreetListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteStreet, setDeleteStreet] = useState<Street | null>(null)

  // Filter streets based on search query
  const filteredStreets = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialStreets
    }
    
    const searchTerm = searchQuery.toLowerCase().trim()
    
    return initialStreets.filter(street => 
      street.name.toLowerCase().includes(searchTerm) ||
      street.id.toString().includes(searchTerm)
    )
  }, [initialStreets, searchQuery])

  const handleDeleteClick = (street: Street) => {
    setDeleteStreet(street)
  }

  const handleDeleteClose = () => {
    setDeleteStreet(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Ruas Cadastradas
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Badge */}
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm">
              {filteredStreets.length} {filteredStreets.length === 1 ? 'rua encontrada' : 'ruas encontradas'}
            </Badge>
          </div>

          {/* Street Table */}
          {filteredStreets.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStreets.map((street) => (
                    <TableRow key={street.id}>
                      <TableCell className="font-medium">
                        #{street.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {street.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(street.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(street.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link 
                                href={`/dashboard/rua/${street.id}/editar`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(street)}
                              className="flex items-center gap-2 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
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
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchQuery ? 'Nenhuma rua encontrada' : 'Nenhuma rua cadastrada'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? `Nenhum resultado para "${searchQuery}". Tente outro termo de busca.`
                  : 'Comece criando sua primeira rua no sistema.'
                }
              </p>
              {!searchQuery && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/rua/nova">
                    Criar Primeira Rua
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteStreet && (
        <StreetDeleteDialog
          street={deleteStreet}
          open={!!deleteStreet}
          onClose={handleDeleteClose}
        />
      )}
    </>
  )
} 
