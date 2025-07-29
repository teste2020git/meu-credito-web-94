import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mockClientes, mockEmprestimos } from "@/data/mockData"

const Configuracoes = () => {
  const [generateMockData, setGenerateMockData] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar se já existem dados mock no localStorage
    const existingClientes = localStorage.getItem('clientes')
    const existingEmprestimos = localStorage.getItem('emprestimos')
    
    if (existingClientes && existingEmprestimos) {
      const clientes = JSON.parse(existingClientes)
      const emprestimos = JSON.parse(existingEmprestimos)
      
      // Verificar se os dados são os dados mock (comparando alguns IDs)
      const isMockData = clientes.some((c: any) => 
        mockClientes.find(mc => mc.id === c.id && mc.nome === c.nome)
      )
      
      setGenerateMockData(isMockData)
    }
  }, [])

  const handleToggleMockData = (checked: boolean) => {
    setGenerateMockData(checked)
    
    if (checked) {
      // Salvar dados mock no localStorage
      localStorage.setItem('clientes', JSON.stringify(mockClientes))
      localStorage.setItem('emprestimos', JSON.stringify(mockEmprestimos))
      
      toast({
        title: "Dados gerados com sucesso!",
        description: "10 clientes e 20 empréstimos foram adicionados ao sistema.",
      })
    } else {
      // Limpar dados do localStorage
      localStorage.removeItem('clientes')
      localStorage.removeItem('emprestimos')
      
      toast({
        title: "Dados removidos!",
        description: "Todos os dados foram removidos do sistema.",
      })
    }
    
    // Recarregar a página para atualizar os dados em outras telas
    window.location.reload()
  }

  return (
    <div className="p-6 bg-background min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações do sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados de Demonstração</CardTitle>
            <CardDescription>
              Configure dados de exemplo para testar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mock-data" className="text-base font-medium">
                  Gerar Dados Aleatórios
                </Label>
                <p className="text-sm text-muted-foreground">
                  Adiciona 10 clientes e 20 empréstimos de exemplo ao sistema.
                  <br />
                  <strong>Atenção:</strong> Isso irá substituir todos os dados existentes.
                </p>
              </div>
              <Switch
                id="mock-data"
                checked={generateMockData}
                onCheckedChange={handleToggleMockData}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Detalhes sobre os dados gerados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Clientes de Exemplo</Label>
                <p className="text-sm text-muted-foreground">
                  10 clientes com nomes realistas e números de telefone variados, 
                  alguns com WhatsApp ativo e outros não.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Empréstimos de Exemplo</Label>
                <p className="text-sm text-muted-foreground">
                  20 empréstimos com diferentes valores, taxas de juros, 
                  status de pagamento e cenários realistas.
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium">Cenários Incluídos</Label>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Empréstimos finalizados (todas as parcelas pagas)</li>
                <li>• Empréstimos com parcelas em atraso</li>
                <li>• Empréstimos com parcelas a vencer</li>
                <li>• Diferentes taxas de juros (6% a 35%)</li>
                <li>• Diferentes quantidades de parcelas (3 a 15)</li>
                <li>• Diferentes valores de empréstimo (R$ 1.500 a R$ 15.000)</li>
                <li>• Parcelas pagas antecipadamente, no vencimento e em atraso</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Configuracoes