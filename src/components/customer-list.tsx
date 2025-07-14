'use client'

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Edit, Trash2, Users } from "lucide-react"
import { Customer } from "@/types/customer"
import CustomerDeleteDialog from "./customer-delete-dialog"
import { formatDate } from "@/lib/utils"

interface CustomerListProps {
  customers: Customer[]
}

export default function CustomerList({ customers }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.cnpj.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (customer: Customer) => {
    setDeleteCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false)
    setDeleteCustomer(null)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar clientes por nome, CNPJ ou ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-mono text-sm">
                  {customer.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.cnpj}</TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell>{formatDate(customer.updatedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link 
                          href={`/dashboard/clientes/${customer.id}/editar`}
                          className="flex items-center gap-2 w-full"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600"
                        onClick={() => handleDeleteClick(customer)}
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

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600">
            {searchQuery 
              ? `Nenhum resultado para "${searchQuery}"` 
              : "Não há clientes cadastrados"
            }
          </p>
          {!searchQuery && (
            <Link href="/dashboard/clientes/novo">
              <Button className="mt-4">
                Cadastrar Primeiro Cliente
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      {deleteCustomer && (
        <CustomerDeleteDialog
          customer={deleteCustomer}
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
        />
      )}
    </div>
  )
} 
