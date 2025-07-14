"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, PackageIcon, Calendar, ArrowUp, Plus, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Sample client data
const clients = [
  { id: "CLI001", codigo: "C001", nome: "Têxtil Brasil Ltda" },
  { id: "CLI002", codigo: "C002", nome: "Algodão & Cia" },
  { id: "CLI003", codigo: "C003", nome: "Tecelagem Norte Nordeste" },
  { id: "CLI004", codigo: "C004", nome: "Fios & Tecidos Sul" },
  { id: "CLI005", codigo: "C005", nome: "Indústria Têxtil Mineira" },
  { id: "CLI006", codigo: "C006", nome: "Confecções Centro-Oeste" },
]

// Sample address data
const addresses = [
  { id: "END001", codigo: "A-01-001", rua: "Rua A", numero: "001", complement: "Prateleira A1" },
  { id: "END002", codigo: "A-01-002", rua: "Rua A", numero: "002", complement: "Prateleira A2" },
  { id: "END003", codigo: "B-02-001", rua: "Rua B", numero: "001", complement: "Estante B1 - Nível Superior" },
  { id: "END004", codigo: "B-02-002", rua: "Rua B", numero: "002", complement: "Estante B2 - Nível Inferior" },
  { id: "END005", codigo: "C-03-001", rua: "Rua C", numero: "001", complement: "Área de Separação" },
  { id: "END006", codigo: "C-03-002", rua: "Rua C", numero: "002", complement: "Doca 1" },
]

interface TakeUpPackage {
  id: string
  numeroPacote: string
  peso: string
  lote: string
  observacao: string
}

export default function NovoTakeUpPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasShipped, setHasShipped] = useState(false)
  const [hasAddress, setHasAddress] = useState(false)
  const [editingPackage, setEditingPackage] = useState<TakeUpPackage | null>(null)
  const [isAddingPackage, setIsAddingPackage] = useState(false)

  // Get today's date in the correct format
  const today = new Date().toISOString().split("T")[0]

  const [formData, setFormData] = useState({
    codigoTakeUp: "",
    clienteId: "",
    enderecoId: "",
    dataChegada: today,
    dataSaida: "",
    destino: "",
  })

  const [packages, setPackages] = useState<TakeUpPackage[]>([])

  const [newPackage, setNewPackage] = useState<TakeUpPackage>({
    id: "",
    numeroPacote: "",
    peso: "",
    lote: "",
    observacao: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean, name: string) => {
    if (name === "hasShipped") {
      setHasShipped(checked)
      if (!checked) {
        setFormData((prev) => ({ ...prev, dataSaida: "", destino: "" }))
      }
    } else if (name === "hasAddress") {
      setHasAddress(checked)
      if (!checked) {
        setFormData((prev) => ({ ...prev, enderecoId: "" }))
      }
    }
  }

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingPackage) {
      setEditingPackage((prev) => (prev ? { ...prev, [name]: value } : null))
    } else {
      setNewPackage((prev) => ({ ...prev, [name]: value }))
    }
  }

  const generatePackageId = () => {
    return `PKG${Date.now()}`
  }

  const addPackage = () => {
    if (newPackage.numeroPacote && newPackage.peso && newPackage.lote) {
      const packageWithId = { ...newPackage, id: generatePackageId() }
      setPackages((prev) => [...prev, packageWithId])
      setNewPackage({
        id: "",
        numeroPacote: "",
        peso: "",
        lote: "",
        observacao: "",
      })
      setIsAddingPackage(false)
    }
  }

  const editPackage = (pkg: TakeUpPackage) => {
    setEditingPackage({ ...pkg })
    setIsAddingPackage(true)
  }

  const saveEditedPackage = () => {
    if (editingPackage) {
      setPackages((prev) => prev.map((pkg) => (pkg.id === editingPackage.id ? editingPackage : pkg)))
      setEditingPackage(null)
      setIsAddingPackage(false)
    }
  }

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id))
  }

  const cancelPackageEdit = () => {
    setEditingPackage(null)
    setNewPackage({
      id: "",
      numeroPacote: "",
      peso: "",
      lote: "",
      observacao: "",
    })
    setIsAddingPackage(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (packages.length === 0) {
      alert("Adicione pelo menos um pacote antes de salvar.")
      return
    }

    if (!formData.codigoTakeUp || !formData.clienteId) {
      alert("Preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Take UP criado com sucesso!")
      router.push("/dashboard/take-up")
    }, 1000)
  }

  const handleCancel = () => {
    router.push("/dashboard/take-up")
  }

  const getClientName = (id: string) => {
    const client = clients.find((c) => c.id === id)
    return client ? `${client.codigo} - ${client.nome}` : ""
  }

  const getAddressInfo = (id: string) => {
    const address = addresses.find((a) => a.id === id)
    return address ? `${address.codigo} - ${address.rua}, ${address.numero} (${address.complement})` : ""
  }

  const getTotalWeight = () => {
    return packages.reduce((total, pkg) => total + Number.parseFloat(pkg.peso || "0"), 0).toFixed(2)
  }

  const currentPackage = editingPackage || newPackage

  return (
    <DashboardLayout title="Novo Take UP" subtitle="Registre uma nova entrada de Take UP">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="takeup" className="space-y-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
              <TabsTrigger value="takeup" className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4" />
                <span className="hidden sm:inline">Dados do Take UP</span>
                <span className="sm:hidden">Take UP</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <PackageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Pacotes ({packages.length})</span>
                <span className="sm:hidden">Pacotes</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Datas e Destino</span>
                <span className="sm:hidden">Datas</span>
              </TabsTrigger>
            </TabsList>

            {/* Take UP Tab */}
            <TabsContent value="takeup">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Take UP</CardTitle>
                  <CardDescription>Informações básicas do registro de Take UP.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="codigoTakeUp">Código Take UP *</Label>
                    <Input
                      id="codigoTakeUp"
                      name="codigoTakeUp"
                      placeholder="Ex: TUP001"
                      value={formData.codigoTakeUp}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-sm text-gray-500">Código único para identificação do Take UP</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clienteId">Cliente *</Label>
                    <Select
                      value={formData.clienteId}
                      onValueChange={(value) => handleSelectChange("clienteId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{client.codigo}</span>
                              <span className="text-sm text-gray-500">{client.nome}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">Cliente relacionado a este Take UP</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasAddress"
                        checked={hasAddress}
                        onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, "hasAddress")}
                      />
                      <Label htmlFor="hasAddress" className="text-sm font-medium">
                        Endereçamento realizado
                      </Label>
                    </div>

                    {hasAddress && (
                      <div className="space-y-2">
                        <Label htmlFor="enderecoId">Endereço</Label>
                        <Select
                          value={formData.enderecoId}
                          onValueChange={(value) => handleSelectChange("enderecoId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um endereço" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{address.codigo}</span>
                                  <span className="text-sm text-gray-500">
                                    {address.rua}, {address.numero} - {address.complement}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">Endereço onde os pacotes estão localizados</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages">
              <div className="space-y-6">
                {/* Package List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Lista de Pacotes</CardTitle>
                        <CardDescription>
                          {packages.length > 0
                            ? `${packages.length} pacote${packages.length !== 1 ? "s" : ""} adicionado${packages.length !== 1 ? "s" : ""} - Peso total: ${getTotalWeight()} kg`
                            : "Nenhum pacote adicionado ainda"}
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setIsAddingPackage(true)}
                        disabled={isAddingPackage}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Pacote
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {packages.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Número do Pacote</TableHead>
                              <TableHead>Peso (kg)</TableHead>
                              <TableHead>Lote</TableHead>
                              <TableHead>Observação</TableHead>
                              <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {packages.map((pkg) => (
                              <TableRow key={pkg.id}>
                                <TableCell className="font-medium">{pkg.numeroPacote}</TableCell>
                                <TableCell>{pkg.peso}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{pkg.lote}</Badge>
                                </TableCell>
                                <TableCell>
                                  {pkg.observacao ? (
                                    <span className="text-sm">{pkg.observacao}</span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => editPackage(pkg)}
                                      disabled={isAddingPackage}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removePackage(pkg.id)}
                                      disabled={isAddingPackage}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pacote adicionado</h3>
                        <p className="text-gray-600 mb-4">Adicione pacotes para continuar com o registro do Take UP.</p>
                        <Button type="button" onClick={() => setIsAddingPackage(true)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Primeiro Pacote
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add/Edit Package Form */}
                {isAddingPackage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingPackage ? "Editar Pacote" : "Adicionar Novo Pacote"}</CardTitle>
                      <CardDescription>
                        {editingPackage
                          ? "Faça as alterações necessárias nos dados do pacote."
                          : "Preencha as informações do pacote."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="numeroPacote">Número do Pacote *</Label>
                          <Input
                            id="numeroPacote"
                            name="numeroPacote"
                            placeholder="Ex: PAC12345"
                            value={currentPackage.numeroPacote}
                            onChange={handlePackageChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="peso">Peso (kg) *</Label>
                          <Input
                            id="peso"
                            name="peso"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ex: 10.5"
                            value={currentPackage.peso}
                            onChange={handlePackageChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lote">Lote *</Label>
                        <Input
                          id="lote"
                          name="lote"
                          placeholder="Ex: LOT2025001"
                          value={currentPackage.lote}
                          onChange={handlePackageChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacao">Observação</Label>
                        <Textarea
                          id="observacao"
                          name="observacao"
                          placeholder="Observações sobre este pacote..."
                          value={currentPackage.observacao}
                          onChange={handlePackageChange}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={cancelPackageEdit}>
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={editingPackage ? saveEditedPackage : addPackage}
                          disabled={!currentPackage.numeroPacote || !currentPackage.peso || !currentPackage.lote}
                        >
                          {editingPackage ? "Salvar Alterações" : "Adicionar Pacote"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Datas e Destino</CardTitle>
                  <CardDescription>Informações sobre chegada e saída dos pacotes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="dataChegada">Data de Chegada *</Label>
                    <Input
                      id="dataChegada"
                      name="dataChegada"
                      type="date"
                      value={formData.dataChegada}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-sm text-gray-500">Data de registro dos pacotes no sistema</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasShipped"
                        checked={hasShipped}
                        onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, "hasShipped")}
                      />
                      <Label htmlFor="hasShipped" className="text-sm font-medium">
                        Expedição já realizada
                      </Label>
                    </div>

                    {hasShipped && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="dataSaida">Data de Saída</Label>
                          <Input
                            id="dataSaida"
                            name="dataSaida"
                            type="date"
                            value={formData.dataSaida}
                            onChange={handleChange}
                            required={hasShipped}
                          />
                          <p className="text-sm text-gray-500">Data em que os pacotes foram expedidos</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="destino">Destino</Label>
                          <Input
                            id="destino"
                            name="destino"
                            placeholder="Ex: Filial São Paulo"
                            value={formData.destino}
                            onChange={handleChange}
                            required={hasShipped}
                          />
                          <p className="text-sm text-gray-500">Local para onde os pacotes foram enviados</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumo do Take UP</CardTitle>
              <CardDescription>Confira os dados antes de salvar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Código Take UP</p>
                  <p className="font-medium">{formData.codigoTakeUp || "-"}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Total de Pacotes</p>
                  <p className="font-medium">
                    {packages.length} pacote{packages.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p className="font-medium">{formData.clienteId ? getClientName(formData.clienteId) : "-"}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Peso Total</p>
                  <p className="font-medium">{packages.length > 0 ? `${getTotalWeight()} kg` : "-"}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="font-medium">
                    {hasAddress && formData.enderecoId ? getAddressInfo(formData.enderecoId) : "Não endereçado"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Data de Chegada</p>
                  <p className="font-medium">
                    {formData.dataChegada
                      ? format(new Date(formData.dataChegada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Status de Expedição</p>
                  <p className="font-medium">
                    {hasShipped ? (
                      <span className="text-green-600">Expedido</span>
                    ) : (
                      <span className="text-yellow-600">Em armazém</span>
                    )}
                  </p>
                </div>

                {hasShipped && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Data de Saída</p>
                      <p className="font-medium">
                        {formData.dataSaida
                          ? format(new Date(formData.dataSaida), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "-"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Destino</p>
                      <p className="font-medium">{formData.destino || "-"}</p>
                    </div>
                  </>
                )}
              </div>

              {packages.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-500 mb-3">Pacotes Incluídos</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid gap-2">
                      {packages.map((pkg, index) => (
                        <div key={pkg.id} className="flex items-center justify-between text-sm">
                          <span>
                            {index + 1}. {pkg.numeroPacote} - {pkg.peso}kg - Lote: {pkg.lote}
                          </span>
                          {pkg.observacao && <span className="text-gray-500 text-xs">({pkg.observacao})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || packages.length === 0} className="gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Salvando..." : "Salvar Take UP"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
