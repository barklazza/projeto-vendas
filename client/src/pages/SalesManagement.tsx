import { useState } from "react";
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

export default function SalesManagement() {
  const { data: sales, isLoading: salesLoading } = trpc.sales.list.useQuery();
  const updateMutation = trpc.sales.update.useMutation();
  const deleteMutation = trpc.sales.delete.useMutation();
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
        value: data.value,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
      });

      toast.success("Venda atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setEditingId(null);
      reset();
      utils.sales.list.invalidate();
      utils.sales.stats.invalidate();
    } catch (error) {
      toast.error("Erro ao atualizar venda");
      console.error(error);
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingId,
      });

      toast.success("Venda deletada com sucesso!");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      utils.sales.list.invalidate();
      utils.sales.stats.invalidate();
    } catch (error) {
      toast.error("Erro ao deletar venda");
      console.error(error);
    }
  };

  const selectedPaymentMethod = watch("paymentMethod");

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciar Vendas</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <HomeIcon className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Vendas</CardTitle>
          <CardDescription>Edite ou delete suas vendas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sales && sales.length > 0 ? (
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
                  {sales.map((sale) => (
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
              Nenhuma venda registrada ainda.
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
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
            <AlertDialogTitle>Deletar Venda?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
