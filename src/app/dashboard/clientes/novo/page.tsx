"use client"

import DashboardLayout from "@/components/dashboard-layout"
import CustomerForm from "@/components/customer-form"

export default function NovoClientePage() {
  return (
    <DashboardLayout title="Novo Cliente" subtitle="Cadastre um novo cliente no sistema">
      <CustomerForm mode="create" />
    </DashboardLayout>
  )
}
