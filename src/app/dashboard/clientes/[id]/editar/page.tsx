import DashboardLayout from "@/components/dashboard-layout"
import CustomerForm from "@/components/customer-form"
import { getCustomer } from "@/app/actions/customer-actions"
import { notFound } from "next/navigation"

interface CustomerEditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: CustomerEditPageProps) {
  const { id } = await params
  
  try {
    // Fetch customer data from backend
    const customer = await getCustomer(id)
    
    if (!customer) {
      notFound()
    }

    return (
      <DashboardLayout title="Editar Cliente" subtitle="Atualize as informações do cliente">
        <CustomerForm mode="edit" customer={customer} />
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading customer for edit:', error)
    
    // If customer is not found or other error, show not found page
    notFound()
  }
} 
