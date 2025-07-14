"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus,
  Edit,
  Users,
  MapPin,
  ArrowUp,
  Network,
  Truck,
  Package
} from "lucide-react"
import Link from "next/link"

interface MenuItem {
  id: string
  title: string
  subtitle: string
  description: string
  records: string
  iconName: string
  iconBg: string
  iconColor: string
  href: string
}

interface DashboardClientProps {
  menuItems: MenuItem[]
}

// Icon mapping
const iconMap = {
  Users,
  MapPin,
  ArrowUp,
  Network,
  Truck,
  Package
}

export default function DashboardClient({ menuItems }: DashboardClientProps) {
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

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Package
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
          {filteredMenuItems.map((item) => {
            const IconComponent = getIcon(item.iconName)
            return (
              <Link key={item.id} href={item.href}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.iconBg}`}>
                        <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
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
            )
          })}
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
