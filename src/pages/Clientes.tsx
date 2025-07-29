import { useState, useEffect } from "react"
import { Plus, Search, ArrowUpDown, Edit, MessageCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ClienteForm } from "@/components/cliente-form"

export interface Cliente {
  id: string
  nome: string
  telefone: string
  cpf: string
  whatsapp: boolean
}

type SortField = 'nome' | 'telefone' | 'cpf'
type SortOrder = 'asc' | 'desc'

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const { toast } = useToast()

  // Load clientes from localStorage on component mount
  useEffect(() => {
    const savedClientes = localStorage.getItem('clientes')
    if (savedClientes) {
      const parsedClientes = JSON.parse(savedClientes)
      setClientes(parsedClientes)
      setFilteredClientes(parsedClientes)
    }
  }, [])

  // Filter and sort clientes whenever search term, sort field, or sort order changes
  useEffect(() => {
    let filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.cpf.includes(searchTerm)
    )

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortField].toLowerCase()
      const bValue = b[sortField].toLowerCase()
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    setFilteredClientes(filtered)
  }, [clientes, searchTerm, sortField, sortOrder])

  const handleAddCliente = (novoCliente: Omit<Cliente, 'id'>) => {
    const cliente: Cliente = {
      ...novoCliente,
      id: Date.now().toString()
    }
    
    const updatedClientes = [...clientes, cliente]
    setClientes(updatedClientes)
    localStorage.setItem('clientes', JSON.stringify(updatedClientes))
    setIsDialogOpen(false)
  }

  const handleEditCliente = (clienteAtualizado: Omit<Cliente, 'id'>) => {
    if (!editingCliente) return
    
    const updatedClientes = clientes.map(cliente =>
      cliente.id === editingCliente.id
        ? { ...clienteAtualizado, id: editingCliente.id }
        : cliente
    )
    
    setClientes(updatedClientes)
    localStorage.setItem('clientes', JSON.stringify(updatedClientes))
    setEditingCliente(null)
    setIsDialogOpen(false)
  }

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCliente(null)
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

  return (
    <TooltipProvider>
      <div className="p-6 bg-background min-h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setEditingCliente(null)}>
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <ClienteForm 
                onSubmit={editingCliente ? handleEditCliente : handleAddCliente} 
                onCancel={closeDialog}
                initialData={editingCliente ? {
                  nome: editingCliente.nome,
                  telefone: editingCliente.telefone,
                  cpf: editingCliente.cpf,
                  whatsapp: editingCliente.whatsapp
                } : undefined}
              />
            </DialogContent>
          </Dialog>
        </div>

      <div className="space-y-4">
        {/* Search Filter */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('nome')}>
                  <div className="flex items-center gap-2">
                    Nome
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('telefone')}>
                  <div className="flex items-center gap-2">
                    Telefone
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('cpf')}>
                  <div className="flex items-center gap-2">
                    CPF
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditDialog(cliente)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>

                        {cliente.whatsapp ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleWhatsApp(cliente.telefone)}
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
                                onClick={() => handleCopyPhone(cliente.telefone)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
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

export default Clientes