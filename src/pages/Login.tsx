import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Aceitar qualquer usuário e senha
    if (username.trim() && password.trim()) {
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Sistema de Empréstimos</h1>
              <p className="text-muted-foreground mt-2">Faça login para acessar o sistema</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                <strong>Demo:</strong> Use qualquer usuário e senha para acessar a demonstração.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login