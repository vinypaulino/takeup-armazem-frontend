import { Suspense } from 'react'
import Link from "next/link"
import { Plus, ArrowUp, Package, Users, Weight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTakeUps } from '@/app/actions/take-up-actions'
import TakeUpList from '@/components/take-up-list'
import { formatDate } from '@/lib/utils'

/**
 * Server Component for Take-Up Statistics
 */
async function TakeUpStats() {
  try {
    const takeUps = await getTakeUps()
    const stats = {
      totalTakeUps: takeUps.length,
      totalPackages: takeUps.reduce((sum, takeUp) => sum + takeUp.packages.length, 0),
      newTakeUpsThisMonth: 0,
      avgPackagesPerTakeUp: takeUps.length > 0 ? takeUps.reduce((sum, takeUp) => sum + takeUp.packages.length, 0) / takeUps.length : 0
    }
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Take-Ups
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalTakeUps}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newTakeUpsThisMonth} novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Pacotes
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalPackages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgPackagesPerTakeUp} por take-up em média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Novos Este Mês
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newTakeUpsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Criados em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Média de Pacotes
            </CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgPackagesPerTakeUp}</div>
            <p className="text-xs text-muted-foreground">
              Pacotes por take-up
            </p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading take-up stats:', error)
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Carregando...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-muted-foreground">
                Dados indisponíveis
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

/**
 * Server Component for Recent Take-Ups
 */
async function RecentTakeUps() {
  try {
    const takeUps = await getTakeUps()
    const recentTakeUps = takeUps
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    if (recentTakeUps.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Take-Ups Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum take-up encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando um novo take-up.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/take-up/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Take-Up
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Take-Ups Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTakeUps.map((takeUp) => (
              <div
                key={takeUp.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{takeUp.customer.name}</h4>
                    <span className="text-sm text-gray-500">({takeUp.customer.cnpj})</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{takeUp.packages.length} pacotes</span>
                    <span>Criado em {formatDate(takeUp.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/take-up/${takeUp.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error loading recent take-ups:', error)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Take-Ups Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Erro ao carregar take-ups recentes.</p>
            <p className="text-sm text-gray-500 mt-2">
              Verifique sua conexão e tente novamente.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

/**
 * Loading component for Suspense boundaries
 */
function LoadingStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LoadingList() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Take-Up Main Page
 */
export default async function TakeUpPage() {
  try {
    // Fetch take-ups from backend
    const takeUps = await getTakeUps()

    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Take-Ups</h2>
              <p className="text-muted-foreground">
                Gerencie os registros de take-up do armazém
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/take-up/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Take-Up
              </Link>
            </Button>
          </div>

          {/* Statistics */}
          <Suspense fallback={<LoadingStats />}>
            <TakeUpStats />
          </Suspense>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Take-Up List */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold">Lista de Take-Ups</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/take-up/novo">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Take-Up
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <TakeUpList takeUps={takeUps} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Take-Ups Sidebar */}
            <div className="md:col-span-1">
              <Suspense fallback={<LoadingList />}>
                <RecentTakeUps />
              </Suspense>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading take-up page:', error)
    
    // If backend is unavailable, this will redirect to error page
    // due to the error handling in the API utility
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Take-Ups</h2>
              <p className="text-muted-foreground">
                Gerencie os registros de take-up do armazém
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Erro ao carregar dados dos take-ups
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Verifique sua conexão e tente novamente.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/dashboard/take-up/novo">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Take-Up
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }
}
