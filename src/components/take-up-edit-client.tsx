'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Package as PackageIcon, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Calendar,
  Weight,
  Hash
} from 'lucide-react'
import type { TakeUp, Package } from '@/types/take-up'
import { formatDateTime } from '@/lib/utils'
import TakeUpForm from './take-up-form'
import PackageFormDialog from './package-form-dialog'
import PackageDeleteDialog from './package-delete-dialog'

interface TakeUpEditClientProps {
  takeUp: TakeUp
}

export default function TakeUpEditClient({ takeUp: initialTakeUp }: TakeUpEditClientProps) {
  const router = useRouter()
  const [takeUp] = useState<TakeUp>(initialTakeUp)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [isPackageDeleteOpen, setIsPackageDeleteOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null)

  const handleAddPackage = () => {
    setEditingPackage(null)
    setIsPackageFormOpen(true)
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    setIsPackageFormOpen(true)
  }

  const handleDeletePackage = (pkg: Package) => {
    setDeletingPackage(pkg)
    setIsPackageDeleteOpen(true)
  }

  const handlePackageFormClose = () => {
    setIsPackageFormOpen(false)
    setEditingPackage(null)
    // Refresh the page to get updated package data
    router.refresh()
  }

  const handlePackageDeleteClose = () => {
    setIsPackageDeleteOpen(false)
    setDeletingPackage(null)
    // Refresh the page to get updated package data
    router.refresh()
  }



  return (
    <div className="space-y-6">
      {/* Take-Up Form */}
      <TakeUpForm takeUp={takeUp} mode="edit" />

      {/* Packages Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              <CardTitle>Pacotes ({takeUp.packages.length})</CardTitle>
            </div>
            <Button onClick={handleAddPackage} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Pacote
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {takeUp.packages.length === 0 ? (
            <div className="text-center py-8">
              <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Nenhum pacote cadastrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando o primeiro pacote para este take-up.
              </p>
              <div className="mt-6">
                <Button onClick={handleAddPackage} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Pacote
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Packages Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Número do Pacote
                        </div>
                      </TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4" />
                          Peso (kg)
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Criado em
                        </div>
                      </TableHead>
                      <TableHead className="w-[70px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {takeUp.packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-mono font-medium">
                          {pkg.packageNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pkg.lot}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {Number(pkg.weight).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTime(pkg.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPackage(pkg)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePackage(pkg)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
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

              {/* Package Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total de Pacotes</p>
                        <p className="text-2xl font-bold text-blue-600">{takeUp.packages.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Peso Total</p>
                        <p className="text-2xl font-bold text-green-600">
                          {takeUp.packages.reduce((sum, pkg) => sum + Number(pkg.weight), 0).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Peso Médio</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {takeUp.packages.length > 0 
                            ? (takeUp.packages.reduce((sum, pkg) => sum + Number(pkg.weight), 0) / takeUp.packages.length).toFixed(2)
                            : '0.00'} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Form Dialog */}
      <PackageFormDialog
        open={isPackageFormOpen}
        onClose={handlePackageFormClose}
        package={editingPackage}
        takeUpId={takeUp.id}
        mode={editingPackage ? 'edit' : 'create'}
      />

      {/* Package Delete Dialog */}
      {deletingPackage && (
        <PackageDeleteDialog
          open={isPackageDeleteOpen}
          onClose={handlePackageDeleteClose}
          package={deletingPackage}
        />
      )}
    </div>
  )
} 
