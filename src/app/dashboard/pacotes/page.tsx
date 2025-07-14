import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Plus, Weight, Hash } from "lucide-react"
import { getAllPackages, getPackageStats } from "@/app/actions/package-actions"
import PackageList from "@/components/package-list"

export default async function PacotesPage() {
  try {
    // Fetch packages and stats from backend
    const [packages, stats] = await Promise.all([
      getAllPackages(),
      getPackageStats()
    ])

    return (
      <DashboardLayout title="Pacotes" subtitle="Gerencie todos os pacotes do sistema">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Pacotes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPackages}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peso Total</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalWeight.toFixed(2)} kg</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Weight className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peso Médio</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.avgWeight.toFixed(2)} kg</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Hash className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pacotes Recentes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.recentPackages.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Plus className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Package Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Pacotes</h3>
              <p className="text-sm text-gray-600">Gerencie todos os pacotes do sistema</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/take-up">
                <Plus className="w-4 h-4 mr-2" />
                Gerenciar Take-ups
              </Link>
            </Button>
          </div>

          {/* Package List */}
          <PackageList packages={packages} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading packages:', error)
    // Redirect to error page if backend is unavailable
    throw error
  }
}
