import { Button } from "@/components/ui/button"
import { Building2, Users, CreditCard } from "lucide-react"
import { Link } from "react-router-dom"

const Index = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">Sistema de Empréstimos</h1>
          <p className="text-xl text-muted-foreground">Gerencie clientes e empréstimos de forma simples e eficiente</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Clientes</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Cadastre e gerencie informações dos seus clientes de forma organizada.
            </p>
            <Link to="/clientes">
              <Button className="w-full">Acessar Clientes</Button>
            </Link>
          </div>

          <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Empréstimos</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Controle todos os empréstimos realizados, prazos e pagamentos.
            </p>
            <Link to="/emprestimos">
              <Button className="w-full">Acessar Empréstimos</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
