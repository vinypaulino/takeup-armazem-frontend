"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Package, MapPin } from "lucide-react"
import { createEnderecamento } from "@/app/actions/enderecamento-actions"
import type { AvailablePackage, AvailableAddress } from "@/types/enderecamento"

interface EnderecamentoFormProps {
  availablePackages: AvailablePackage[]
  availableAddresses: AvailableAddress[]
}

export default function EnderecamentoForm({ availablePackages, availableAddresses }: EnderecamentoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPackageId) {
      alert("Selecione um pacote.")
      return
    }

    if (!selectedAddressId) {
      alert("Selecione um endereço.")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('packageId', selectedPackageId)
      formData.append('addressId', selectedAddressId)

      const result = await createEnderecamento({}, formData)
      
      if (result.errors) {
        console.error('Validation errors:', result.errors)
        alert('Erro de validação. Verifique os dados selecionados.')
      } else {
        alert('Enderecamento criado com sucesso!')
        router.push("/dashboard/enderecamento")
      }
    } catch (error) {
      console.error('Error creating enderecamento:', error)
      alert('Erro ao criar enderecamento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/enderecamento")
  }

  const selectedPackage = availablePackages.find(pkg => pkg.id === selectedPackageId)
  const selectedAddress = availableAddresses.find(addr => addr.id === selectedAddressId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Enderecamento</CardTitle>
            <CardDescription>
              Selecione um pacote e um endereço para criar o enderecamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package Selection */}
            <div className="space-y-2">
              <Label>Pacote *</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pacote" />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>
                          {pkg.packageNumber} - {pkg.customerName} ({Number(pkg.weight).toFixed(2)} kg)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPackage && (
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <div className="text-sm">
                    <div className="font-medium text-blue-800">Pacote Selecionado:</div>
                    <div className="text-blue-700">
                      {selectedPackage.packageNumber} • {selectedPackage.customerName} • 
                      Lote: {selectedPackage.lot} • Peso: {Number(selectedPackage.weight).toFixed(2)} kg
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Address Selection */}
            <div className="space-y-2">
              <Label>Endereço *</Label>
              <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um endereço" />
                </SelectTrigger>
                <SelectContent>
                  {availableAddresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {addr.addressCode} - {addr.street.name}, {addr.number}
                          {addr.complement && ` - ${addr.complement}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAddress && (
                <div className="p-3 bg-green-50 rounded-lg border">
                  <div className="text-sm">
                    <div className="font-medium text-green-800">Endereço Selecionado:</div>
                    <div className="text-green-700">
                      {selectedAddress.addressCode} • {selectedAddress.street.name}, {selectedAddress.number}
                      {selectedAddress.complement && ` - ${selectedAddress.complement}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            {selectedPackage && selectedAddress && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm">
                  <div className="font-medium text-gray-800 mb-2">Resumo do Enderecamento:</div>
                  <div className="space-y-1 text-gray-700">
                    <div>
                      <span className="font-medium">Pacote:</span> {selectedPackage.packageNumber} 
                      ({Number(selectedPackage.weight).toFixed(2)} kg)
                    </div>
                    <div>
                      <span className="font-medium">Cliente:</span> {selectedPackage.customerName}
                    </div>
                    <div>
                      <span className="font-medium">Endereço:</span> {selectedAddress.addressCode} - 
                      {selectedAddress.street.name}, {selectedAddress.number}
                      {selectedAddress.complement && ` - ${selectedAddress.complement}`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State Messages */}
            {availablePackages.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhum pacote disponível para enderecamento.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Todos os pacotes já foram enderecados ou não há pacotes no sistema.
                </p>
              </div>
            )}

            {availableAddresses.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhum endereço disponível para enderecamento.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Todos os endereços já estão ocupados ou não há endereços no sistema.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedPackageId || !selectedAddressId}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Criar Enderecamento"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
} 
