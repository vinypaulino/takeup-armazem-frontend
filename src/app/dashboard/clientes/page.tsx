import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, FileText, Plus } from "lucide-react"
import { getCustomers } from "@/app/actions/customer-actions"
import CustomerList from "@/components/customer-list"

export default async function ClientesPage() {
  try {
    // Fetch customers from backend
    const customers = await getCustomers()

    // Calculate basic stats
    const activeCustomers = customers.length // All customers are considered active

    return (
      <DashboardLayout title="Clientes" subtitle="Gerencie todos os clientes do sistema">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <UserPlus className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Novos Este Mês</p>
                    <p className="text-2xl font-bold text-gray-600">0</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold">Lista de Clientes</CardTitle>
                <Link href="/dashboard/clientes/novo">
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Novo Cliente
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              <CustomerList customers={customers} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading customer page:', error)
    
    // If backend is unavailable, this will redirect to error page
    // due to the error handling in the API utility
    return (
      <DashboardLayout title="Clientes" subtitle="Gerencie todos os clientes do sistema">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-600">Erro ao carregar dados dos clientes.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Verifique sua conexão e tente novamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }
}
