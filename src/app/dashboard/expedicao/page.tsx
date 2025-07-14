import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Truck, PackageIcon, CheckCircle, Clock } from "lucide-react"
import { getExpedicoes, getExpedicaoStats } from "@/app/actions/expedicao-actions"
import ExpedicaoList from "@/components/expedicao-list"

export default async function ExpedicaoPage() {
  // Fetch expeditions and stats from server actions (with fallback handling)
  const [expedicoes, stats] = await Promise.all([
    getExpedicoes(),
    getExpedicaoStats()
  ])

  // Check if we're in fallback mode (backend unavailable)
  const isBackendUnavailable = expedicoes.length === 0 && stats.totalExpedicoes === 0

  return (
    <DashboardLayout title="Expedição" subtitle="Gerencie as expedições e saídas de pacotes">
      <div className="space-y-6">
        {/* Backend Status Warning */}
        {isBackendUnavailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Backend temporariamente indisponível
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    Os dados de expedição não estão disponíveis no momento. 
                    O sistema está executando com dados padrão.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Expedições</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalExpedicoes}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.expeditionsInProgress}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entregues</p>
                    <p className="text-2xl font-bold text-green-600">{stats.expeditionsDelivered}</p>
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
                    <p className="text-sm font-medium text-gray-600">Pacotes Expedidos</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalPackagesShipped}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <PackageIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peso Total</p>
                    <p className="text-2xl font-bold text-orange-600">{(stats.totalWeightShipped || 0).toFixed(1)} kg</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <PackageIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Expedition Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Expedições</h3>
              <p className="text-sm text-gray-600">Gerencie as expedições e rastreamento de pacotes</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/expedicao/novo">
                <Plus className="w-4 h-4 mr-2" />
                Nova Expedição
              </Link>
            </Button>
          </div>

          {/* Expedition List */}
          <ExpedicaoList expedicoes={expedicoes} />
        </div>
      </DashboardLayout>
    )
}
