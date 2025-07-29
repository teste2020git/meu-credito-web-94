import { Building2, Users, CreditCard, BarChart3, Calculator, Settings } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Empréstimos", url: "/emprestimos", icon: CreditCard },
  { title: "Simulador", url: "/simulador", icon: Calculator },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="p-4">
        {!collapsed && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h2 className="font-bold text-lg text-foreground">Empréstimos</h2>
              </div>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </CardContent>
          </Card>
        )}

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-3'} py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}