import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { FileText, Plus, Gem, HardDrive, Shield } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-2">
            <div className="flex justify-center">
              <Gem className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">{APP_TITLE}</h1>
            <p className="text-muted-foreground text-lg">
              Controle suas vendas de joias com facilidade
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <p className="text-sm text-muted-foreground">
              Organize suas vendas, acompanhe seus ganhos e gere relatórios automáticos.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Entrar com Manus
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="space-y-2">
              <Plus className="w-8 h-8 text-primary mx-auto" />
              <p className="text-sm font-medium">Registre</p>
              <p className="text-xs text-muted-foreground">suas vendas</p>
            </div>
            <div className="space-y-2">
              <FileText className="w-8 h-8 text-primary mx-auto" />
              <p className="text-sm font-medium">Visualize</p>
              <p className="text-xs text-muted-foreground">relatórios</p>
            </div>
            <div className="space-y-2">
              <Gem className="w-8 h-8 text-primary mx-auto" />
              <p className="text-sm font-medium">Controle</p>
              <p className="text-xs text-muted-foreground">seus ganhos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gem className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Bem-vindo, {user?.name || "Usuário"}!
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card: Registrar Venda */}
          <Link href="/vendas/nova">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Registrar Nova Venda
                </CardTitle>
                <CardDescription>
                  Adicione uma nova venda de joias ao seu controle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados do produto, cliente, valor e forma de pagamento.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card: Ver Relatórios */}
          <Link href="/relatorios">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Ver Relatórios
                </CardTitle>
                <CardDescription>
                  Acompanhe suas vendas e ganhos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize o total bruto, líquido (30%) e resumo por forma de pagamento.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card: Gerenciar Vendas */}
          <Link href="/vendas/gerenciar">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Gerenciar Vendas
                </CardTitle>
                <CardDescription>
                  Edite ou delete suas vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Altere dados de vendas ou remova registros indesejados.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card: Backups */}
          <Link href="/backups">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Backups
                </CardTitle>
                <CardDescription>
                  Faca backup de seus dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Crie backups de suas vendas em Excel e gerencie historico.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card: Admin Panel */}
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Painel Admin
                  </CardTitle>
                  <CardDescription>
                    Gerenciar usuários e vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visualize e gerencie dados de todos os usuários do sistema.
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Resumo Rápido</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Acesse "Ver Relatórios" para visualizar suas estatísticas de vendas.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
