"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, PackageIcon, Search, MapPin } from "lucide-react"
import { createExpedicao } from "@/app/actions/expedicao-actions"
import type { AvailablePackageForShipping } from "@/types/expedicao"

interface ExpedicaoFormProps {
  availablePackages: AvailablePackageForShipping[]
}

export default function ExpedicaoForm({ availablePackages }: ExpedicaoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    destination: "",
    responsible: "",
    carrier: "",
    trackingNumber: "",
    observations: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePackageCheckboxChange = (packageId: string, checked: boolean) => {
    setSelectedPackageIds(prev =>
      checked ? [...prev, packageId] : prev.filter(id => id !== packageId)
    )
  }

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId)
  }

  // Filter packages based on search term
  const filteredPackages = availablePackages.filter(pkg =>
    pkg.packageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.addressCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.lot.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTotalWeight = () => {
    return selectedPackageIds.reduce((total, id) => {
      const pkg = availablePackages.find(p => p.id === id)
      return total + (pkg ? Number(pkg.weight) : 0)
    }, 0)
  }

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedPackageIds.length === 0) {
      alert("Selecione pelo menos um pacote para expedição.")
      return
    }

    if (!formData.destination) {
      alert("Informe o destino da expedição.")
      return
    }

    setIsSubmitting(true)

    try {
      // Filter selected packages for submission
      availablePackages.filter(pkg => selectedPackageIds.includes(pkg.id))
      
      // Let the server generate the expedition code to avoid hydration issues
      const formDataObj = new FormData()
      formDataObj.append('code', '') // Server will generate the code
      formDataObj.append('destination', formData.destination)
      formDataObj.append('responsible', formData.responsible || 'Sistema')
      formDataObj.append('carrier', formData.carrier || 'Transportadora Padrão')
      formDataObj.append('tracking', formData.trackingNumber || '') // Server will generate if empty
      formDataObj.append('packageIds', selectedPackageIds.join(','))
      formDataObj.append('notes', formData.observations || '')

      const result = await createExpedicao({}, formDataObj)
      
      if (result.errors) {
        console.error('Validation errors:', result.errors)
        alert('Erro de validação. Verifique os dados informados.')
      } else {
        alert('Expedição criada com sucesso!')
        router.push("/dashboard/expedicao")
      }
    } catch (error) {
      console.error('Error creating expedition:', error)
      alert('Erro ao criar expedição. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPackageId) {
      alert("Selecione um pacote para expedição.")
      return
    }

    if (!formData.destination) {
      alert("Informe o destino da expedição.")
      return
    }

    setIsSubmitting(true)

    try {
      const selectedPackage = availablePackages.find(pkg => pkg.id === selectedPackageId)
      if (!selectedPackage) {
        alert("Pacote selecionado não encontrado.")
        return
      }
      
      // Let the server generate the expedition code to avoid hydration issues
      const formDataObj = new FormData()
      formDataObj.append('code', '') // Server will generate the code
      formDataObj.append('destination', formData.destination)
      formDataObj.append('responsible', formData.responsible || 'Sistema')
      formDataObj.append('carrier', formData.carrier || 'Transportadora Padrão')
      formDataObj.append('tracking', formData.trackingNumber || '') // Server will generate if empty
      formDataObj.append('packageIds', selectedPackageId)
      formDataObj.append('notes', formData.observations || '')

      const result = await createExpedicao({}, formDataObj)
      
      if (result.errors) {
        console.error('Validation errors:', result.errors)
        alert('Erro de validação. Verifique os dados informados.')
      } else {
        alert('Expedição criada com sucesso!')
        router.push("/dashboard/expedicao")
      }
    } catch (error) {
      console.error('Error creating expedition:', error)
      alert('Erro ao criar expedição. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/expedicao")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Form Content */}
      <Tabs defaultValue="lote" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lote">Expedição em Lote</TabsTrigger>
          <TabsTrigger value="unitario">Expedição Unitária</TabsTrigger>
        </TabsList>

        {/* Expedição em Lote */}
        <TabsContent value="lote" className="space-y-6">
          <form onSubmit={handleSubmitBatch} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Detalhes da expedição em lote</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destino *</Label>
                    <Input
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Ex: São Paulo - SP"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible">Responsável</Label>
                    <Input
                      id="responsible"
                      name="responsible"
                      value={formData.responsible}
                      onChange={handleChange}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carrier">Transportadora</Label>
                    <Input
                      id="carrier"
                      name="carrier"
                      value={formData.carrier}
                      onChange={handleChange}
                      placeholder="Nome da transportadora"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingNumber">Código de Rastreamento</Label>
                    <Input
                      id="trackingNumber"
                      name="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={handleChange}
                      placeholder="Código de rastreamento"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Seleção de Pacotes</CardTitle>
                <CardDescription>Selecione os pacotes para expedição</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar pacotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Selected Summary */}
                {selectedPackageIds.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">
                        {selectedPackageIds.length} pacotes selecionados
                      </span>
                      <span className="font-medium text-blue-800">
                        Peso total: {getTotalWeight().toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                )}

                {/* Packages Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Selecionar</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Lote</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPackages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPackageIds.includes(pkg.id)}
                              onCheckedChange={(checked) => 
                                handlePackageCheckboxChange(pkg.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{pkg.packageNumber}</div>
                              <Badge variant="outline" className="text-xs">
                                {pkg.takeUpCode}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{pkg.customerName}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{pkg.addressCode}</div>
                              <div className="text-xs text-gray-500">
                                {pkg.streetName}, {pkg.addressNumber}
                                {pkg.addressComplement && ` - ${pkg.addressComplement}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{Number(pkg.weight).toFixed(2)} kg</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{pkg.lot}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredPackages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <PackageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    {searchTerm ? "Nenhum pacote encontrado com os critérios de busca." : "Nenhum pacote disponível para expedição."}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || selectedPackageIds.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Criar Expedição"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Expedição Unitária */}
        <TabsContent value="unitario" className="space-y-6">
          <form onSubmit={handleSubmitSingle} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Detalhes da expedição unitária</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination-unit">Destino *</Label>
                    <Input
                      id="destination-unit"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Ex: São Paulo - SP"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible-unit">Responsável</Label>
                    <Input
                      id="responsible-unit"
                      name="responsible"
                      value={formData.responsible}
                      onChange={handleChange}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carrier-unit">Transportadora</Label>
                    <Input
                      id="carrier-unit"
                      name="carrier"
                      value={formData.carrier}
                      onChange={handleChange}
                      placeholder="Nome da transportadora"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingNumber-unit">Código de Rastreamento</Label>
                    <Input
                      id="trackingNumber-unit"
                      name="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={handleChange}
                      placeholder="Código de rastreamento"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observations-unit">Observações</Label>
                  <Textarea
                    id="observations-unit"
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Single Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Seleção de Pacote</CardTitle>
                <CardDescription>Selecione um pacote para expedição</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar pacotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Selected Package Info */}
                {selectedPackageId && (
                  <div className="p-4 bg-green-50 rounded-lg border">
                    {(() => {
                      const selectedPkg = availablePackages.find(p => p.id === selectedPackageId)
                      return selectedPkg ? (
                        <div className="space-y-2">
                          <div className="font-medium text-green-800">
                            Pacote selecionado: {selectedPkg.packageNumber}
                          </div>
                          <div className="text-sm text-green-700">
                            Cliente: {selectedPkg.customerName} | Peso: {Number(selectedPkg.weight).toFixed(2)} kg | Endereço: {selectedPkg.addressCode}
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPackages.map((pkg) => (
                    <Card 
                      key={pkg.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPackageId === pkg.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="font-medium">{pkg.packageNumber}</div>
                            <Badge variant="outline" className="text-xs">
                              {pkg.takeUpCode}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">{pkg.customerName}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>{pkg.addressCode}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Peso: {Number(pkg.weight).toFixed(2)} kg</span>
                            <Badge variant="secondary">{pkg.lot}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPackages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <PackageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    {searchTerm ? "Nenhum pacote encontrado com os critérios de busca." : "Nenhum pacote disponível para expedição."}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedPackageId}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Criar Expedição"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
