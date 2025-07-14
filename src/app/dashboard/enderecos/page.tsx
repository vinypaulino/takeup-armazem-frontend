import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Home, Navigation } from "lucide-react"
import { getAddresses, getAddressStats } from "@/app/actions/address-actions"
import AddressesList from "@/components/addresses-list"

export default async function EnderecosPage() {
  try {
    // Fetch addresses and stats from backend
    const [addresses, stats] = await Promise.all([
      getAddresses(),
      getAddressStats()
    ])

    return (
      <DashboardLayout title="Endereços" subtitle="Gerencie todos os endereços do armazém">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Endereços</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAddresses}</p>
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
                    <p className="text-sm font-medium text-gray-600">Vazios</p>
                    <p className="text-2xl font-bold text-green-600">{stats.emptyAddresses}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ocupados</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.filledAddresses}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Navigation className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalAddresses > 0 
                        ? `${Math.round((stats.filledAddresses / stats.totalAddresses) * 100)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Plus className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Address Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Endereços</h3>
              <p className="text-sm text-gray-600">Gerencie todos os endereços do armazém</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/enderecos/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Endereço
              </Link>
            </Button>
          </div>

          {/* Addresses List */}
          <AddressesList addresses={addresses} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading addresses:', error)
    // Redirect to error page if backend is unavailable
    throw error
  }
}
