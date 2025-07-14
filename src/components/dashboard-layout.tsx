"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MapPin, ArrowUp, Network, Truck, Menu, X, Home, LogOut, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "clientes",
    title: "Clientes",
    icon: Users,
    href: "/dashboard/clientes",
  },
  {
    id: "rua",
    title: "Rua",
    icon: MapPin,
    href: "/dashboard/rua",
  },
  {
    id: "enderecos",
    title: "Endereços",
    icon: MapPin,
    href: "/dashboard/enderecos",
  },
  {
    id: "pacotes",
    title: "Pacotes",
    icon: Package,
    href: "/dashboard/pacotes",
  },
  {
    id: "take-up",
    title: "Take UP",
    icon: ArrowUp,
    href: "/dashboard/take-up",
  },
  {
    id: "enderecamento",
    title: "Endereçamento",
    icon: Network,
    href: "/dashboard/enderecamento",
  },
  {
    id: "expedicao",
    title: "Expedição",
    icon: Truck,
    href: "/dashboard/expedicao",
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-freelance-cotton.jpeg"
                alt="FreeLance Cotton Logo"
                width={48}
                height={48}
                className="object-contain rounded-md"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">FreeLance Cotton</h1>
                <p className="text-xs text-gray-500">Sistema de Armazém</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.id} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <IconComponent className="w-5 h-5" />
                    {item.title}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Usuário</p>
                <p className="text-xs text-gray-500 truncate">usuario@email.com</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Paulino&apos;s Consultoria de Sistemas</p>
          </div>
        </footer>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
