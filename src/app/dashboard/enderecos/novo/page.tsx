import DashboardLayout from "@/components/dashboard-layout"
import AddressForm from "@/components/address-form"

export default function NovoEnderecoPage() {
  return (
    <DashboardLayout title="Novo Endereço" subtitle="Adicione um novo endereço ao armazém">
      <AddressForm mode="create" />
    </DashboardLayout>
  )
}
