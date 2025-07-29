
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, addDays, differenceInDays, isAfter, isBefore, isSameDay } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, DollarSign, Clock, TriangleAlert, CircleCheckBig, Calculator, Eraser } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Cliente } from "@/pages/Clientes"

interface Parcela {
  numero: number
  dataVencimento: Date
  dataPagamento?: Date
  status: "A Vencer" | "Atrasado" | "Pg Antecipado" | "Pg Vencimento" | "Pg Atrasado"
  diasAtraso: number
  jurosParcela: number
  valorPagar: number
}

const emprestimoSchema = z.object({
  clienteId: z.string({
    required_error: "Cliente é obrigatório",
  }).min(1, "Cliente é obrigatório"),
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  valor: z.string({
    required_error: "Valor é obrigatório",
  }).min(1, "Valor é obrigatório"),
  juros: z.string({
    required_error: "Juros é obrigatório",
  }).min(1, "Juros é obrigatório"),
  parcelas: z.string({
    required_error: "Parcelas é obrigatório",
  }).min(1, "Parcelas é obrigatório"),
  taxaAtraso: z.boolean().default(false),
  porcentagemAtraso: z.string().optional(),
}).refine((data) => {
  if (data.taxaAtraso && (!data.porcentagemAtraso || data.porcentagemAtraso.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Porcentagem de Atraso é obrigatória quando Taxa de Atraso está ativada",
  path: ["porcentagemAtraso"],
})

type EmprestimoFormData = z.infer<typeof emprestimoSchema>

interface EmprestimoFormProps {
  onSubmit: (data: {
    clienteId: string
    data: Date
    valor: number
    juros: number
    parcelas: number
    taxaAtraso: boolean
    porcentagemAtraso?: number
    parcelasDetalhadas: Parcela[]
  }) => void
  onCancel: () => void
  emprestimo?: any
}

export const EmprestimoForm = ({ onSubmit, onCancel, emprestimo }: EmprestimoFormProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [openCombobox, setOpenCombobox] = useState(false)
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [parcelasGeradas, setParcelasGeradas] = useState(false)
  const [fieldsDisabled, setFieldsDisabled] = useState(false)
  const [selectedParcela, setSelectedParcela] = useState<number | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  const form = useForm<EmprestimoFormData>({
    resolver: zodResolver(emprestimoSchema),
    defaultValues: emprestimo ? {
      clienteId: emprestimo.clienteId,
      data: new Date(emprestimo.data),
      valor: emprestimo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      juros: emprestimo.juros.toString(),
      parcelas: emprestimo.parcelas.toString(),
      taxaAtraso: emprestimo.taxaAtraso,
      porcentagemAtraso: emprestimo.porcentagemAtraso?.toString() || "",
    } : {
      data: new Date(),
      taxaAtraso: false,
      porcentagemAtraso: "10",
    },
    mode: "onSubmit",
  })

  const taxaAtraso = form.watch("taxaAtraso")

  // Load clientes from localStorage and set up editing mode
  useEffect(() => {
    const savedClientes = localStorage.getItem('clientes')
    if (savedClientes) {
      setClientes(JSON.parse(savedClientes))
    }
    
    // Se está editando, configure as parcelas e estados
    if (emprestimo) {
      // Garantir que as datas sejam objetos Date válidos
      const parcelasComDatasConvertidas = (emprestimo.parcelasDetalhadas || []).map((parcela: any) => ({
        ...parcela,
        dataVencimento: parcela.dataVencimento instanceof Date ? parcela.dataVencimento : new Date(parcela.dataVencimento),
        dataPagamento: parcela.dataPagamento ? (parcela.dataPagamento instanceof Date ? parcela.dataPagamento : new Date(parcela.dataPagamento)) : undefined
      }))
      setParcelas(parcelasComDatasConvertidas)
      setParcelasGeradas(true)
      setFieldsDisabled(true)
    }
  }, [])

  // Clear porcentagemAtraso when taxaAtraso is false
  useEffect(() => {
    if (!taxaAtraso) {
      form.setValue("porcentagemAtraso", "")
    } else {
      form.setValue("porcentagemAtraso", "10")
    }
  }, [taxaAtraso, form])

  // Utility functions for calculations
  const parseNumericValue = (value: string): number => {
    if (!value) return 0
    // Remove currency formatting and parse
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(numericValue) || 0
  }

  const calcularStatus = (dataVencimento: Date, dataPagamento?: Date): Parcela['status'] => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    if (!dataPagamento) {
      if (isAfter(dataVencimento, hoje) || isSameDay(dataVencimento, hoje)) {
        return "A Vencer"
      } else {
        return "Atrasado"
      }
    } else {
      if (isBefore(dataVencimento, dataPagamento)) {
        return "Pg Atrasado"
      } else if (isSameDay(dataVencimento, dataPagamento)) {
        return "Pg Vencimento"
      } else {
        return "Pg Antecipado"
      }
    }
  }

  const calcularDiasAtraso = (dataVencimento: Date, dataPagamento?: Date): number => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    // Se há data de pagamento, calcular até a data do pagamento
    const dataReferencia = dataPagamento || hoje
    
    if (isBefore(dataVencimento, dataReferencia)) {
      return differenceInDays(dataReferencia, dataVencimento)
    }
    return 0
  }

  const calcularJurosParcela = (valorEmprestimo: number, juros: number, taxaAtraso: boolean, porcentagemAtraso: number, diasAtraso: number): number => {
    const jurosBase = (juros / 100) * valorEmprestimo
    
    if (taxaAtraso && diasAtraso > 0) {
      const valorAtraso = ((jurosBase * (porcentagemAtraso / 100)) / 30) * diasAtraso
      return jurosBase + valorAtraso
    }
    
    return jurosBase
  }

  const gerarParcelas = async () => {
    // Validate form first
    const isValid = await form.trigger()
    if (!isValid) return

    const formData = form.getValues()
    const valorEmprestimo = parseNumericValue(formData.valor)
    const jurosPercent = parseInt(formData.juros) || 0
    const numParcelas = parseInt(formData.parcelas) || 0
    const porcentagemAtrasoValue = parseInt(formData.porcentagemAtraso || "0") || 0
    
    const parcelasGeradas: Parcela[] = []
    
    for (let i = 1; i <= numParcelas; i++) {
      const dataVencimento = addDays(formData.data, i * 30)
      const diasAtraso = calcularDiasAtraso(dataVencimento)
      const jurosParcela = calcularJurosParcela(valorEmprestimo, jurosPercent, formData.taxaAtraso, porcentagemAtrasoValue, diasAtraso)
      const valorParcela = valorEmprestimo / numParcelas
      const valorPagar = valorParcela + jurosParcela
      
      parcelasGeradas.push({
        numero: i,
        dataVencimento,
        status: calcularStatus(dataVencimento),
        diasAtraso,
        jurosParcela,
        valorPagar
      })
    }
    
    setParcelas(parcelasGeradas)
    setParcelasGeradas(true)
    setFieldsDisabled(true)
  }

  const refazerTabela = () => {
    setParcelas([])
    setParcelasGeradas(false)
    setFieldsDisabled(false)
  }

  const handlePayment = (parcelaNumero: number) => {
    setSelectedParcela(parcelaNumero)
    
    // Se a parcela já tem data de pagamento, usar ela; senão usar data atual
    const parcelaExistente = parcelas.find(p => p.numero === parcelaNumero)
    setPaymentDate(parcelaExistente?.dataPagamento || new Date())
    setPaymentModalOpen(true)
  }

  const confirmarPagamento = () => {
    if (!paymentDate) return
    if (selectedParcela === null) return
    
    setParcelas(prev => prev.map(parcela => {
      if (parcela.numero === selectedParcela) {
        const diasAtraso = calcularDiasAtraso(parcela.dataVencimento, paymentDate)
        const formData = form.getValues()
        const valorEmprestimo = parseNumericValue(formData.valor)
        const jurosPercent = parseInt(formData.juros) || 0
        const porcentagemAtrasoValue = parseInt(formData.porcentagemAtraso || "0") || 0
        
        const jurosParcela = calcularJurosParcela(valorEmprestimo, jurosPercent, formData.taxaAtraso, porcentagemAtrasoValue, diasAtraso)
        const valorParcela = valorEmprestimo / parseInt(formData.parcelas)
        
        return {
          ...parcela,
          dataPagamento: paymentDate,
          status: calcularStatus(parcela.dataVencimento, paymentDate),
          diasAtraso,
          jurosParcela,
          valorPagar: valorParcela + jurosParcela
        }
      }
      return parcela
    }))
    
    setPaymentModalOpen(false)
    setSelectedParcela(null)
    setPaymentDate(undefined)
  }

  const getStatusIcon = (status: Parcela['status']) => {
    switch (status) {
      case "A Vencer": 
        return <Clock className="h-5 w-5 text-gray-500" />
      case "Atrasado": 
        return <TriangleAlert className="h-5 w-5 text-red-500" />
      case "Pg Antecipado": 
        return <CircleCheckBig className="h-5 w-5 text-blue-500" />
      case "Pg Vencimento": 
        return <CircleCheckBig className="h-5 w-5 text-green-500" />
      case "Pg Atrasado": 
        return <CircleCheckBig className="h-5 w-5 text-orange-500" />
      default: 
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusTooltip = (status: Parcela['status']) => {
    switch (status) {
      case "A Vencer": return "A Vencer"
      case "Atrasado": return "Atrasado"
      case "Pg Antecipado": return "Pago Antecipado"
      case "Pg Vencimento": return "Pago no Vencimento"
      case "Pg Atrasado": return "Pago Atrasado"
      default: return "A Vencer"
    }
  }

  const handleSubmit = (data: EmprestimoFormData) => {
    // Verifica se as parcelas foram geradas
    if (!parcelasGeradas) {
      toast({
        title: "Erro ao salvar",
        description: "É necessário gerar as parcelas do empréstimo antes de salvar o mesmo.",
        variant: "destructive",
      })
      return
    }
    
    // Converte os valores para Number
    const emprestimoComParcelas = {
      clienteId: data.clienteId,
      data: data.data,
      valor: parseNumericValue(data.valor),
      juros: parseInt(data.juros) || 0,
      parcelas: parseInt(data.parcelas) || 0,
      taxaAtraso: data.taxaAtraso,
      porcentagemAtraso: data.porcentagemAtraso ? parseInt(data.porcentagemAtraso) : undefined,
      parcelasDetalhadas: parcelas
    }
    
    onSubmit(emprestimoComParcelas)
    form.reset()
    setParcelas([])
    setParcelasGeradas(false)
    setFieldsDisabled(false)
  }

  const selectedCliente = clientes.find(c => c.id === form.watch("clienteId"))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Primeira linha: Cliente e Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cliente Field */}
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem className="flex flex-col md:col-span-2">
                <FormLabel>Cliente</FormLabel>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <FormControl>
                     <Button
                       variant="outline"
                       role="combobox"
                       disabled={fieldsDisabled}
                       className={cn(
                         "w-full justify-between",
                         !field.value && "text-muted-foreground"
                       )}
                     >
                        {field.value
                          ? selectedCliente?.nome
                          : "Selecione um cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Pesquisar cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {clientes.map((cliente) => (
                            <CommandItem
                              value={cliente.nome}
                              key={cliente.id}
                              onSelect={() => {
                                form.setValue("clienteId", cliente.id)
                                setOpenCombobox(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  cliente.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {cliente.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data Field */}
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                       <Button
                         variant={"outline"}
                         disabled={fieldsDisabled}
                         className={cn(
                           "w-full pl-3 text-left font-normal",
                           !field.value && "text-muted-foreground"
                         )}
                       >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Segunda linha: Valor, Juros e Parcelas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Valor do Empréstimo */}
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => {
              const formatCurrency = (value: string) => {
                // Remove tudo que não for dígito
                const digits = value.replace(/\D/g, '')
                
                if (digits === '') return ''
                
                // Converte para centavos
                const cents = parseInt(digits)
                
                // Formata como moeda brasileira
                const formatted = (cents / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2
                })
                
                return formatted
              }

              const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatCurrency(e.target.value)
                field.onChange(formatted)
              }

              return (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                   <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        value={field.value || ''}
                        onChange={handleInputChange}
                        type="text"
                        disabled={fieldsDisabled}
                        className="text-right"
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* Juros */}
          <FormField
            control={form.control}
            name="juros"
            render={({ field }) => {
              const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                field.onChange(value)
              }

              return (
                <FormItem>
                  <FormLabel>Juros (%)</FormLabel>
                   <FormControl>
                      <Input 
                        placeholder="Ex: 10" 
                        value={field.value || ''}
                        onChange={handleNumericInput}
                        type="text"
                        disabled={fieldsDisabled}
                        className="text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* Quantidade de Parcelas */}
          <FormField
            control={form.control}
            name="parcelas"
            render={({ field }) => {
              const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                field.onChange(value)
              }

              return (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                   <FormControl>
                      <Input 
                        placeholder="Ex: 10" 
                        value={field.value || ''}
                        onChange={handleNumericInput}
                        type="text"
                        disabled={fieldsDisabled}
                        className="text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>

        {/* Quarta linha: Taxa de Atraso, Porcentagem e Botão Gerar Parcelas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Taxa de Atraso Checkbox */}
          <FormField
            control={form.control}
            name="taxaAtraso"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pb-2">
                 <FormControl>
                   <Checkbox
                     checked={field.value}
                     onCheckedChange={field.onChange}
                     disabled={fieldsDisabled}
                   />
                 </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Taxa de Atraso?
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Porcentagem de Atraso */}
          <FormField
            control={form.control}
            name="porcentagemAtraso"
            render={({ field }) => {
              const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                field.onChange(value)
              }

              return (
                <FormItem className={cn(!taxaAtraso && "opacity-50")}>
                  <FormLabel>Porcentagem de Atraso (%)</FormLabel>
                  <FormControl>
                      <Input 
                        placeholder="Ex: 10" 
                        value={field.value || ''}
                        onChange={handleNumericInput}
                        type="text"
                        disabled={!taxaAtraso || fieldsDisabled}
                        className="text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

          {/* Botão Gerar Parcelas ou Refazer Tabela */}
          {!parcelasGeradas ? (
            <FormItem className="flex flex-col">
              <FormLabel className="opacity-0">Gerar</FormLabel>
              <Button
                type="button"
                onClick={gerarParcelas}
                className="w-full flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Gerar Parcelas
              </Button>
            </FormItem>
          ) : (
            // Mostrar botão Refazer Tabela apenas se não há parcelas pagas e não está editando
            !emprestimo && !parcelas.some(p => p.dataPagamento) && (
              <FormItem className="flex flex-col">
                <FormLabel className="opacity-0">Refazer</FormLabel>
                <Button
                  type="button"
                  onClick={refazerTabela}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Eraser className="h-4 w-4" />
                  Refazer Tabela
                </Button>
              </FormItem>
            )
          )}
        </div>

        {/* Separador com texto Parcelas */}
        {parcelasGeradas && parcelas.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Parcelas</span>
            </div>
          </div>
        )}

          {/* Lista de Parcelas */}
         {parcelasGeradas && parcelas.length > 0 && (
           <div className="space-y-4">
             {/* Cards de Resumo */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Total Pago */}
               <div className="bg-card border rounded-lg p-4">
                 <div className="flex items-center space-x-2">
                   <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                     <CircleCheckBig className="h-5 w-5 text-green-600 dark:text-green-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Total Pago</p>
                     <p className="text-lg font-bold text-foreground">
                       {parcelas
                         .filter(p => p.dataPagamento)
                         .reduce((total, p) => total + p.valorPagar, 0)
                         .toLocaleString('pt-BR', {
                           style: 'currency',
                           currency: 'BRL'
                         })}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Total Restante */}
               <div className="bg-card border rounded-lg p-4">
                 <div className="flex items-center space-x-2">
                   <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                     <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Total Restante</p>
                     <p className="text-lg font-bold text-foreground">
                       {parcelas
                         .filter(p => !p.dataPagamento)
                         .reduce((total, p) => total + p.valorPagar, 0)
                         .toLocaleString('pt-BR', {
                           style: 'currency',
                           currency: 'BRL'
                         })}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Lucro */}
               <div className="bg-card border rounded-lg p-4">
                 <div className="flex items-center space-x-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                     <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Lucro</p>
                     <p className="text-lg font-bold text-foreground">
                       {(() => {
                         const totalPago = parcelas
                           .filter(p => p.dataPagamento)
                           .reduce((total, p) => total + p.valorPagar, 0);
                         const valorEmprestimo = parseNumericValue(form.getValues().valor);
                         const lucro = totalPago - valorEmprestimo;
                         return lucro.toLocaleString('pt-BR', {
                           style: 'currency',
                           currency: 'BRL'
                         });
                       })()}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Próxima Parcela */}
               <div className="bg-card border rounded-lg p-4">
                 <div className="flex items-center space-x-2">
                   <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                     <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Próxima Parcela</p>
                     <p className="text-lg font-bold text-foreground">
                       {(() => {
                          const proximaParcela = parcelas
                            .filter(p => !p.dataPagamento)
                            .sort((a, b) => {
                              const dateA = a.dataVencimento instanceof Date ? a.dataVencimento : new Date(a.dataVencimento);
                              const dateB = b.dataVencimento instanceof Date ? b.dataVencimento : new Date(b.dataVencimento);
                              return dateA.getTime() - dateB.getTime();
                            })[0];
                         return proximaParcela 
                           ? format(proximaParcela.dataVencimento, "dd/MM/yyyy")
                           : "Todas pagas";
                       })()}
                     </p>
                   </div>
                 </div>
               </div>
             </div>

             <div className="border rounded-lg overflow-hidden">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center py-2 px-3">Nº</TableHead>
                    <TableHead className="text-center py-2 px-3">Vencimento</TableHead>
                    <TableHead className="text-center py-2 px-3">Pagamento</TableHead>
                    <TableHead className="text-center py-2 px-3">Status</TableHead>
                    <TableHead className="text-center py-2 px-3">Dias Atraso</TableHead>
                    <TableHead className="text-center py-2 px-3">Juros</TableHead>
                    <TableHead className="text-center py-2 px-3">Valor</TableHead>
                    <TableHead className="text-center py-2 px-3">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.map((parcela) => (
                    <TableRow key={parcela.numero} className="h-12">
                      <TableCell className="text-center py-2 px-3 font-medium">{parcela.numero}</TableCell>
                       <TableCell className="text-center py-2 px-3">{format(parcela.dataVencimento, "dd/MM/yyyy")}</TableCell>
                       <TableCell className="text-center py-2 px-3">
                         {parcela.dataPagamento ? format(parcela.dataPagamento, "dd/MM/yyyy") : "-"}
                       </TableCell>
                       <TableCell className="py-2 px-3">
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <div className="flex justify-center">
                                 {getStatusIcon(parcela.status)}
                               </div>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>{getStatusTooltip(parcela.status)}</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                       </TableCell>
                       <TableCell className="text-center py-2 px-3">
                         {parcela.diasAtraso > 0 ? parcela.diasAtraso : "-"}
                       </TableCell>
                      <TableCell className="text-right py-2 px-3">
                        {parcela.jurosParcela.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </TableCell>
                      <TableCell className="text-right py-2 px-3">
                        {parcela.valorPagar.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex justify-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                   <Button
                                     type="button"
                                     variant="outline"
                                     size="sm"
                                     onClick={() => handlePayment(parcela.numero)}
                                     className="h-8 w-8 p-0 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-950 dark:hover:border-green-700"
                                   >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                               <TooltipContent side="left">
                                 <p>Informar pagamento</p>
                               </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

         {/* Modal de Pagamento */}
         <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
           <DialogContent className="sm:max-w-[425px]">
             <DialogHeader>
               <DialogTitle>Informar Data de Pagamento</DialogTitle>
             </DialogHeader>
             <div className="grid gap-4 py-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Data do Pagamento</label>
                 <Popover>
                   <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !paymentDate && "text-muted-foreground border-red-500"
                        )}
                      >
                       <CalendarIcon className="mr-2 h-4 w-4" />
                       {paymentDate ? format(paymentDate, "dd/MM/yyyy") : "Selecione a data"}
                     </Button>
                   </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={setPaymentDate}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                     </PopoverContent>
                  </Popover>
                  {!paymentDate && (
                    <p className="text-sm text-red-500 mt-1">Data do Pagamento é obrigatória</p>
                  )}
                </div>
             </div>
             <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>
                 Cancelar
               </Button>
                <Button type="button" onClick={confirmarPagamento}>
                  Confirmar Pagamento
                </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

         <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
           <Button type="submit">
             Salvar
           </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
