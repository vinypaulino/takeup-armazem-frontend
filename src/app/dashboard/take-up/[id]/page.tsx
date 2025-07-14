import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Package as PackageIcon, 
  User, 
  Calendar,
  Weight,
  Hash,
  Edit
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { getTakeUp } from '@/app/actions/take-up-actions'

interface TakeUpDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Take-Up Detail Page
 */
export default async function TakeUpDetailPage({ params }: TakeUpDetailPageProps) {
  const { id } = await params

  try {
    const takeUp = await getTakeUp(id)

    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/take-up">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Take-Ups
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Take-Up - {takeUp.customer.name}
              </h1>
              <p className="text-gray-600">
                Visualize os detalhes e pacotes deste take-up
              </p>
            </div>
            <Button asChild>
              <Link href={`/dashboard/take-up/${takeUp.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Take-Up
              </Link>
            </Button>
          </div>

          {/* Take-Up Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Take-Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p className="text-lg font-semibold text-gray-900">{takeUp.customer.name}</p>
                  <p className="text-sm text-gray-600">CNPJ: {takeUp.customer.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Criado em</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateTime(takeUp.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ID do Take-Up</p>
                  <p className="text-sm font-mono text-gray-600">{takeUp.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Última atualização</p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(takeUp.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  <CardTitle>Pacotes ({takeUp.packages.length})</CardTitle>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/take-up/${takeUp.id}/editar`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Gerenciar Pacotes
                  </Link>
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
                    Este take-up ainda não possui pacotes cadastrados.
                  </p>
                  <div className="mt-6">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/take-up/${takeUp.id}/editar`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar para Adicionar Pacotes
                      </Link>
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
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error fetching take-up:', error)
    notFound()
  }
}
