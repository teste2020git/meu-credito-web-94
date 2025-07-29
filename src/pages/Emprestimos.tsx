import { useState, useEffect } from "react"
import { Plus, ArrowUpDown, Edit, MessageCircle, Copy, Search, Calendar, Clock, CheckCircle, AlertTriangle, DollarSign, TrendingUp, TrendingDown, PiggyBank, CalendarIcon, Filter, X, Eraser, CircleArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { EmprestimoForm } from "@/components/emprestimo-form"
import { Cliente } from "@/pages/Clientes"
import { MonthYearPicker } from "@/components/month-year-picker"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Parcela {
  numero: number
  dataVencimento: Date
  dataPagamento?: Date
  status: "A Vencer" | "Atrasado" | "Pg Antecipado" | "Pg Vencimento" | "Pg Atrasado"
  diasAtraso: number
  jurosParcela: number
  valorPagar: number
}

export interface Emprestimo {
  id: string
  clienteId: string
  data: Date
  valor: number
  juros: number
  parcelas: number
  taxaAtraso: boolean
  porcentagemAtraso?: number
  parcelasDetalhadas: Parcela[]
}

type SortField = 'cliente' | 'data' | 'valor' | 'juros' | 'totalPago' | 'totalRestante' | 'lucro' | 'proximaParcela' | 'valorParcela'
type SortOrder = 'asc' | 'desc'

interface EmprestimoComCliente extends Emprestimo {
  clienteNome: string
  clienteWhatsapp: boolean
  clienteTelefone: string
}

const Emprestimos = () => {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [emprestimosComClientes, setEmprestimosComClientes] = useState<EmprestimoComCliente[]>([])
  const [filteredEmprestimos, setFilteredEmprestimos] = useState<EmprestimoComCliente[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('data')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [editingEmprestimo, setEditingEmprestimo] = useState<Emprestimo | null>(null)
  
  // Estados dos filtros
  const [selectedClienteId, setSelectedClienteId] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<Date>()
  const [selectedDataEmprestimo, setSelectedDataEmprestimo] = useState<Date>()
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedProximaParcela, setSelectedProximaParcela] = useState<Date>()
  const [referenceFilter, setReferenceFilter] = useState<string>("emprestimos")
  const [clienteFilterOpen, setClienteFilterOpen] = useState(false)
  const [monthFilterOpen, setMonthFilterOpen] = useState(false)
  const [dataEmprestimoOpen, setDataEmprestimoOpen] = useState(false)
  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [proximaParcelaOpen, setProximaParcelaOpen] = useState(false)
  
  const { toast } = useToast()

  // Load emprestimos and clientes from localStorage
  useEffect(() => {
    const savedEmprestimos = localStorage.getItem('emprestimos')
    const savedClientes = localStorage.getItem('clientes')
    
    if (savedEmprestimos) {
      const parsedEmprestimos = JSON.parse(savedEmprestimos).map((emp: any) => ({
        ...emp,
        data: new Date(emp.data),
        parcelasDetalhadas: emp.parcelasDetalhadas?.map((p: any) => ({
          ...p,
          dataVencimento: new Date(p.dataVencimento),
          dataPagamento: p.dataPagamento ? new Date(p.dataPagamento) : undefined
        })) || []
      }))
      setEmprestimos(parsedEmprestimos)
    }
    
    if (savedClientes) {
      setClientes(JSON.parse(savedClientes))
    }
  }, [])

  // Combine emprestimos with cliente data
  useEffect(() => {
    const combined = emprestimos.map(emprestimo => {
      const cliente = clientes.find(c => c.id === emprestimo.clienteId)
      return {
        ...emprestimo,
        clienteNome: cliente?.nome || 'Cliente não encontrado',
        clienteWhatsapp: cliente?.whatsapp || false,
        clienteTelefone: cliente?.telefone || ''
      }
    })
    setEmprestimosComClientes(combined)
  }, [emprestimos, clientes])

  // Filter and sort emprestimos
  useEffect(() => {
    let filtered = emprestimosComClientes.filter(emprestimo => {
      // Filtro por cliente
      const clienteMatch = !selectedClienteId || emprestimo.clienteId === selectedClienteId
      
      // Filtro por mês (mês e ano)
      let monthMatch = true
      if (selectedMonth) {
        if (referenceFilter === "emprestimos") {
          // Comportamento atual - filtrar por data do empréstimo
          monthMatch = new Date(emprestimo.data).getMonth() === selectedMonth.getMonth() &&
                      new Date(emprestimo.data).getFullYear() === selectedMonth.getFullYear()
        } else if (referenceFilter === "parcelas") {
          // Novo comportamento - filtrar por parcelas com vencimento no mês
          monthMatch = emprestimo.parcelasDetalhadas.some(parcela => {
            const dataVencimento = new Date(parcela.dataVencimento)
            return dataVencimento.getMonth() === selectedMonth.getMonth() &&
                   dataVencimento.getFullYear() === selectedMonth.getFullYear()
          })
        }
      }
      
      // Filtro por data do empréstimo
      const dataEmprestimoMatch = !selectedDataEmprestimo || 
        new Date(emprestimo.data).toDateString() === selectedDataEmprestimo.toDateString()
      
      // Filtro por status
      const statusInfo = calcularStatusEmprestimo(emprestimo)
      const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(statusInfo.status)
      
      // Filtro por próxima parcela
      const proximaParcela = obterProximaParcela(emprestimo)
      const proximaParcelaMatch = !selectedProximaParcela || (
        proximaParcela && 
        new Date(proximaParcela.dataVencimento).toDateString() === selectedProximaParcela.toDateString()
      )
      
      return clienteMatch && monthMatch && dataEmprestimoMatch && statusMatch && proximaParcelaMatch
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'cliente':
          aValue = a.clienteNome.toLowerCase()
          bValue = b.clienteNome.toLowerCase()
          break
        case 'data':
          aValue = new Date(a.data).getTime()
          bValue = new Date(b.data).getTime()
          break
        case 'valor':
          aValue = a.valor
          bValue = b.valor
          break
        case 'juros':
          aValue = a.juros
          bValue = b.juros
          break
        case 'totalPago':
          aValue = calcularTotalPago(a)
          bValue = calcularTotalPago(b)
          break
        case 'totalRestante':
          aValue = calcularTotalRestante(a)
          bValue = calcularTotalRestante(b)
          break
        case 'lucro':
          aValue = calcularLucro(a)
          bValue = calcularLucro(b)
          break
        case 'proximaParcela':
          const proxA = obterProximaParcela(a)
          const proxB = obterProximaParcela(b)
          aValue = proxA ? new Date(proxA.dataVencimento).getTime() : 0
          bValue = proxB ? new Date(proxB.dataVencimento).getTime() : 0
          break
        case 'valorParcela':
          const parcelaA = obterProximaParcela(a)
          const parcelaB = obterProximaParcela(b)
          aValue = parcelaA ? parcelaA.valorPagar : 0
          bValue = parcelaB ? parcelaB.valorPagar : 0
          break
        default:
          aValue = 0
          bValue = 0
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    setFilteredEmprestimos(filtered)
  }, [emprestimosComClientes, sortField, sortOrder, selectedClienteId, selectedMonth, selectedDataEmprestimo, selectedStatus, selectedProximaParcela, referenceFilter])

  // Helper functions
  const calcularTotalPago = (emprestimo: Emprestimo): number => {
    return emprestimo.parcelasDetalhadas
      .filter(p => p.dataPagamento)
      .reduce((sum, p) => sum + p.valorPagar, 0)
  }

  const calcularTotalRestante = (emprestimo: Emprestimo): number => {
    return emprestimo.parcelasDetalhadas
      .filter(p => !p.dataPagamento)
      .reduce((sum, p) => sum + p.valorPagar, 0)
  }

  const calcularLucro = (emprestimo: Emprestimo): number => {
    const totalPago = calcularTotalPago(emprestimo)
    return totalPago - emprestimo.valor
  }

  const obterProximaParcela = (emprestimo: Emprestimo): Parcela | null => {
    if (!emprestimo.parcelasDetalhadas || emprestimo.parcelasDetalhadas.length === 0) {
      return null
    }
    
    const parcelasNaoPagas = emprestimo.parcelasDetalhadas
      .filter(p => !p.dataPagamento)
      .sort((a, b) => {
        const dateA = a.dataVencimento instanceof Date ? a.dataVencimento : new Date(a.dataVencimento)
        const dateB = b.dataVencimento instanceof Date ? b.dataVencimento : new Date(b.dataVencimento)
        return dateA.getTime() - dateB.getTime()
      })
    
    return parcelasNaoPagas.length > 0 ? parcelasNaoPagas[0] : null
  }

  const calcularStatusEmprestimo = (emprestimo: Emprestimo): { status: string; icon: any; color: string } => {
    const parcelasNaoPagas = emprestimo.parcelasDetalhadas.filter(p => !p.dataPagamento)
    
    if (parcelasNaoPagas.length === 0) {
      return { status: 'Finalizado', icon: CheckCircle, color: 'text-green-500' }
    }
    
    const proximaParcela = obterProximaParcela(emprestimo)
    if (!proximaParcela) {
      return { status: 'Finalizado', icon: CheckCircle, color: 'text-green-500' }
    }
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataVencimento = new Date(proximaParcela.dataVencimento)
    dataVencimento.setHours(0, 0, 0, 0)
    
    if (dataVencimento < hoje) {
      return { status: 'Atrasado', icon: AlertTriangle, color: 'text-red-500' }
    } else {
      return { status: 'A vencer', icon: Clock, color: 'text-gray-500' }
    }
  }

  const contarParcelasPagas = (emprestimo: Emprestimo): string => {
    const pagas = emprestimo.parcelasDetalhadas.filter(p => p.dataPagamento).length
    const total = emprestimo.parcelasDetalhadas.length
    return `${pagas}/${total}`
  }

  const handleAddEmprestimo = (novoEmprestimo: Omit<Emprestimo, 'id'>) => {
    const emprestimo: Emprestimo = {
      ...novoEmprestimo,
      id: Date.now().toString()
    }
    
    // Salvar no localStorage
    const emprestimosExistentes = JSON.parse(localStorage.getItem('emprestimos') || '[]')
    const novosEmprestimos = [...emprestimosExistentes, emprestimo]
    localStorage.setItem('emprestimos', JSON.stringify(novosEmprestimos))
    
    // Atualizar estado local
    setEmprestimos(novosEmprestimos)
    
    toast({
      title: "Empréstimo adicionado!",
      description: "O empréstimo foi cadastrado com sucesso.",
    })
    
    setIsDialogOpen(false)
  }

  const handleEditEmprestimo = (emprestimoAtualizado: Omit<Emprestimo, 'id'>) => {
    if (!editingEmprestimo) return
    
    const updatedEmprestimos = emprestimos.map(emp =>
      emp.id === editingEmprestimo.id
        ? { ...emprestimoAtualizado, id: editingEmprestimo.id }
        : emp
    )
    
    setEmprestimos(updatedEmprestimos)
    localStorage.setItem('emprestimos', JSON.stringify(updatedEmprestimos))
    setEditingEmprestimo(null)
    setIsDialogOpen(false)
    
    toast({
      title: "Empréstimo atualizado!",
      description: "O empréstimo foi atualizado com sucesso.",
    })
  }

  const openEditDialog = (emprestimo: Emprestimo) => {
    setEditingEmprestimo(emprestimo)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingEmprestimo(null)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleWhatsApp = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, '')
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${cleanPhone}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCopyPhone = (telefone: string) => {
    navigator.clipboard.writeText(telefone)
    toast({
      title: "Número copiado!",
      description: "O número do cliente foi copiado para a área de transferência.",
    })
  }

  // Funções para cálculos dos totais (aplicando filtros)
  const calcularTotalEmprestado = (): number => {
    return filteredEmprestimos.reduce((total, emprestimo) => total + emprestimo.valor, 0)
  }

  const calcularTotalRecebido = (): number => {
    if (selectedMonth && referenceFilter === "parcelas") {
      // Para filtro por parcelas, calcular apenas parcelas pagas no mês selecionado
      return filteredEmprestimos.reduce((total, emprestimo) => {
        const parcelasPagasNoMes = emprestimo.parcelasDetalhadas
          .filter(parcela => {
            const dataVencimento = new Date(parcela.dataVencimento)
            return parcela.dataPagamento &&
                   dataVencimento.getMonth() === selectedMonth.getMonth() &&
                   dataVencimento.getFullYear() === selectedMonth.getFullYear()
          })
          .reduce((sum, parcela) => sum + parcela.valorPagar, 0)
        return total + parcelasPagasNoMes
      }, 0)
    }
    return filteredEmprestimos.reduce((total, emprestimo) => total + calcularTotalPago(emprestimo), 0)
  }

  const calcularTotalAReceber = (): number => {
    if (selectedMonth && referenceFilter === "parcelas") {
      // Para filtro por parcelas, calcular apenas parcelas não pagas no mês selecionado
      return filteredEmprestimos.reduce((total, emprestimo) => {
        const parcelasNaoPagasNoMes = emprestimo.parcelasDetalhadas
          .filter(parcela => {
            const dataVencimento = new Date(parcela.dataVencimento)
            return !parcela.dataPagamento &&
                   dataVencimento.getMonth() === selectedMonth.getMonth() &&
                   dataVencimento.getFullYear() === selectedMonth.getFullYear()
          })
          .reduce((sum, parcela) => sum + parcela.valorPagar, 0)
        return total + parcelasNaoPagasNoMes
      }, 0)
    }
    return filteredEmprestimos.reduce((total, emprestimo) => total + calcularTotalRestante(emprestimo), 0)
  }

  const calcularTotalLucro = (): number => {
    return filteredEmprestimos.reduce((total, emprestimo) => total + calcularLucro(emprestimo), 0)
  }

  const calcularTotalParcelas = (): number => {
    return calcularTotalRecebido() + calcularTotalAReceber()
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setSelectedClienteId("")
    setSelectedMonth(undefined)
    setSelectedDataEmprestimo(undefined)
    setSelectedStatus([])
    setSelectedProximaParcela(undefined)
    setReferenceFilter("emprestimos")
  }

  // Função para lidar com filtros mutuamente exclusivos
  const handleDateFilterChange = (filterType: 'month' | 'dataEmprestimo' | 'proximaParcela', value: any) => {
    // Limpar outros filtros de data
    if (filterType === 'month') {
      setSelectedMonth(value)
      setSelectedDataEmprestimo(undefined)
      setSelectedProximaParcela(undefined)
    } else if (filterType === 'dataEmprestimo') {
      setSelectedDataEmprestimo(value)
      setSelectedMonth(undefined)
      setSelectedProximaParcela(undefined)
      setReferenceFilter("emprestimos")
    } else if (filterType === 'proximaParcela') {
      setSelectedProximaParcela(value)
      setSelectedMonth(undefined)
      setSelectedDataEmprestimo(undefined)
      setReferenceFilter("emprestimos")
    }
  }

  // Status disponíveis
  const statusDisponiveis = ["Finalizado", "Atrasado", "A vencer"]

  // Função para alternar status no filtro
  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  return (
    <TooltipProvider>
      <div className="p-6 bg-background min-h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Empréstimos</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setEditingEmprestimo(null)}>
                <Plus className="h-4 w-4" />
                Novo Empréstimo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] lg:max-w-[900px] xl:max-w-[1100px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEmprestimo ? 'Editar Empréstimo' : 'Adicionar Novo Empréstimo'}</DialogTitle>
              </DialogHeader>
              <EmprestimoForm 
                onSubmit={editingEmprestimo ? handleEditEmprestimo : handleAddEmprestimo} 
                onCancel={closeDialog}
                emprestimo={editingEmprestimo}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emprestado</CardTitle>
                <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {calcularTotalEmprestado().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                <CircleArrowDown className="h-6 w-6 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  R$ {calcularTotalRecebido().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total A Receber</CardTitle>
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  R$ {calcularTotalAReceber().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            {selectedMonth && referenceFilter === "parcelas" ? (
              <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Parcelas</CardTitle>
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    R$ {calcularTotalParcelas().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={`${calcularTotalLucro() >= 0 ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lucro</CardTitle>
                  <PiggyBank className={`h-6 w-6 ${calcularTotalLucro() >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${calcularTotalLucro() >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                    R$ {calcularTotalLucro().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filtros */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 items-stretch w-full">
              {/* Filtro por Cliente */}
              <div className="col-span-3 min-w-0">
                <Popover open={clienteFilterOpen} onOpenChange={setClienteFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                      {selectedClienteId 
                        ? clientes.find(c => c.id === selectedClienteId)?.nome || "Cliente selecionado"
                        : "Cliente"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem onSelect={() => { setSelectedClienteId(""); setClienteFilterOpen(false) }}>
                            Todos os clientes
                          </CommandItem>
                          {clientes.map((cliente) => (
                            <CommandItem
                              key={cliente.id}
                              onSelect={() => { setSelectedClienteId(cliente.id); setClienteFilterOpen(false) }}
                            >
                              {cliente.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Mês */}
              <div className={`${selectedMonth ? 'col-span-2' : 'col-span-2'} min-w-0`}>
                <MonthYearPicker
                  value={selectedMonth}
                  onSelect={(date) => handleDateFilterChange('month', date)}
                  placeholder="Mês"
                />
              </div>

              {/* Filtro de Referência - aparece apenas quando mês está selecionado */}
              {selectedMonth && (
                <div className="col-span-2 min-w-0">
                  <Select value={referenceFilter} onValueChange={setReferenceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Referência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emprestimos">Empréstimos</SelectItem>
                      <SelectItem value="parcelas">Parcelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtro por Data do Empréstimo */}
              <div className={`${selectedMonth ? 'col-span-2' : 'col-span-3'} min-w-0`}>
                <Popover open={dataEmprestimoOpen} onOpenChange={setDataEmprestimoOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {selectedDataEmprestimo ? format(selectedDataEmprestimo, "dd/MM/yyyy") : "Data Empréstimo"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDataEmprestimo}
                      onSelect={(date) => { handleDateFilterChange('dataEmprestimo', date); setDataEmprestimoOpen(false) }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Status */}
              <div className="col-span-2 min-w-0">
                <Popover open={statusFilterOpen} onOpenChange={setStatusFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                      <Filter className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {selectedStatus.length > 0 ? `${selectedStatus.length} status` : "Status"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align="start">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Status</h4>
                      {statusDisponiveis.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={selectedStatus.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <label htmlFor={status} className="text-sm font-normal">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro por Próxima Parcela */}
              <div className={`${selectedMonth ? 'col-span-2' : 'col-span-3'} min-w-0`}>
                <Popover open={proximaParcelaOpen} onOpenChange={setProximaParcelaOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {selectedProximaParcela ? format(selectedProximaParcela, "dd/MM/yyyy") : "Próxima Parcela"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedProximaParcela}
                      onSelect={(date) => { handleDateFilterChange('proximaParcela', date); setProximaParcelaOpen(false) }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Botão Limpar Filtros */}
              <div className="col-span-1 min-w-0">
                <Button 
                  variant="outline" 
                  onClick={limparFiltros}
                  size="icon"
                  className="w-full h-full flex items-center justify-center"
                  title="Limpar todos os filtros"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>


          {/* Table */}
          <div className="border rounded-md overflow-x-auto">
            <Table className="min-w-[1200px]">
                <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('cliente')}>
                    <div className="flex items-center gap-2">
                      Cliente
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('data')}>
                    <div className="flex items-center gap-2 justify-center">
                      Data
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('valor')}>
                    <div className="flex items-center gap-2 justify-center">
                      Valor
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('juros')}>
                    <div className="flex items-center gap-2 justify-center">
                      Juros
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Parcelas</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('totalPago')}>
                    <div className="flex items-center gap-2 justify-center">
                      Total Pago
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('totalRestante')}>
                    <div className="flex items-center gap-2 justify-center">
                      Total Restante
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('lucro')}>
                    <div className="flex items-center gap-2 justify-center">
                      Lucro
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('proximaParcela')}>
                    <div className="flex items-center gap-2 justify-center">
                      Próxima Parcela
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('valorParcela')}>
                    <div className="flex items-center gap-2 justify-center">
                      Valor Parcela
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmprestimos.length > 0 ? (
                  filteredEmprestimos.map((emprestimo) => {
                    const statusInfo = calcularStatusEmprestimo(emprestimo)
                    const proximaParcela = obterProximaParcela(emprestimo)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <TableRow key={emprestimo.id}>
                        <TableCell className="font-medium">{emprestimo.clienteNome}</TableCell>
                        <TableCell className="text-center">{new Date(emprestimo.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">R$ {emprestimo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-center">{emprestimo.juros}%</TableCell>
                        <TableCell className="text-center">{contarParcelasPagas(emprestimo)}</TableCell>
                        <TableCell className="text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="flex items-center justify-center">
                                <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{statusInfo.status}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">R$ {calcularTotalPago(emprestimo).toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="text-right">R$ {calcularTotalRestante(emprestimo).toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className={`text-right ${calcularLucro(emprestimo) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {calcularLucro(emprestimo).toFixed(2).replace('.', ',')}
                        </TableCell>
                        <TableCell className="text-center">
                          {proximaParcela ? new Date(proximaParcela.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {proximaParcela ? `R$ ${proximaParcela.valorPagar.toFixed(2).replace('.', ',')}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => openEditDialog(emprestimo)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar</p>
                              </TooltipContent>
                            </Tooltip>

                            {emprestimo.clienteWhatsapp ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleWhatsApp(emprestimo.clienteTelefone)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Abrir WhatsApp</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleCopyPhone(emprestimo.clienteTelefone)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copiar número</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                      {searchTerm ? 'Nenhum empréstimo encontrado.' : 'Nenhum empréstimo cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Emprestimos
