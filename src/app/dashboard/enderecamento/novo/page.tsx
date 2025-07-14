import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getAvailablePackages, getAvailableAddresses } from "@/app/actions/enderecamento-actions"
import EnderecamentoForm from "@/components/enderecamento-form"

export default async function NovoEnderecamentoPage() {
  try {
    // Fetch available packages and addresses from server actions
    const [availablePackages, availableAddresses] = await Promise.all([
      getAvailablePackages(),
      getAvailableAddresses()
    ])

    return (
      <DashboardLayout title="Novo Endereçamento" subtitle="Crie um novo endereçamento de pacote">
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/enderecamento">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Endereçamento</h1>
              <p className="text-gray-600">Selecione um pacote e um endereço para criar o endereçamento</p>
            </div>
          </div>

          {/* Check if we have data */}
          {availablePackages.length === 0 && availableAddresses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium mb-2">Não é possível criar endereçamentos</h3>
                  <p>Não há pacotes disponíveis ou endereços livres no momento.</p>
                </div>
              </CardContent>
            </Card>
          ) : availablePackages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium mb-2">Nenhum pacote disponível</h3>
                  <p>Todos os pacotes já foram endereçados ou não há pacotes no sistema.</p>
                </div>
              </CardContent>
            </Card>
          ) : availableAddresses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium mb-2">Nenhum endereço disponível</h3>
                  <p>Todos os endereços estão ocupados.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EnderecamentoForm 
              availablePackages={availablePackages} 
              availableAddresses={availableAddresses} 
            />
          )}
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading enderecamento form data:', error)
    throw error
  }
} 
