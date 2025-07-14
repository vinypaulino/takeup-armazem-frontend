import DashboardLayout from "@/components/dashboard-layout"
import { getAvailablePackagesForShipping } from "@/app/actions/expedicao-actions"
import ExpedicaoForm from "@/components/expedicao-form"

export default async function NovaExpedicaoPage() {
  // Fetch available packages for shipping from server (with fallback handling)
  const availablePackages = await getAvailablePackagesForShipping()

  return (
    <DashboardLayout title="Nova Expedição" subtitle="Registre a saída de pacotes do armazém">
      <ExpedicaoForm availablePackages={availablePackages} />
    </DashboardLayout>
  )
} 
