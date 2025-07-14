"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import StreetForm from '@/components/street-form'

/**
 * Street Create Page
 */
export default function NovaRuaPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/rua">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nova Rua</h2>
            <p className="text-muted-foreground">
              Cadastre uma nova rua para organização do armazém
            </p>
          </div>
        </div>

        {/* Street Form */}
        <StreetForm mode="create" />
      </div>
    </DashboardLayout>
  )
}
