'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, MapPin } from 'lucide-react'
import type { Street } from '@/types/street'
import { createStreet, updateStreet } from '@/app/actions/street-actions'
import { formatDateTime } from '@/lib/utils'

interface StreetFormProps {
  street?: Street
  mode: 'create' | 'edit'
}

/**
 * Submit button component that uses useFormStatus
 */
function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Criando...' : 'Salvando...'}
        </>
      ) : (
        mode === 'create' ? 'Criar Rua' : 'Salvar Alterações'
      )}
    </Button>
  )
}

/**
 * Street Form Component
 */
export default function StreetForm({ street, mode }: StreetFormProps) {
  // Determine which action to use based on mode
  const action = mode === 'create' 
    ? createStreet
    : updateStreet.bind(null, street!.id)

  const [state, formAction] = useFormState(action, { errors: {} })

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {mode === 'create' ? 'Nova Rua' : 'Editar Rua'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form action={formAction} className="space-y-6">
            {/* General Error */}
            {state?.errors?.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.errors.general[0]}
                </AlertDescription>
              </Alert>
            )}

            {/* Street Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome da Rua *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={street?.name || ''}
                placeholder="Ex: Rua A - Setor de Picking"
                className={state?.errors?.name ? 'border-red-500' : ''}
                required
                autoFocus={mode === 'create'}
              />
              {state?.errors?.name && (
                <p className="text-sm text-red-600">
                  {state.errors.name[0]}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Nome descritivo da rua para organização do armazém
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <SubmitButton mode={mode} />
              <Button type="button" variant="outline" asChild>
                <a href="/dashboard/rua">
                  Cancelar
                </a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* System Information Card (Edit Mode Only) */}
      {mode === 'edit' && street && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">ID da Rua</Label>
                <p className="font-medium">#{street.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Criado em</Label>
                <p className="font-medium">
                  {formatDateTime(street.createdAt)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Última atualização</Label>
                <p className="font-medium">
                  {formatDateTime(street.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dicas de Nomenclatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Use nomes descritivos que facilitem a identificação</p>
          <p>• Inclua o setor ou área (ex: &quot;Picking&quot;, &quot;Estoque&quot;, &quot;Expedição&quot;)</p>
          <p>• Mantenha um padrão consistente (ex: &quot;Rua A&quot;, &quot;Rua B&quot;, etc.)</p>
          <p>• Evite caracteres especiais desnecessários</p>
        </CardContent>
      </Card>
    </div>
  )
} 
