import DashboardLayout from '@/components/dashboard-layout'
import StreetForm from '@/components/street-form'

export default function NovaRuaPage() {
  return (
    <DashboardLayout title="Nova Rua" subtitle="Adicione uma nova rua ao armazém">
      <StreetForm mode="create" />
    </DashboardLayout>
  )
}
