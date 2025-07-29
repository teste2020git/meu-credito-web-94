import { Cliente } from "@/pages/Clientes"
import { Emprestimo } from "@/pages/Emprestimos"

export const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "(11) 99999-1111",
    cpf: "123.456.789-01",
    whatsapp: true
  },
  {
    id: "2", 
    nome: "Maria Santos",
    telefone: "(11) 99999-2222",
    cpf: "234.567.890-12",
    whatsapp: true
  },
  {
    id: "3",
    nome: "Pedro Costa",
    telefone: "(11) 99999-3333",
    cpf: "345.678.901-23", 
    whatsapp: false
  },
  {
    id: "4",
    nome: "Ana Oliveira",
    telefone: "(11) 99999-4444",
    cpf: "456.789.012-34",
    whatsapp: true
  },
  {
    id: "5",
    nome: "Carlos Ferreira",
    telefone: "(11) 99999-5555",
    cpf: "567.890.123-45",
    whatsapp: true
  },
  {
    id: "6",
    nome: "Lucia Rocha",
    telefone: "(11) 99999-6666",
    cpf: "678.901.234-56",
    whatsapp: false
  },
  {
    id: "7",
    nome: "Roberto Lima",
    telefone: "(11) 99999-7777",
    cpf: "789.012.345-67",
    whatsapp: true
  },
  {
    id: "8",
    nome: "Fernanda Dias",
    telefone: "(11) 99999-8888",
    cpf: "890.123.456-78",
    whatsapp: true
  },
  {
    id: "9",
    nome: "Marcos Almeida",
    telefone: "(11) 99999-9999",
    cpf: "901.234.567-89",
    whatsapp: false
  },
  {
    id: "10",
    nome: "Juliana Pereira",
    telefone: "(11) 99999-0000",
    cpf: "012.345.678-90",
    whatsapp: true
  }
]

export const mockEmprestimos: Emprestimo[] = [
  {
    id: "1",
    clienteId: "1",
    data: new Date('2024-01-15'),
    valor: 5000,
    juros: 15,
    parcelas: 6,
    taxaAtraso: true,
    porcentagemAtraso: 5,
    parcelasDetalhadas: [
      {
        numero: 1,
        dataVencimento: new Date('2024-02-15'),
        dataPagamento: new Date('2024-02-15'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 75,
        valorPagar: 958.33
      },
      {
        numero: 2,
        dataVencimento: new Date('2024-03-15'),
        dataPagamento: new Date('2024-03-16'),
        status: "Pg Atrasado",
        diasAtraso: 1,
        jurosParcela: 75,
        valorPagar: 958.33
      },
      {
        numero: 3,
        dataVencimento: new Date('2024-04-15'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 75,
        valorPagar: 958.33
      },
      {
        numero: 4,
        dataVencimento: new Date('2024-05-15'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 75,
        valorPagar: 958.33
      },
      {
        numero: 5,
        dataVencimento: new Date('2024-06-15'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 75,
        valorPagar: 958.33
      },
      {
        numero: 6,
        dataVencimento: new Date('2024-07-15'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 75,
        valorPagar: 958.33
      }
    ]
  },
  {
    id: "2",
    clienteId: "2",
    data: new Date('2024-02-01'),
    valor: 3000,
    juros: 20,
    parcelas: 4,
    taxaAtraso: false,
    parcelasDetalhadas: [
      {
        numero: 1,
        dataVencimento: new Date('2024-03-01'),
        dataPagamento: new Date('2024-02-28'),
        status: "Pg Antecipado",
        diasAtraso: 0,
        jurosParcela: 150,
        valorPagar: 900
      },
      {
        numero: 2,
        dataVencimento: new Date('2024-04-01'),
        dataPagamento: new Date('2024-04-01'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 150,
        valorPagar: 900
      },
      {
        numero: 3,
        dataVencimento: new Date('2024-05-01'),
        dataPagamento: new Date('2024-05-01'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 150,
        valorPagar: 900
      },
      {
        numero: 4,
        dataVencimento: new Date('2024-06-01'),
        dataPagamento: new Date('2024-06-01'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 150,
        valorPagar: 900
      }
    ]
  },
  {
    id: "3",
    clienteId: "3",
    data: new Date('2024-03-10'),
    valor: 8000,
    juros: 12,
    parcelas: 8,
    taxaAtraso: true,
    porcentagemAtraso: 3,
    parcelasDetalhadas: [
      {
        numero: 1,
        dataVencimento: new Date('2024-04-10'),
        dataPagamento: new Date('2024-04-12'),
        status: "Pg Atrasado",
        diasAtraso: 2,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 2,
        dataVencimento: new Date('2024-05-10'),
        status: "Atrasado",
        diasAtraso: 25,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 3,
        dataVencimento: new Date('2024-06-10'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 4,
        dataVencimento: new Date('2024-07-10'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 5,
        dataVencimento: new Date('2024-08-10'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 6,
        dataVencimento: new Date('2024-09-10'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 7,
        dataVencimento: new Date('2024-10-10'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 80,
        valorPagar: 1080
      },
      {
        numero: 8,
        dataVencimento: new Date('2024-11-10'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 80,
        valorPagar: 1080
      }
    ]
  },
  {
    id: "4",
    clienteId: "4",
    data: new Date('2024-01-20'),
    valor: 2500,
    juros: 18,
    parcelas: 5,
    taxaAtraso: false,
    parcelasDetalhadas: [
      {
        numero: 1,
        dataVencimento: new Date('2024-02-20'),
        dataPagamento: new Date('2024-02-20'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 90,
        valorPagar: 590
      },
      {
        numero: 2,
        dataVencimento: new Date('2024-03-20'),
        dataPagamento: new Date('2024-03-20'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 90,
        valorPagar: 590
      },
      {
        numero: 3,
        dataVencimento: new Date('2024-04-20'),
        dataPagamento: new Date('2024-04-20'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 90,
        valorPagar: 590
      },
      {
        numero: 4,
        dataVencimento: new Date('2024-05-20'),
        dataPagamento: new Date('2024-05-20'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 90,
        valorPagar: 590
      },
      {
        numero: 5,
        dataVencimento: new Date('2024-06-20'),
        dataPagamento: new Date('2024-06-20'),
        status: "Pg Vencimento",
        diasAtraso: 0,
        jurosParcela: 90,
        valorPagar: 590
      }
    ]
  },
  {
    id: "5",
    clienteId: "5",
    data: new Date('2024-04-05'),
    valor: 10000,
    juros: 10,
    parcelas: 10,
    taxaAtraso: true,
    porcentagemAtraso: 4,
    parcelasDetalhadas: Array.from({ length: 10 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 4 + i, 5),
      dataPagamento: i < 3 ? new Date(2024, 4 + i, 5) : undefined,
      status: i < 3 ? "Pg Vencimento" : "A Vencer",
      diasAtraso: 0,
      jurosParcela: 100,
      valorPagar: 1100
    }))
  },
  {
    id: "6",
    clienteId: "6",
    data: new Date('2024-02-15'),
    valor: 4000,
    juros: 25,
    parcelas: 6,
    taxaAtraso: true,
    porcentagemAtraso: 6,
    parcelasDetalhadas: Array.from({ length: 6 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 2 + i, 15),
      dataPagamento: i < 6 ? new Date(2024, 2 + i, 15) : undefined,
        status: "Pg Vencimento",
      diasAtraso: 0,
      jurosParcela: 166.67,
      valorPagar: 833.33
    }))
  },
  {
    id: "7",
    clienteId: "7",
    data: new Date('2024-03-01'),
    valor: 6000,
    juros: 14,
    parcelas: 7,
    taxaAtraso: false,
    parcelasDetalhadas: Array.from({ length: 7 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 3 + i, 1),
      dataPagamento: i < 2 ? new Date(2024, 3 + i, 1) : undefined,
      status: i < 2 ? "Pg Vencimento" : (i === 2 ? "Atrasado" : "A Vencer"),
      diasAtraso: i === 2 ? 15 : 0,
      jurosParcela: 120,
      valorPagar: 977.14
    }))
  },
  {
    id: "8",
    clienteId: "8",
    data: new Date('2024-04-10'),
    valor: 7500,
    juros: 16,
    parcelas: 9,
    taxaAtraso: true,
    porcentagemAtraso: 5,
    parcelasDetalhadas: Array.from({ length: 9 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 4 + i, 10),
      dataPagamento: i < 4 ? new Date(2024, 4 + i, i < 2 ? 10 : 12) : undefined,
      status: i < 2 ? "Pg Vencimento" : (i < 4 ? "Pg Atrasado" : "A Vencer"),
      diasAtraso: i >= 2 && i < 4 ? 2 : 0,
      jurosParcela: 133.33,
      valorPagar: 966.67
    }))
  },
  {
    id: "9",
    clienteId: "9",
    data: new Date('2024-01-25'),
    valor: 3500,
    juros: 22,
    parcelas: 5,
    taxaAtraso: false,
    parcelasDetalhadas: Array.from({ length: 5 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 1 + i, 25),
      dataPagamento: new Date(2024, 1 + i, 25),
      status: "Pg Vencimento",
      diasAtraso: 0,
      jurosParcela: 154,
      valorPagar: 854
    }))
  },
  {
    id: "10",
    clienteId: "10",
    data: new Date('2024-05-01'),
    valor: 12000,
    juros: 8,
    parcelas: 12,
    taxaAtraso: true,
    porcentagemAtraso: 2,
    parcelasDetalhadas: Array.from({ length: 12 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 5 + i, 1),
      dataPagamento: i < 1 ? new Date(2024, 5 + i, 1) : undefined,
      status: i < 1 ? "Pg Vencimento" : "A Vencer" as const,
      diasAtraso: 0,
      jurosParcela: 80,
      valorPagar: 1080
    }))
  },
  {
    id: "11",
    clienteId: "1",
    data: new Date('2023-12-10'),
    valor: 1500,
    juros: 30,
    parcelas: 3,
    taxaAtraso: true,
    porcentagemAtraso: 8,
    parcelasDetalhadas: Array.from({ length: 3 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2023, 11 + i, 10),
      dataPagamento: new Date(2023, 11 + i, 10),
      status: "Pg Vencimento" as const,
      diasAtraso: 0,
      jurosParcela: 150,
      valorPagar: 650
    }))
  },
  {
    id: "12",
    clienteId: "3",
    data: new Date('2024-05-15'),
    valor: 9000,
    juros: 11,
    parcelas: 8,
    taxaAtraso: false,
    parcelasDetalhadas: Array.from({ length: 8 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 5 + i, 15),
      status: "A Vencer",
      diasAtraso: 0,
      jurosParcela: 123.75,
      valorPagar: 1248.75
    }))
  },
  {
    id: "13",
    clienteId: "5",
    data: new Date('2024-01-01'),
    valor: 2000,
    juros: 35,
    parcelas: 4,
    taxaAtraso: true,
    porcentagemAtraso: 10,
    parcelasDetalhadas: [
      {
        numero: 1,
        dataVencimento: new Date('2024-02-01'),
        dataPagamento: new Date('2024-02-05'),
        status: "Pg Atrasado",
        diasAtraso: 4,
        jurosParcela: 175,
        valorPagar: 675
      },
      {
        numero: 2,
        dataVencimento: new Date('2024-03-01'),
        status: "Atrasado",
        diasAtraso: 45,
        jurosParcela: 175,
        valorPagar: 675
      },
      {
        numero: 3,
        dataVencimento: new Date('2024-04-01'),
        status: "Atrasado",
        diasAtraso: 15,
        jurosParcela: 175,
        valorPagar: 675
      },
      {
        numero: 4,
        dataVencimento: new Date('2024-05-01'),
        status: "A Vencer",
        diasAtraso: 0,
        jurosParcela: 175,
        valorPagar: 675
      }
    ]
  },
  {
    id: "14",
    clienteId: "7",
    data: new Date('2024-02-20'),
    valor: 5500,
    juros: 13,
    parcelas: 6,
    taxaAtraso: false,
    parcelasDetalhadas: Array.from({ length: 6 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 2 + i, 20),
      dataPagamento: i < 6 ? new Date(2024, 2 + i, 20) : undefined,
      status: "Pg Vencimento" as const,
      diasAtraso: 0,
      jurosParcela: 119.17,
      valorPagar: 1035.83
    }))
  },
  {
    id: "15",
    clienteId: "2",
    data: new Date('2024-06-01'),
    valor: 8500,
    juros: 9,
    parcelas: 10,
    taxaAtraso: true,
    porcentagemAtraso: 3,
    parcelasDetalhadas: Array.from({ length: 10 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 6 + i, 1),
      status: "A Vencer" as const,
      diasAtraso: 0,
      jurosParcela: 76.5,
      valorPagar: 926.5
    }))
  },
  {
    id: "16",
    clienteId: "4",
    data: new Date('2024-03-25'),
    valor: 4500,
    juros: 19,
    parcelas: 7,
    taxaAtraso: true,
    porcentagemAtraso: 7,
    parcelasDetalhadas: Array.from({ length: 7 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 3 + i, 25),
      dataPagamento: i < 3 ? new Date(2024, 3 + i, i === 2 ? 27 : 25) : undefined,
      status: i < 2 ? "Pg Vencimento" : (i === 2 ? "Pg Atrasado" : "A Vencer"),
      diasAtraso: i === 2 ? 2 : 0,
      jurosParcela: 121.07,
      valorPagar: 764.29
    }))
  },
  {
    id: "17",
    clienteId: "6",
    data: new Date('2024-04-15'),
    valor: 11000,
    juros: 7,
    parcelas: 11,
    taxaAtraso: false,
    parcelasDetalhadas: Array.from({ length: 11 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 4 + i, 15),
      dataPagamento: i < 2 ? new Date(2024, 4 + i, 15) : undefined,
      status: i < 2 ? "Pg Vencimento" : "A Vencer" as const,
      diasAtraso: 0,
      jurosParcela: 70,
      valorPagar: 1070
    }))
  },
  {
    id: "18",
    clienteId: "8",
    data: new Date('2024-01-10'),
    valor: 6500,
    juros: 17,
    parcelas: 8,
    taxaAtraso: true,
    porcentagemAtraso: 4,
    parcelasDetalhadas: Array.from({ length: 8 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 1 + i, 10),
      dataPagamento: i < 8 ? new Date(2024, 1 + i, 10) : undefined,
      status: "Pg Vencimento" as const,
      diasAtraso: 0,
      jurosParcela: 138.13,
      valorPagar: 951.25
    }))
  },
  {
    id: "19",
    clienteId: "9",
    data: new Date('2024-05-20'),
    valor: 7000,
    juros: 21,
    parcelas: 9,
    taxaAtraso: false,
    parcelasDetalhadas: Array.from({ length: 9 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 5 + i, 20),
      status: "A Vencer" as const,
      diasAtraso: 0,
      jurosParcela: 163.33,
      valorPagar: 941.11
    }))
  },
  {
    id: "20",
    clienteId: "10",
    data: new Date('2024-06-10'),
    valor: 15000,
    juros: 6,
    parcelas: 15,
    taxaAtraso: true,
    porcentagemAtraso: 2,
    parcelasDetalhadas: Array.from({ length: 15 }, (_, i) => ({
      numero: i + 1,
      dataVencimento: new Date(2024, 6 + i, 10),
      status: "A Vencer" as const,
      diasAtraso: 0,
      jurosParcela: 60,
      valorPagar: 1060
    }))
  }
]
