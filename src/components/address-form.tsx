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
import type { Address, AddressValidationErrors } from '@/types/address'
import { createAddress, updateAddress } from '@/app/actions/address-actions'
import { getStreets } from '@/app/actions/street-actions'
import { formatDateTime } from '@/lib/utils'

interface AddressFormProps {
  address?: Address
  mode: 'create' | 'edit'
}

interface StreetOption {
  id: number
  name: string
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
          {mode === 'create' ? 'Criar Endereço' : 'Salvar Alterações'}
        </>
      )}
    </Button>
  )
}

export default function AddressForm({ address, mode }: AddressFormProps) {
  const router = useRouter()
  const [streets, setStreets] = useState<StreetOption[]>([])
  const [isLoadingStreets, setIsLoadingStreets] = useState(true)
  
  // Setup form state for create or edit
  const [formState, formAction] = useFormState(
    mode === 'create' 
      ? createAddress
      : (prevState: { errors?: AddressValidationErrors, message?: string }, formData: FormData) => updateAddress(address!.id, prevState, formData),
    { errors: {}, message: '' }
  )

  // Load streets for selection
  useEffect(() => {
    const loadStreets = async () => {
      try {
        const streetData = await getStreets()
        setStreets(streetData)
      } catch (error) {
        console.error('Error loading streets:', error)
      } finally {
        setIsLoadingStreets(false)
      }
    }

    loadStreets()
  }, [])

  // Handle successful form submission
  useEffect(() => {
    if (formState.message && !formState.errors?.general) {
      // Success - redirect back to addresses list
      router.push('/dashboard/enderecos')
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
              {mode === 'create' ? 'Novo Endereço' : 'Editar Endereço'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Preencha as informações para criar um novo endereço'
                : 'Atualize as informações do endereço'
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
            {/* Street Selection */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="streetId">Rua *</Label>
              {isLoadingStreets ? (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-500">Carregando ruas...</span>
                </div>
              ) : (
                <Select 
                  name="streetId" 
                  defaultValue={address?.street.id.toString() || ''}
                >
                  <SelectTrigger className={formState.errors?.streetId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione uma rua" />
                  </SelectTrigger>
                  <SelectContent>
                    {streets.map((street) => (
                      <SelectItem key={street.id} value={street.id.toString()}>
                        {street.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formState.errors?.streetId && (
                <p className="text-sm text-red-600">{formState.errors.streetId[0]}</p>
              )}
            </div>

            {/* Number */}
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                name="number"
                placeholder="Ex: 001"
                defaultValue={address?.number || ''}
                className={formState.errors?.number ? 'border-red-500' : ''}
              />
              {formState.errors?.number && (
                <p className="text-sm text-red-600">{formState.errors.number[0]}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                name="status" 
                defaultValue={address?.status || 'empty'}
              >
                <SelectTrigger className={formState.errors?.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Vazio</SelectItem>
                  <SelectItem value="filled">Ocupado</SelectItem>
                </SelectContent>
              </Select>
              {formState.errors?.status && (
                <p className="text-sm text-red-600">{formState.errors.status[0]}</p>
              )}
            </div>

            {/* Complement */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                name="complement"
                placeholder="Ex: Prateleira A1, Setor B, etc."
                defaultValue={address?.complement || ''}
                className={formState.errors?.complement ? 'border-red-500' : ''}
              />
              {formState.errors?.complement && (
                <p className="text-sm text-red-600">{formState.errors.complement[0]}</p>
              )}
              <p className="text-xs text-gray-500">
                Informações adicionais sobre a localização (opcional)
              </p>
            </div>
          </div>

          {/* Address Information (Edit Mode) */}
          {mode === 'edit' && address && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">Informações do Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-mono">{address.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rua:</span>
                  <span className="ml-2">{address.street.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Criado em:</span>
                  <span className="ml-2">{formatDateTime(address.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Atualizado em:</span>
                  <span className="ml-2">{formatDateTime(address.updatedAt)}</span>
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
