import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StreetForm from '@/components/street-form'
import { getStreet } from '@/app/actions/street-actions'

interface EditarRuaPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Street Edit Page
 */
export default async function EditarRuaPage({ params }: EditarRuaPageProps) {
  const { id } = await params
  
  // Validate ID is a number
  const streetId = parseInt(id, 10)
  if (isNaN(streetId)) {
    notFound()
  }

  // Fetch street data
  let street
  try {
    street = await getStreet(streetId)
  } catch (error) {
    console.error(`Error fetching street ${streetId}:`, error)
    
    // Check if it's a 404 error
    if (error instanceof Error && error.message.includes('404')) {
      notFound()
    }
    
    // For other errors, show error page
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/rua">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Erro ao Carregar Rua</h2>
              <p className="text-muted-foreground">
                Não foi possível carregar os dados da rua
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Erro de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ocorreu um erro ao tentar carregar os dados da rua. 
                Verifique sua conexão e tente novamente.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard/rua">
                    Voltar para Lista
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/rua/${id}/editar`}>
                    Tentar Novamente
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/rua">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Editar Rua</h2>
            <p className="text-muted-foreground">
              Edite as informações da rua &quot;{street.name}&quot;
            </p>
          </div>
        </div>

        {/* Street Form */}
        <StreetForm street={street} mode="edit" />
      </div>
    </DashboardLayout>
  )
} 
