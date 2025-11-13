import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { Home as HomeIcon, Download, Trash2, HardDrive } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function BackupManager() {
  const { data: sales, isLoading: salesLoading } = trpc.sales.list.useQuery();
  const { data: backups, isLoading: backupsLoading } = trpc.backups.list.useQuery();
  const utils = trpc.useUtils();

  const createBackupMutation = trpc.backups.create.useMutation({
    onSuccess: () => {
      utils.backups.list.invalidate();
      toast.success("Backup criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteBackupMutation = trpc.backups.delete.useMutation({
    onSuccess: () => {
      utils.backups.list.invalidate();
      toast.success("Backup deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const createBackup = () => {
    if (!sales || sales.length === 0) {
      toast.error("Nenhuma venda para fazer backup");
      return;
    }

    const dataToExport = sales.map((sale) => ({
      "Código do Produto": sale.productCode,
      "Cliente": sale.clientName,
      "Tipo": sale.type,
      "Valor": sale.value,
      "Forma de Pagamento": sale.paymentMethod,
      "Data do Pagamento": format(new Date(sale.paymentDate), "dd/MM/yyyy", { locale: ptBR }),
    }));

    const summaryData = [
      { "Métrica": "Total de Vendas", "Valor": sales.length },
      { "Métrica": "Data do Backup", "Valor": format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) },
    ];

    const workbook = XLSX.utils.book_new();
    const vendas = XLSX.utils.json_to_sheet(dataToExport);
    const resumo = XLSX.utils.json_to_sheet(summaryData);

    XLSX.utils.book_append_sheet(workbook, vendas, "Vendas");
    XLSX.utils.book_append_sheet(workbook, resumo, "Resumo");

    const fileName = `backup_vendas_${format(new Date(), "dd-MM-yyyy_HH-mm-ss")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    // Registrar backup no banco de dados
    createBackupMutation.mutate({
      fileName: fileName,
      fileSize: undefined,
      salesCount: sales.length,
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciador de Backups</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <HomeIcon className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6 p-4 max-w-6xl mx-auto w-full">
        {/* Card de Criar Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Criar Novo Backup
            </CardTitle>
            <CardDescription>
              Faça backup de todos os seus dados de vendas em um arquivo Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Total de vendas a fazer backup: <span className="font-bold text-foreground">{sales?.length || 0}</span>
                </p>
              </div>
              <Button 
                onClick={createBackup}
                disabled={createBackupMutation.isPending || !sales || sales.length === 0}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {createBackupMutation.isPending ? "Criando backup..." : "Criar Backup Agora"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Backups */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Backups</CardTitle>
            <CardDescription>Todos os backups que você criou</CardDescription>
          </CardHeader>
          <CardContent>
            {backupsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : backups && backups.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Arquivo</TableHead>
                      <TableHead>Data do Backup</TableHead>
                      <TableHead>Vendas Incluídas</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.fileName}</TableCell>
                        <TableCell>{formatDate(backup.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{backup.salesCount}</Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(backup.fileSize)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBackupMutation.mutate({ id: backup.id })}
                            disabled={deleteBackupMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum backup criado ainda. Clique em "Criar Backup Agora" para começar!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
