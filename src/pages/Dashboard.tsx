import { Building2 } from "lucide-react"

const Dashboard = () => {
  return (
    <div className="p-6 bg-background min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">Dashboard</h1>
          <p className="text-xl text-muted-foreground">Página em construção</p>
        </div>
        
        <div className="bg-card p-8 rounded-lg border text-center">
          <h2 className="text-2xl font-semibold mb-4">Em desenvolvimento</h2>
          <p className="text-muted-foreground">
            Esta página está sendo desenvolvida e estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;