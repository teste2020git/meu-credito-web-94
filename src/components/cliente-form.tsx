import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Cliente } from "@/pages/Clientes"

interface ClienteFormProps {
  onSubmit: (cliente: Omit<Cliente, 'id'>) => void
  onCancel: () => void
  initialData?: Omit<Cliente, 'id'>
}

export function ClienteForm({ onSubmit, onCancel, initialData }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    telefone: initialData?.telefone || "",
    cpf: initialData?.cpf || "",
    whatsapp: initialData?.whatsapp || false
  })
  
  const [errors, setErrors] = useState({
    nome: "",
    telefone: "",
    cpf: ""
  })

  // Format phone number - (XX) XXXX-XXXX for 10 digits, (XX) XXXXX-XXXX for 11 digits
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11) // Limita a 11 dígitos
    
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  // Format CPF XXX.XXX.XXX-XX
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11) // Limita a 11 dígitos
    
    if (digits.length === 0) return ''
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'telefone') {
      formattedValue = formatPhone(value)
    } else if (field === 'cpf') {
      formattedValue = formatCPF(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      nome: "",
      telefone: "",
      cpf: ""
    }

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório"
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório"
    } else {
      const phoneDigits = formData.telefone.replace(/\D/g, '')
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        newErrors.telefone = "Telefone deve ter 10 ou 11 dígitos"
      }
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else {
      const cpfDigits = formData.cpf.replace(/\D/g, '')
      if (cpfDigits.length !== 11) {
        newErrors.cpf = "CPF deve ter 11 dígitos"
      }
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        nome: formData.nome.trim(),
        telefone: formData.telefone,
        cpf: formData.cpf,
        whatsapp: formData.whatsapp
      })
      
      // Reset form
      setFormData({ nome: "", telefone: "", cpf: "", whatsapp: false })
      setErrors({ nome: "", telefone: "", cpf: "" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Digite o nome completo"
          className={errors.nome ? "border-destructive" : ""}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone *</Label>
        <Input
          id="telefone"
          type="text"
          value={formData.telefone}
          onChange={(e) => handleInputChange('telefone', e.target.value)}
          placeholder="(XX) XXXXX-XXXX"
          className={errors.telefone ? "border-destructive" : ""}
        />
        {errors.telefone && (
          <p className="text-sm text-destructive">{errors.telefone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="flex items-center gap-2">
          <Checkbox
            id="whatsapp"
            checked={formData.whatsapp}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, whatsapp: checked as boolean }))
            }
          />
          WhatsApp?
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          type="text"
          value={formData.cpf}
          onChange={(e) => handleInputChange('cpf', e.target.value)}
          placeholder="XXX.XXX.XXX-XX"
          className={errors.cpf ? "border-destructive" : ""}
        />
        {errors.cpf && (
          <p className="text-sm text-destructive">{errors.cpf}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  )
}