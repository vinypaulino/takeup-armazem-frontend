import type React from "react"
import { getCustomerStats } from "@/app/actions/customer-actions"
import { getStreetStats } from "@/app/actions/street-actions"
import { getAddressStats } from "@/app/actions/address-actions"
import { getPackageStats } from "@/app/actions/package-actions"
import { getTakeUpStats } from "@/app/actions/take-up-actions"
import { getEnderecamentoStats } from "@/app/actions/enderecamento-actions"
import { getExpedicaoStats } from "@/app/actions/expedicao-actions"
import DashboardClient from "./dashboard-client"

interface DashboardStats {
  customers: number
  streets: number
  addresses: number
  packages: number
  takeUps: number
  enderecamentos: number
  expedicoes: number
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      customerStats,
      streetStats, 
      addressStats,
      packageStats,
      takeUpStats,
      enderecamentoStats,
      expedicaoStats
    ] = await Promise.all([
      getCustomerStats(),
      getStreetStats(),
      getAddressStats(),
      getPackageStats(),
      getTakeUpStats(),
      getEnderecamentoStats(),
      getExpedicaoStats()
    ])

    return {
      customers: customerStats.totalCustomers,
      streets: streetStats.totalStreets,
      addresses: addressStats.totalAddresses,
      packages: packageStats.totalPackages,
      takeUps: takeUpStats.totalTakeUps,
      enderecamentos: enderecamentoStats.totalEnderecamentos,
      expedicoes: expedicaoStats.totalExpedicoes
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return zero counts if there's an error
    return {
      customers: 0,
      streets: 0,
      addresses: 0,
      packages: 0,
      takeUps: 0,
      enderecamentos: 0,
      expedicoes: 0
    }
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const menuItems = [
    {
      id: "clientes",
      title: "Clientes",
      subtitle: "Cadastro de clientes",
      description: "Gerencie informações dos clientes, dados de contato e histórico de operações.",
      records: `${stats.customers} registro${stats.customers !== 1 ? 's' : ''}`,
      iconName: "Users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/dashboard/clientes",
    },
    {
      id: "rua",
      title: "Rua",
      subtitle: "Cadastro de ruas",
      description: "Configure e organize as ruas do armazém para facilitar a localização de produtos.",
      records: `${stats.streets} registro${stats.streets !== 1 ? 's' : ''}`,
      iconName: "MapPin",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      href: "/dashboard/rua",
    },
    {
      id: "enderecos",
      title: "Endereços",
      subtitle: "Cadastro de endereços",
      description: "Mantenha o controle completo dos endereços de estoque e posicionamento no armazém.",
      records: `${stats.addresses} registro${stats.addresses !== 1 ? 's' : ''}`,
      iconName: "MapPin",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      href: "/dashboard/enderecos",
    },
    {
      id: "pacotes",
      title: "Pacotes",
      subtitle: "Gestão de pacotes",
      description: "Visualize e gerencie todos os pacotes do sistema, incluindo endereçamento e status.",
      records: `${stats.packages} registro${stats.packages !== 1 ? 's' : ''}`,
      iconName: "Package",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      href: "/dashboard/pacotes",
    },
    {
      id: "take-up",
      title: "Take UP",
      subtitle: "Cadastro de take up",
      description: "Configure processos de retirada e movimentação vertical de produtos no armazém.",
      records: `${stats.takeUps} registro${stats.takeUps !== 1 ? 's' : ''}`,
      iconName: "ArrowUp",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      href: "/dashboard/take-up",
    },
    {
      id: "enderecamento",
      title: "Endereçamento",
      subtitle: "Sistema de endereçamento",
      description: "Organize o sistema de endereçamento para otimizar a localização de produtos.",
      records: `${stats.enderecamentos} registro${stats.enderecamentos !== 1 ? 's' : ''}`,
      iconName: "Network",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      href: "/dashboard/enderecamento",
    },
    {
      id: "expedicao",
      title: "Expedição",
      subtitle: "Cadastro de expedição",
      description: "Gerencie processos de expedição, envios e controle de saída de produtos.",
      records: `${stats.expedicoes} registro${stats.expedicoes !== 1 ? 's' : ''}`,
      iconName: "Truck",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/dashboard/expedicao",
    },
  ]

  return <DashboardClient menuItems={menuItems} />
}
