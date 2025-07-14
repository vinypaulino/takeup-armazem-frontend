'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Customer } from '@/types/customer'
import { createCustomer, updateCustomer } from '@/app/actions/customer-actions'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

interface CustomerFormProps {
  customer?: Customer
  mode: 'create' | 'edit'
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
          {mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
        </>
      )}
    </Button>
  )
}

export default function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter()
  
  // Setup form state for create or edit
  const [formState, formAction] = useFormState(
    mode === 'create' 
      ? createCustomer 
      : updateCustomer.bind(null, customer?.id || ''),
    { errors: {} }
  )

  const formatCNPJ = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Apply CNPJ mask: XX.XXX.XXX/XXXX-XX
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    e.target.value = formatted
  }

  const handleCancel = () => {
    router.push('/dashboard/clientes')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Cadastre um novo cliente no sistema' 
              : 'Atualize as informações do cliente'
            }
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Informações do Cliente' : 'Editar Informações'}
          </CardTitle>
          <CardDescription>
            {mode === 'create' 
              ? 'Preencha os dados do novo cliente' 
              : 'Atualize os dados do cliente conforme necessário'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form action={formAction} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ex: Empresa ABC Ltda"
                defaultValue={customer?.name || ''}
                required
                className={formState?.errors?.name ? 'border-red-500' : ''}
              />
              {formState?.errors?.name && (
                <p className="text-sm text-red-600">
                  {formState.errors.name[0]}
                </p>
              )}
            </div>

            {/* CNPJ Field */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                name="cnpj"
                type="text"
                placeholder="XX.XXX.XXX/XXXX-XX"
                defaultValue={customer?.cnpj || ''}
                onChange={handleCNPJChange}
                maxLength={18}
                required
                className={formState?.errors?.cnpj ? 'border-red-500' : ''}
              />
              {formState?.errors?.cnpj && (
                <p className="text-sm text-red-600">
                  {formState.errors.cnpj[0]}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Digite apenas os números do CNPJ
              </p>
            </div>

            {/* General Error */}
            {formState?.errors?.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  {formState.errors.general[0]}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <SubmitButton mode={mode} />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customer Info (Edit Mode) */}
      {mode === 'edit' && customer && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">ID do Cliente</Label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
                  {customer.id}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Data de Criação</Label>
                <p className="text-sm bg-gray-50 p-2 rounded border">
                  {formatDateTime(customer.createdAt)}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Última Atualização</Label>
              <p className="text-sm bg-gray-50 p-2 rounded border">
                {formatDateTime(customer.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
