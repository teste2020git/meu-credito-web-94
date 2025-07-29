import { useState } from "react"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SimulacaoResult {
  parcela: number
  jurosMensal: number
  valorParcela: number
  total: number
}

const Simulador = () => {
  const [valorEmprestimo, setValorEmprestimo] = useState("")
  const [juros, setJuros] = useState("")
  const [maximoParcelas, setMaximoParcelas] = useState("")
  const [simulacao, setSimulacao] = useState<SimulacaoResult[]>([])
  const [valorEmprestimoFormatado, setValorEmprestimoFormatado] = useState("")

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

  const parseNumericValue = (value: string): number => {
    if (!value) return 0
    // Remove currency formatting and parse
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(numericValue) || 0
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setValorEmprestimo(formatted)
  }

  const handleJurosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setJuros(value)
  }

  const handleParcelasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setMaximoParcelas(value)
  }

  const simular = () => {
    const valor = parseNumericValue(valorEmprestimo)
    const jurosPercentual = parseFloat(juros) || 0
    const parcelas = parseInt(maximoParcelas) || 0

    if (valor <= 0 || jurosPercentual < 0 || parcelas <= 0) {
      return
    }

    // Armazenar valor formatado para exibir no título da tabela
    setValorEmprestimoFormatado(valorEmprestimo)

    const jurosMensal = valor * (jurosPercentual / 100)
    const resultados: SimulacaoResult[] = []

    for (let i = 1; i <= parcelas; i++) {
      const valorParcela = (valor / i) + jurosMensal
      const total = valorParcela * i

      resultados.push({
        parcela: i,
        jurosMensal,
        valorParcela,
        total
      })
    }

    setSimulacao(resultados)
  }

  return (
    <div className="p-6 bg-background min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Simulador</h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Empréstimo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valor">Valor do Empréstimo</Label>
              <Input
                id="valor"
                value={valorEmprestimo}
                onChange={handleValorChange}
                placeholder="R$ 0,00"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="juros">Juros (%)</Label>
              <Input
                id="juros"
                value={juros}
                onChange={handleJurosChange}
                placeholder="0"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="parcelas">Máximo de Parcelas</Label>
              <Input
                id="parcelas"
                value={maximoParcelas}
                onChange={handleParcelasChange}
                placeholder="0"
                className="text-right"
              />
            </div>

            <Button 
              onClick={simular} 
              className="w-full flex items-center gap-2"
              disabled={!valorEmprestimo || !juros || !maximoParcelas}
            >
              <Calculator className="h-4 w-4" />
              Simular
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Resultados */}
        {simulacao.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Simulação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center font-bold text-lg bg-muted">
                        {valorEmprestimoFormatado} - {juros}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead className="text-center">Nº</TableHead>
                      <TableHead className="text-center">Juros Mensal</TableHead>
                      <TableHead className="text-center">Valor Parcela</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulacao.map((item) => (
                      <TableRow key={item.parcela}>
                        <TableCell className="text-center">{item.parcela}</TableCell>
                        <TableCell className="text-right">
                          R$ {item.jurosMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {item.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Simulador