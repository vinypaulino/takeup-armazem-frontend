"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Users, 
  MapPin, 
  ArrowUp, 
  Network, 
  Truck, 
  Package,
  Plus,
  Edit
} from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    id: "clientes",
    title: "Clientes",
    subtitle: "Cadastro de clientes",
    description: "Gerencie informações dos clientes, dados de contato e histórico de operações.",
    records: "245 registros",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    href: "/dashboard/clientes",
  },
  {
    id: "rua",
    title: "Rua",
    subtitle: "Cadastro de ruas",
    description: "Configure e organize as ruas do armazém para facilitar a localização de produtos.",
    records: "32 registros",
    icon: MapPin,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    href: "/dashboard/rua",
  },
  {
    id: "enderecos",
    title: "Endereços",
    subtitle: "Cadastro de endereços",
    description: "Mantenha o controle completo dos endereços de estoque e posicionamento no armazém.",
    records: "1,247 registros",
    icon: MapPin,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    href: "/dashboard/enderecos",
  },
  {
    id: "pacotes",
    title: "Pacotes",
    subtitle: "Gestão de pacotes",
    description: "Visualize e gerencie todos os pacotes do sistema, incluindo endereçamento e status.",
    records: "89 registros",
    icon: Package,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    href: "/dashboard/pacotes",
  },
  {
    id: "take-up",
    title: "Take UP",
    subtitle: "Cadastro de take up",
    description: "Configure processos de retirada e movimentação vertical de produtos no armazém.",
    records: "89 registros",
    icon: ArrowUp,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    href: "/dashboard/take-up",
  },
  {
    id: "enderecamento",
    title: "Endereçamento",
    subtitle: "Sistema de endereçamento",
    description: "Organize o sistema de endereçamento para otimizar a localização de produtos.",
    records: "456 registros",
    icon: Network,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    href: "/dashboard/enderecamento",
  },
  {
    id: "expedicao",
    title: "Expedição",
    subtitle: "Cadastro de expedição",
    description: "Gerencie processos de expedição, envios e controle de saída de produtos.",
    records: "178 registros",
    icon: Truck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    href: "/dashboard/expedicao",
  },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Sistema de Gestão de Armazém</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar módulos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 w-64 bg-gray-50 border-gray-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            <Avatar>
              <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Search Results Count */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {filteredMenuItems.length} módulo(s) encontrado(s) para &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.iconBg}`}>
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {item.records}
                    </Badge>
                    <div className="flex gap-1">
                      <div className="p-1 rounded hover:bg-gray-100">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="p-1 rounded hover:bg-gray-100">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum módulo encontrado</h3>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar módulos que correspondam à sua busca por &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={clearSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
