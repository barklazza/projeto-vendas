import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createSale, getSalesByUserId, updateSale, deleteSale, createBackup, getBackupsByUserId, deleteBackup, getAllUsers, getAllSales, getSalesByUserIdAdmin, updateSaleAdmin, deleteSaleAdmin } from "./db";

// Admin procedure - only for admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores podem acessar' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  sales: router({
    create: protectedProcedure
      .input(z.object({
        productCode: z.string().min(1, "Código do produto é obrigatório"),
        clientName: z.string().min(1, "Nome do cliente é obrigatório"),
        type: z.string().min(1, "Tipo é obrigatório"),
        value: z.string().transform(val => parseFloat(val)).pipe(z.number().positive("Valor deve ser positivo")),
        paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
        paymentDate: z.string().transform(val => new Date(val)),
      }))
      .mutation(async ({ ctx, input }) => {
        await createSale({
          userId: ctx.user.id,
          productCode: input.productCode,
          clientName: input.clientName,
          type: input.type,
          value: input.value.toString(),
          paymentMethod: input.paymentMethod,
          paymentDate: input.paymentDate,
        });
        return { success: true };
      }),
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const userSales = await getSalesByUserId(ctx.user.id);
        return userSales.map(sale => ({
          ...sale,
          value: typeof sale.value === 'string' ? parseFloat(sale.value) : sale.value,
        }));
      }),
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        const userSales = await getSalesByUserId(ctx.user.id);
        
        const totalBruto = userSales.reduce((sum, sale) => {
          const value = typeof sale.value === 'string' ? parseFloat(sale.value) : sale.value;
          return sum + value;
        }, 0);

        const totalLiquido = totalBruto * 0.3;
        const totalComissao = totalBruto * 0.7;

        const byPaymentMethod: Record<string, number> = {};
        userSales.forEach(sale => {
          const value = typeof sale.value === 'string' ? parseFloat(sale.value) : sale.value;
          byPaymentMethod[sale.paymentMethod] = (byPaymentMethod[sale.paymentMethod] || 0) + value;
        });

        return {
          totalBruto,
          totalLiquido,
          totalComissao,
          count: userSales.length,
          byPaymentMethod,
        };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        productCode: z.string().min(1),
        clientName: z.string().min(1),
        type: z.string().min(1),
        value: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()),
        paymentMethod: z.string().min(1),
        paymentDate: z.string().transform(val => new Date(val)),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateSale(input.id, ctx.user.id, {
          productCode: input.productCode,
          clientName: input.clientName,
          type: input.type,
          value: input.value.toString(),
          paymentMethod: input.paymentMethod,
          paymentDate: input.paymentDate,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await deleteSale(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  backups: router({
    create: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1),
        fileSize: z.number().optional(),
        salesCount: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createBackup({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileSize: input.fileSize,
          salesCount: input.salesCount,
        });
        return { success: true };
      }),
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const userBackups = await getBackupsByUserId(ctx.user.id);
        return userBackups;
      }),
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await deleteBackup(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  admin: router({
    users: adminProcedure.query(async () => {
      return await getAllUsers();
    }),
    allSales: adminProcedure.query(async () => {
      return await getAllSales();
    }),
    userSales: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getSalesByUserIdAdmin(input.userId);
      }),
    updateSale: adminProcedure
      .input(z.object({
        id: z.number(),
        productCode: z.string().min(1),
        clientName: z.string().min(1),
        type: z.string().min(1),
        value: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()),
        paymentMethod: z.string().min(1),
        paymentDate: z.string().transform(val => new Date(val)),
      }))
      .mutation(async ({ input }) => {
        await updateSaleAdmin(input.id, {
          productCode: input.productCode,
          clientName: input.clientName,
          type: input.type,
          value: input.value.toString(),
          paymentMethod: input.paymentMethod,
          paymentDate: input.paymentDate,
        });
        return { success: true };
      }),
    deleteSale: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSaleAdmin(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
