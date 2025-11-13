import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Home } from "lucide-react";

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

export default function SalesForm() {
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<SaleFormData>({
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const createSaleMutation = trpc.sales.create.useMutation();
  const utils = trpc.useUtils();

  const onSubmit = async (data: SaleFormData) => {
    try {
      await createSaleMutation.mutateAsync({
        productCode: data.productCode,
        clientName: data.clientName,
        type: data.type,
        value: data.value,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
      });

      toast.success("Venda registrada com sucesso!");
      reset();
      utils.sales.list.invalidate();
      utils.sales.stats.invalidate();
    } catch (error) {
      toast.error("Erro ao registrar venda");
      console.error(error);
    }
  };

  const selectedPaymentMethod = watch("paymentMethod");

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Registrar Nova Venda</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nova Venda</CardTitle>
          <CardDescription>Preencha os dados da venda de joias</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código do Produto */}
              <div className="space-y-2">
                <Label htmlFor="productCode">Código do Produto *</Label>
                <Input
                  id="productCode"
                  placeholder="Ex: JOI-001"
                  {...register("productCode", { required: "Código do produto é obrigatório" })}
                  className={errors.productCode ? "border-red-500" : ""}
                />
                {errors.productCode && (
                  <p className="text-sm text-red-500">{errors.productCode.message}</p>
                )}
              </div>

              {/* Nome do Cliente */}
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  placeholder="Ex: João Silva"
                  {...register("clientName", { required: "Nome do cliente é obrigatório" })}
                  className={errors.clientName ? "border-red-500" : ""}
                />
                {errors.clientName && (
                  <p className="text-sm text-red-500">{errors.clientName.message}</p>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select onValueChange={(value) => setValue("type", value)}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {jewelryTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  {...register("value", { 
                    required: "Valor é obrigatório",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Valor inválido"
                    }
                  })}
                  className={errors.value ? "border-red-500" : ""}
                />
                {errors.value && (
                  <p className="text-sm text-red-500">{errors.value.message}</p>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                <Select onValueChange={(value) => setValue("paymentMethod", value)}>
                  <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Data do Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Data do Pagamento *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  {...register("paymentDate", { required: "Data do pagamento é obrigatória" })}
                  className={errors.paymentDate ? "border-red-500" : ""}
                />
                {errors.paymentDate && (
                  <p className="text-sm text-red-500">{errors.paymentDate.message}</p>
                )}
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={createSaleMutation.isPending}
                className="flex-1"
              >
                {createSaleMutation.isPending ? "Registrando..." : "Registrar Venda"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => reset()}
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}