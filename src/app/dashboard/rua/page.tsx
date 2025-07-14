import { Suspense } from 'react'
import Link from "next/link"
import { Plus, MapPin, Calendar, CheckCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStreets, getStreetStats } from '@/app/actions/street-actions'
import StreetList from '@/components/street-list'

export default async function RuaPage() {
  try {
    // Fetch streets and stats from backend
    const [streets, stats] = await Promise.all([
      getStreets(),
      getStreetStats()
    ])

    return (
      <DashboardLayout title="Ruas" subtitle="Gerencie todas as ruas do armazém">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Ruas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStreets}</p>
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
                    <p className="text-sm font-medium text-gray-600">Ruas Recentes</p>
                    <p className="text-2xl font-bold text-green-600">{stats.recentStreets.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-2xl font-bold text-purple-600">Ativo</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Street Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Ruas</h3>
              <p className="text-sm text-gray-600">Gerencie todas as ruas do armazém</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/rua/nova">
                <Plus className="w-4 h-4 mr-2" />
                Nova Rua
              </Link>
            </Button>
          </div>

          {/* Streets List */}
          <StreetList initialStreets={streets} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading streets:', error)
    // Redirect to error page if backend is unavailable
    throw error
  }
}
