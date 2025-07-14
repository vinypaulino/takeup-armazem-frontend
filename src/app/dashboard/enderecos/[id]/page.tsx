import { notFound } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import AddressForm from "@/components/address-form"
import { getAddress } from "@/app/actions/address-actions"

interface AddressDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AddressDetailPage({ params }: AddressDetailPageProps) {
  const { id } = await params
  
  try {
    // Fetch address data from backend
    const address = await getAddress(id)
    
    if (!address) {
      notFound()
    }

    return (
      <DashboardLayout title="Editar Endereço" subtitle="Atualize as informações do endereço">
        <AddressForm mode="edit" address={address} />
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading address for edit:', error)
    
    // If address is not found or other error, show not found page
    notFound()
  }
} 
