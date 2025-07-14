'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Package, User, Calendar, RefreshCw } from 'lucide-react'
import type { TakeUp, CustomerOption } from '@/types/take-up'
import { createTakeUp, updateTakeUp, getCustomersForSelection } from '@/app/actions/take-up-actions'
import { formatDateTime } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
// ErrorCard import removed as it's not used

interface TakeUpFormProps {
  takeUp?: TakeUp
  mode: 'create' | 'edit'
}

/**
 * Submit button component that uses useFormStatus
 */
function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {mode === 'create' 
        ? (pending ? 'Criando...' : 'Criar Take-Up')
        : (pending ? 'Salvando...' : 'Salvar Alterações')
      }
    </Button>
  )
}

export default function TakeUpForm({ takeUp, mode }: TakeUpFormProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(takeUp?.customerId || '')
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [customerError, setCustomerError] = useState<string | null>(null)
  
  // Form action with bound parameters
  const formAction = mode === 'create' 
    ? createTakeUp 
    : updateTakeUp.bind(null, takeUp!.id)
  
  const [state, dispatch] = useFormState(formAction, {})

  // Load customers on component mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoadingCustomers(true)
        setCustomerError(null)
        const customerOptions = await getCustomersForSelection()
        setCustomers(customerOptions)
      } catch (error) {
        console.error('Error loading customers:', error)
        setCustomerError('Erro ao carregar lista de clientes')
      } finally {
        setLoadingCustomers(false)
      }
    }
    
    loadCustomers()
  }, [])

  // Set initial customer selection for edit mode
  useEffect(() => {
    if (mode === 'edit' && takeUp?.customerId) {
      setSelectedCustomerId(takeUp.customerId)
    }
  }, [mode, takeUp?.customerId])

  const selectedCustomer = customers.find(c => c.value === selectedCustomerId)

  const retryLoadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      setCustomerError(null)
      const customerOptions = await getCustomersForSelection()
      setCustomers(customerOptions)
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomerError('Erro ao carregar lista de clientes')
    } finally {
      setLoadingCustomers(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === 'create' ? 'Novo Take-Up' : 'Editar Take-Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-6">
            {/* General Errors */}
            {state.errors?.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.errors.general.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {state.message && !state.errors && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </Label>
              
              {loadingCustomers ? (
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <LoadingSpinner size="sm" message="Carregando clientes..." />
                </div>
              ) : customerError ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{customerError}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={retryLoadCustomers}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              ) : (
                <Select
                  name="customerId"
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  disabled={customers.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Nenhum cliente encontrado
                      </div>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer.value} value={customer.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.label}</span>
                            <span className="text-xs text-gray-500">{customer.cnpj}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              
              {/* Customer validation errors */}
              {state.errors?.customerId && (
                <p className="text-sm text-red-600">
                  {state.errors.customerId.join(', ')}
                </p>
              )}
              
              {/* Show selected customer info */}
              {selectedCustomer && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">{selectedCustomer.label}</p>
                      <p className="text-sm text-blue-700">CNPJ: {selectedCustomer.cnpj}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <SubmitButton mode={mode} />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* System Information (Edit Mode Only) */}
      {mode === 'edit' && takeUp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">ID do Take-Up</p>
                <p className="text-gray-600 font-mono">{takeUp.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Pacotes</p>
                <p className="text-gray-600">
                  {takeUp.packages.length} pacote{takeUp.packages.length !== 1 ? 's' : ''}
                  {takeUp.packages.length > 0 && (
                    <span className="ml-2 text-xs">
                      ({takeUp.packages.reduce((sum, pkg) => {
              const weight = typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0
              return sum + weight
            }, 0).toFixed(1)} kg total)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Criado em</p>
                <p className="text-gray-600">
                  {formatDateTime(takeUp.createdAt) || 'Data não informada'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Última atualização</p>
                <p className="text-gray-600">
                  {formatDateTime(takeUp.updatedAt) || 'Data não informada'}
                </p>
              </div>
            </div>

            {/* Package Summary */}
            {takeUp.packages.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium text-gray-900 mb-2">Resumo dos Pacotes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {takeUp.packages.slice(0, 6).map((pkg) => (
                    <div key={pkg.id} className="p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium">{pkg.packageNumber}</p>
                      <p className="text-gray-600">{pkg.lot} • {typeof pkg.weight === 'number' ? pkg.weight : parseFloat(pkg.weight) || 0}kg</p>
                    </div>
                  ))}
                  {takeUp.packages.length > 6 && (
                    <div className="p-2 bg-gray-100 rounded text-xs flex items-center justify-center">
                      <p className="text-gray-600">+{takeUp.packages.length - 6} pacotes</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                {mode === 'create' ? 'Sobre Take-Ups' : 'Editando Take-Up'}
              </p>
              <p className="text-blue-800">
                {mode === 'create' 
                  ? 'Um take-up representa uma operação de armazenamento para um cliente específico. Após criar o take-up, você poderá adicionar pacotes a ele.' 
                  : 'Você pode alterar o cliente associado a este take-up. Os pacotes permanecerão vinculados ao take-up após a alteração.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
