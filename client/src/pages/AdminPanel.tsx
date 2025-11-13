import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit2, Trash2, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";

interface SaleFormData {
  productCode: string;
  clientName: string;
  type: string;
  value: string;
  paymentMethod: string;
  paymentDate: string;
}

const paymentMethods = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Dinheiro", "Transferência"];
const jewelryTypes = ["Anel", "Colar", "Pulseira", "Brinco", "Corrente", "Pingente", "Outros"];

export default function AdminPanel() {
  const { data: users, isLoading: usersLoading } = trpc.admin.users.useQuery();
  const { data: allSales, isLoading: allSalesLoading } = trpc.admin.allSales.useQuery();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { data: userSales, isLoading: userSalesLoading } = trpc.admin.userSales.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  const updateMutation = trpc.admin.updateSale.useMutation();
  const deleteMutation = trpc.admin.deleteSale.useMutation();
  const utils = trpc.useUtils();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<SaleFormData>();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleEdit = (sale: any) => {
    setEditingId(sale.id);
    setValue("productCode", sale.productCode);
    setValue("clientName", sale.clientName);
    setValue("type", sale.type);
    setValue("value", sale.value.toString());
    setValue("paymentMethod", sale.paymentMethod);
    setValue("paymentDate", format(new Date(sale.paymentDate), "yyyy-MM-dd"));
    setIsEditDialogOpen(true);
  };

  const handleDelete = (saleId: number) => {
    setDeletingId(saleId);
    setIsDeleteDialogOpen(true);
  };

  const onSubmitEdit = async (data: SaleFormData) => {
    if (!editingId) return;

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        productCode: data.productCode,
        clientName: data.clientName,
        type: data.type,
        value: data.value.toString(),
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
      });

      toast.success("Venda atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setEditingId(null);
      reset();
      utils.admin.userSales.invalidate();
      utils.admin.allSales.invalidate();
    } catch (error) {
      toast.error("Erro ao atualizar venda");
      console.error(error);
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteMutation.mutateAsync({ id: deletingId });
      toast.success("Venda deletada com sucesso!");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      utils.admin.userSales.invalidate();
      utils.admin.allSales.invalidate();
    } catch (error) {
      toast.error("Erro ao deletar venda");
      console.error(error);
    }
  };

  const selectedUser = users?.find(u => u.id === selectedUserId);
  const displaySales = selectedUserId ? userSales : allSales;
  const isLoading = selectedUserId ? userSalesLoading : allSalesLoading;

  const stats = useMemo(() => {
    if (!displaySales) return { totalBruto: 0, totalComissao: 0, count: 0 };
    
    const totalBruto = displaySales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
    const totalComissao = totalBruto * 0.3;
    
    return {
      totalBruto,
      totalComissao,
      count: displaySales.length,
    };
  }, [displaySales]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Admin</h1>
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
        {/* Seleção de Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Usuário</CardTitle>
            <CardDescription>Escolha um usuário para visualizar suas vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="user-select">Usuário</Label>
              <Select 
                value={selectedUserId?.toString() || "0"} 
                onValueChange={(value) => {
                  setSelectedUserId(value === "0" ? null : parseInt(value));
                  reset();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário ou visualize todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os usuários</SelectItem>
                  {usersLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                  ) : (
                    users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.email} {user.role === 'admin' && '(Admin)'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Bruto */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bruto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalBruto)}
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
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalComissao)}
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
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats.count}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedUser ? `Vendas de ${selectedUser.email}` : "Todas as Vendas"}
            </CardTitle>
            <CardDescription>
              {selectedUser ? `Gerenciar vendas do usuário ${selectedUser.email}` : "Visualizar e gerenciar todas as vendas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : displaySales && displaySales.length > 0 ? (
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displaySales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.productCode}</TableCell>
                        <TableCell>{sale.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sale.type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(parseFloat(sale.value))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(sale.paymentDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(sale)}
                              className="gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(sale.id)}
                              className="gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Deletar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda encontrada.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Venda</DialogTitle>
              <DialogDescription>Atualize os dados da venda</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-productCode">Código do Produto</Label>
                <Input
                  id="edit-productCode"
                  {...register("productCode", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-clientName">Nome do Cliente</Label>
                <Input
                  id="edit-clientName"
                  {...register("clientName", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select onValueChange={(value) => setValue("type", value)} defaultValue={watch("type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {jewelryTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-value">Valor (R$)</Label>
                <Input
                  id="edit-value"
                  type="number"
                  step="0.01"
                  {...register("value", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">Forma de Pagamento</Label>
                <Select onValueChange={(value) => setValue("paymentMethod", value)} defaultValue={watch("paymentMethod")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
                <Label htmlFor="edit-paymentDate">Data do Pagamento</Label>
                <Input
                  id="edit-paymentDate"
                  type="date"
                  {...register("paymentDate", { required: true })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar Venda</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deletando..." : "Deletar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
