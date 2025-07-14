import AddressesList from "@/components/addresses-list"
import DashboardLayout from "@/components/dashboard-layout"
import { getAddresses } from "@/app/actions/address-actions"

export default async function AddressesPage() {
  try {
    const addresses = await getAddresses()

    return (
      <DashboardLayout title="Endereços" subtitle="Gerenciamento de endereços do armazém">
        <AddressesList addresses={addresses} />
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading addresses:', error)
    return (
      <DashboardLayout title="Endereços" subtitle="Gerenciamento de endereços do armazém">
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar endereços. Tente novamente.</p>
        </div>
      </DashboardLayout>
    )
  }
} 
