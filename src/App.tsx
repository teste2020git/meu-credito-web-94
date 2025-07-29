import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Emprestimos from "./pages/Emprestimos";
import Simulador from "./pages/Simulador";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  const handleLogout = () => {
    window.location.href = "/";
  };

  if (isLoginPage) {
    return (
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-9 w-9 p-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sair</span>
              </Button>
            </div>
          </header>
          <main className="flex-1">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/emprestimos" element={<Emprestimos />} />
              <Route path="/simulador" element={<Simulador />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
