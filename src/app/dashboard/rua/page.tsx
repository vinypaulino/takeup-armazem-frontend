import { Suspense } from 'react'
import Link from "next/link"
import { Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStreets, getStreetStats } from '@/app/actions/street-actions'
import StreetList from '@/components/street-list'


/**
 * Server Component for Street Statistics
 */
async function StreetStats() {
  try {
    const stats = await getStreetStats()
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ruas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStreets}</div>
            <p className="text-xs text-muted-foreground">
              Ruas cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentStreets.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 5 ruas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando normalmente
            </p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading street stats:', error)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Erro</div>
            <p className="text-xs text-muted-foreground">
              Erro ao carregar estatísticas
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}

/**
 * Server Component for Street List
 */
async function StreetListContainer() {
  try {
    const streets = await getStreets()
    
    return <StreetList initialStreets={streets} />
  } catch (error) {
    console.error('Error loading streets:', error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao Carregar Ruas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar a lista de ruas. 
            Verifique sua conexão e tente novamente.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/rua">
              Tentar Novamente
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
}

/**
 * Loading components
 */
function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StreetListLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main Street Page Component
 */
export default function RuaPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Ruas</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/dashboard/rua/nova">
                <Plus className="mr-2 h-4 w-4" />
                Nova Rua
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Suspense fallback={<StatsLoading />}>
          <StreetStats />
        </Suspense>

        {/* Street List */}
        <Suspense fallback={<StreetListLoading />}>
          <StreetListContainer />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
