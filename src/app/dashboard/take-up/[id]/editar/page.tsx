import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard-layout'
import { getTakeUp } from '@/app/actions/take-up-actions'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import TakeUpEditClient from '@/components/take-up-edit-client'

interface EditTakeUpPageProps {
  params: Promise<{ id: string }>
}

/**
 * Loading component for the form
 */
function TakeUpFormLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados do take-up...</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Server component that fetches take-up data and renders the edit interface
 */
async function EditTakeUpContent({ takeUpId }: { takeUpId: string }) {
  try {
    const takeUp = await getTakeUp(takeUpId)
    return <TakeUpEditClient takeUp={takeUp} />
  } catch (error) {
    console.error('Error fetching take-up:', error)
    notFound()
  }
}

export default async function EditTakeUpPage({ params }: EditTakeUpPageProps) {
  return (
    <DashboardLayout title="Editar Take-Up" subtitle="Modifique as informações do take-up e gerencie seus pacotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/take-up">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Take-Ups
            </Link>
          </Button>
        </div>

        {/* Content */}
        <Suspense fallback={<TakeUpFormLoading />}>
          <EditTakeUpContent takeUpId={(await params).id} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

export const dynamic = 'force-dynamic' 
