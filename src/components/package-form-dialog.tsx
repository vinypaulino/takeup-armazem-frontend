'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Package as PackageIcon, Plus, Edit } from 'lucide-react'
import type { Package } from '@/types/take-up'
import { createPackage, updatePackage } from '@/app/actions/package-actions'

interface PackageFormDialogProps {
  open: boolean
  onClose: () => void
  takeUpId: string
  package?: Package | null // null/undefined for create, Package for edit
  mode: 'create' | 'edit'
}

/**
 * Submit button component with loading state
 */
function SubmitButton({ mode, isLoading }: { mode: 'create' | 'edit', isLoading: boolean }) {
  const { pending } = useFormStatus()
  const disabled = pending || isLoading

  return (
    <Button type="submit" disabled={disabled}>
      {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {mode === 'create' ? (
        disabled ? 'Criando...' : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Criar Pacote
          </>
        )
      ) : (
        disabled ? 'Salvando...' : (
          <>
            <Edit className="mr-2 h-4 w-4" />
            Salvar Alterações
          </>
        )
      )}
    </Button>
  )
}

export default function PackageFormDialog({ 
  open, 
  onClose, 
  takeUpId, 
  package: packageData, 
  mode 
}: PackageFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create bound action based on mode
  const action = mode === 'create' 
    ? createPackage
    : updatePackage.bind(null, packageData?.id || '')

  const [state, dispatch] = useFormState(action, {})

  // Handle successful submission
  useEffect(() => {
    if (state.message && !state.errors) {
      // Close dialog and reset form on success
      onClose()
    }
  }, [state.message, state.errors, onClose])

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    // Add takeUpId to form data for create mode
    if (mode === 'create') {
      formData.set('takeUpId', takeUpId)
    }
    
    try {
      dispatch(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open && mode === 'create') {
      // Form will be reset by key prop change
    }
  }, [open, mode])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            {mode === 'create' ? 'Adicionar Pacote' : 'Editar Pacote'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha as informações do novo pacote.' 
              : 'Edite as informações do pacote.'
            }
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} key={`${mode}-${packageData?.id || 'new'}`}>
          <div className="space-y-4">
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

            {/* Package Number Field */}
            <div className="space-y-2">
              <Label htmlFor="packageNumber">
                Número do Pacote *
              </Label>
              <Input
                id="packageNumber"
                name="packageNumber"
                type="text"
                placeholder="Ex: PKG001, LOTE123ABC"
                defaultValue={packageData?.packageNumber || ''}
                required
              />
              {state.errors?.packageNumber && (
                <p className="text-sm text-red-600">
                  {state.errors.packageNumber[0]}
                </p>
              )}
            </div>

            {/* Lot Field */}
            <div className="space-y-2">
              <Label htmlFor="lot">
                Lote *
              </Label>
              <Input
                id="lot"
                name="lot"
                type="text"
                placeholder="Ex: LOT2024001"
                defaultValue={packageData?.lot || ''}
                required
              />
              {state.errors?.lot && (
                <p className="text-sm text-red-600">
                  {state.errors.lot[0]}
                </p>
              )}
            </div>

            {/* Weight Field */}
            <div className="space-y-2">
              <Label htmlFor="weight">
                Peso (kg) *
              </Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0.01"
                max="99999.99"
                placeholder="Ex: 15.75"
                defaultValue={packageData?.weight || ''}
                required
              />
              {state.errors?.weight && (
                <p className="text-sm text-red-600">
                  {state.errors.weight[0]}
                </p>
              )}
            </div>

            {/* Take-up ID Field (hidden field required for both create and edit) */}
            <input 
              type="hidden" 
              name="takeUpId" 
              value={takeUpId} 
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <SubmitButton mode={mode} isLoading={isSubmitting} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
