import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, PackageIcon, CheckCircle, AlertTriangle } from "lucide-react"
import { getEnderecamentos, getEnderecamentoStats } from "@/app/actions/enderecamento-actions"
import EnderecamentoList from "@/components/enderecamento-list"

export default async function EnderecamentoPage() {
  try {
    // Fetch enderecamentos and stats from server actions
    const [enderecamentos, stats] = await Promise.all([
      getEnderecamentos(),
      getEnderecamentoStats()
    ])

    return (
      <DashboardLayout title="Endereçamento" subtitle="Gerencie o endereçamento de pacotes no armazém">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Endereçamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEnderecamentos}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pacotes Endereçados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalPackagesAssigned}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pacotes Não Endereçados</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalPackagesUnassigned}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ocupação do Armazém</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.warehouseOccupancyPercentage}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <PackageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Enderecamento Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Endereçamentos</h3>
              <p className="text-sm text-gray-600">Gerencie a atribuição de pacotes aos endereços do armazém</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/enderecamento/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Endereçamento
              </Link>
            </Button>
          </div>

          {/* Enderecamento List */}
          <EnderecamentoList enderecamentos={enderecamentos} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading enderecamentos:', error)
    // Redirect to error page if backend is unavailable
    throw error
  }
}
