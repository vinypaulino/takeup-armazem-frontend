import { notFound } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import StreetForm from '@/components/street-form'
import { getStreet } from '@/app/actions/street-actions'

interface EditarRuaPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarRuaPage({ params }: EditarRuaPageProps) {
  const { id } = await params
  
  // Validate ID is a number
  const streetId = parseInt(id, 10)
  if (isNaN(streetId)) {
    notFound()
  }

  try {
    // Fetch street data from backend
    const street = await getStreet(streetId)
    
    if (!street) {
      notFound()
    }

    return (
      <DashboardLayout title="Editar Rua" subtitle="Atualize as informações da rua">
        <StreetForm street={street} mode="edit" />
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading street for edit:', error)
    
    // If street is not found or other error, show not found page
    notFound()
  }
} 
