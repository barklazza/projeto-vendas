import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { Home as HomeIcon, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function SalesReport() {
  const { data: sales, isLoading: salesLoading } = trpc.sales.list.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.sales.stats.useQuery();
  
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("");
  const [filterClientName, setFilterClientName] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const paymentMethods = useMemo(() => {
    if (!sales) return [];
    return Array.from(new Set(sales.map(s => s.paymentMethod)));
  }, [sales]);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    return sales.filter(sale => {
      if (filterPaymentMethod && sale.paymentMethod !== filterPaymentMethod) return false;
      if (filterClientName && !sale.clientName.toLowerCase().includes(filterClientName.toLowerCase())) return false;
      
      if (filterStartDate) {
        const saleDate = new Date(sale.paymentDate);
        const startDate = new Date(filterStartDate);
        if (saleDate < startDate) return false;
      }
      
      if (filterEndDate) {
        const saleDate = new Date(sale.paymentDate);
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (saleDate > endDate) return false;
      }
      
      return true;
    });
  }, [sales, filterPaymentMethod, filterClientName, filterStartDate, filterEndDate]);

  const filteredStats = useMemo(() => {
    const totalBruto = filteredSales.reduce((sum, sale) => sum + sale.value, 0);
    const totalComissao = totalBruto * 0.3;
    
    return {
      totalBruto,
      totalComissao,
      count: filteredSales.length,
    };
  }, [filteredSales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const exportToExcel = () => {
    if (!sales || sales.length === 0) {
      alert("Nenhuma venda para exportar");
      return;
    }

    const dataToExport = sales.map((sale) => ({
      "Código do Produto": sale.productCode,
      "Cliente": sale.clientName,
      "Tipo": sale.type,
      "Valor": sale.value,
      "Forma de Pagamento": sale.paymentMethod,
      "Data do Pagamento": formatDate(sale.paymentDate),
    }));

    const summaryData = [
      { "Métrica": "Total Bruto", "Valor": stats?.totalBruto || 0 },
      { "Métrica": "Comissão (30%)", "Valor": stats?.totalComissao || 0 },
      { "Métrica": "Quantidade de Vendas", "Valor": stats?.count || 0 },
    ];

    const workbook = XLSX.utils.book_new();
    const vendas = XLSX.utils.json_to_sheet(dataToExport);
    const resumo = XLSX.utils.json_to_sheet(summaryData);

    XLSX.utils.book_append_sheet(workbook, vendas, "Vendas");
    XLSX.utils.book_append_sheet(workbook, resumo, "Resumo");

    const fileName = `relatorio_vendas_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Relatórios de Vendas</h1>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Excel
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <HomeIcon className="w-4 h-4" />
                Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6 p-4 max-w-6xl mx-auto w-full">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Input
                placeholder="Buscar cliente..."
                value={filterClientName}
                onChange={(e) => setFilterClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder={filterPaymentMethod ? filterPaymentMethod : "Todas"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setFilterClientName("");
              setFilterPaymentMethod("");
              setFilterStartDate("");
              setFilterEndDate("");
            }}
            className="mt-4"
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Resumo de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Bruto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(filteredStats.totalBruto)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Comissão (30%) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissão (30%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(filteredStats.totalComissao)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quantidade de Vendas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quantidade de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {filteredStats.count}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Forma de Pagamento */}
      {stats && Object.keys(stats.byPaymentMethod).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Forma de Pagamento</CardTitle>
            <CardDescription>Total de vendas por método de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byPaymentMethod).map(([method, total]) => (
                <div key={method} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{method}</span>
                  <span className="text-lg font-bold">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Todas as vendas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredSales && filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código do Produto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.productCode}</TableCell>
                      <TableCell>{sale.clientName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sale.type}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(sale.value)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(sale.paymentDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma venda registrada ainda. Comece a registrar suas vendas!
            </div>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
