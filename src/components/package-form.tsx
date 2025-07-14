'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import type { Package, PackageValidationErrors } from '@/types/take-up'
import { createPackage, updatePackage } from '@/app/actions/package-actions'
import { getTakeUps } from '@/app/actions/take-up-actions'
import { formatDateTime } from '@/lib/utils'
// Link import removed as it's not used

interface PackageFormProps {
  package?: Package
  mode: 'create' | 'edit'
  takeUpId?: string // For pre-selecting a take-up when creating
}

interface TakeUpOption {
  id: string
  customer: {
    name: string
  }
}

// Submit button component that uses useFormStatus
function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="min-w-[120px]"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {mode === 'create' ? 'Criando...' : 'Salvando...'}
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Criar Pacote' : 'Salvar Alterações'}
        </>
      )}
    </Button>
  )
}

export default function PackageForm({ package: pkg, mode, takeUpId }: PackageFormProps) {
  const router = useRouter()
  const [takeUps, setTakeUps] = useState<TakeUpOption[]>([])
  const [isLoadingTakeUps, setIsLoadingTakeUps] = useState(true)
  
  // Setup form state for create or edit
  const [formState, formAction] = useFormState(
    mode === 'create' 
      ? createPackage
      : (prevState: { errors?: PackageValidationErrors, message?: string }, formData: FormData) => updatePackage(pkg!.id, prevState, formData),
    { errors: {}, message: '' }
  )

  // Load take-ups for selection
  useEffect(() => {
    const loadTakeUps = async () => {
      try {
        const takeUpData = await getTakeUps()
        setTakeUps(takeUpData)
      } catch (error) {
        console.error('Error loading take-ups:', error)
      } finally {
        setIsLoadingTakeUps(false)
      }
    }

    loadTakeUps()
  }, [])

  // Handle successful form submission
  useEffect(() => {
    if (formState.message && !formState.errors?.general) {
      // Success - redirect back to packages list
      router.push('/dashboard/pacotes')
    }
  }, [formState.message, formState.errors, router])

  const handleCancel = () => {
    router.back()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <CardTitle>
              {mode === 'create' ? 'Novo Pacote' : 'Editar Pacote'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Preencha as informações para criar um novo pacote'
                : 'Atualize as informações do pacote'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* General Error Message */}
          {formState.errors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{formState.errors.general[0]}</p>
            </div>
          )}

          {/* Success Message */}
          {formState.message && !formState.errors?.general && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-600">{formState.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Package Number */}
            <div className="space-y-2">
              <Label htmlFor="packageNumber">Número do Pacote *</Label>
              <Input
                id="packageNumber"
                name="packageNumber"
                placeholder="Ex: PAC001"
                defaultValue={pkg?.packageNumber || ''}
                className={formState.errors?.packageNumber ? 'border-red-500' : ''}
              />
              {formState.errors?.packageNumber && (
                <p className="text-sm text-red-600">{formState.errors.packageNumber[0]}</p>
              )}
            </div>

            {/* Lot */}
            <div className="space-y-2">
              <Label htmlFor="lot">Lote *</Label>
              <Input
                id="lot"
                name="lot"
                placeholder="Ex: LOT2024001"
                defaultValue={pkg?.lot || ''}
                className={formState.errors?.lot ? 'border-red-500' : ''}
              />
              {formState.errors?.lot && (
                <p className="text-sm text-red-600">{formState.errors.lot[0]}</p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg) *</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0.01"
                max="99999.99"
                placeholder="Ex: 15.50"
                defaultValue={pkg?.weight || ''}
                className={formState.errors?.weight ? 'border-red-500' : ''}
              />
              {formState.errors?.weight && (
                <p className="text-sm text-red-600">{formState.errors.weight[0]}</p>
              )}
            </div>

            {/* Take-Up Selection */}
            <div className="space-y-2">
              <Label htmlFor="takeUpId">Take-Up *</Label>
              {isLoadingTakeUps ? (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-500">Carregando take-ups...</span>
                </div>
              ) : (
                <Select 
                  name="takeUpId" 
                  defaultValue={pkg?.takeUpId || takeUpId || ''}
                >
                  <SelectTrigger className={formState.errors?.takeUpId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um take-up" />
                  </SelectTrigger>
                  <SelectContent>
                    {takeUps.map((takeUp) => (
                      <SelectItem key={takeUp.id} value={takeUp.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{takeUp.customer.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{takeUp.id.substring(0, 8)}...</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formState.errors?.takeUpId && (
                <p className="text-sm text-red-600">{formState.errors.takeUpId[0]}</p>
              )}
            </div>
          </div>

          {/* Package Information (Edit Mode) */}
          {mode === 'edit' && pkg && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">Informações do Pacote</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-mono">{pkg.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Criado em:</span>
                  <span className="ml-2">{formatDateTime(pkg.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Atualizado em:</span>
                  <span className="ml-2">{formatDateTime(pkg.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <SubmitButton mode={mode} />
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 
