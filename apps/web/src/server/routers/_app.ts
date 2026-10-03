import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  calculateCorporateTax,
  calculatePresidentPayroll,
  calculateDividendPFU,
  generateFEC,
} from '@sasu-manager/shared';

export const appRouter = router({
  // Company & Profile
  getCompany: publicProcedure.query(async ({ ctx }) => {
    const company = await ctx.db.company.findFirst({
      include: {
        executives: true,
        shareholders: true,
        fiscalYears: true,
        settings: true,
      },
    });
    return company;
  }),

  updateCompany: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        siren: z.string(),
        siret: z.string(),
        apeCode: z.string(),
        vatNumber: z.string(),
        shareCapital: z.number(),
        address: z.string(),
        city: z.string(),
        postalCode: z.string(),
        bankIban: z.string().optional(),
        bankBic: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.update({
        where: { id: input.id },
        data: input,
      });
    }),

  // Dashboard Stats
  getDashboardStats: publicProcedure.query(async ({ ctx }) => {
    const company = await ctx.db.company.findFirst();
    if (!company) return null;

    const bankAccounts = await ctx.db.bankAccount.findMany({
      where: { companyId: company.id },
    });
    const totalCash = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

    const invoices = await ctx.db.invoice.findMany({
      where: { companyId: company.id },
    });
    const revenueYear = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((acc, i) => acc + i.amountHt, 0);

    const expenses = await ctx.db.expense.findMany({
      where: { companyId: company.id },
    });
    const expensesYear = expenses.reduce((acc, e) => acc + e.amountHt, 0);

    const netResultEst = revenueYear - expensesYear;

    const vatCollected = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((acc, i) => acc + i.amountVat, 0);

    const vatDeductible = expenses.reduce((acc, e) => acc + e.amountVat, 0);

    const upcomingDeadlines = await ctx.db.taxDeadline.findMany({
      where: { companyId: company.id, isCompleted: false },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    const unpaidInvoices = await ctx.db.invoice.findMany({
      where: { companyId: company.id, status: { in: ['SENT', 'OVERDUE'] } },
      include: { client: true },
    });

    return {
      totalCash,
      revenueYear,
      expensesYear,
      netResultEst,
      vatCollected,
      vatDeductible,
      vatPayableEst: Math.max(0, vatCollected - vatDeductible),
      upcomingDeadlines,
      unpaidInvoices,
    };
  }),

  // Clients & Suppliers
  getClients: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.client.findMany({
      include: { invoices: true, quotes: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  createClient: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        siren: z.string().optional(),
        vatNumber: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().min(1),
        paymentTerms: z.number().default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst();
      if (!company) throw new Error('Aucune société configurée.');

      return ctx.db.client.create({
        data: {
          ...input,
          companyId: company.id,
        },
      });
    }),

  getSuppliers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.supplier.findMany({
      include: { expenses: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  createSupplier: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        siren: z.string().optional(),
        vatNumber: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst();
      if (!company) throw new Error('Aucune société configurée.');

      return ctx.db.supplier.create({
        data: {
          ...input,
          companyId: company.id,
        },
      });
    }),

  // Invoices & Quotes
  getInvoices: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.invoice.findMany({
      include: { client: true, lines: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  createInvoice: publicProcedure
    .input(
      z.object({
        clientId: z.string(),
        number: z.string(),
        date: z.string(),
        dueDate: z.string(),
        notes: z.string().optional(),
        lines: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            vatRate: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst();
      if (!company) throw new Error('Société manquante.');

      let amountHt = 0;
      let amountVat = 0;

      const linesData = input.lines.map((l) => {
        const ht = l.quantity * l.unitPrice;
        const vat = ht * (l.vatRate / 100);
        const ttc = ht + vat;
        amountHt += ht;
        amountVat += vat;
        return {
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          vatRate: l.vatRate,
          amountHt: ht,
          amountVat: vat,
          amountTtc: ttc,
        };
      });

      const amountTtc = amountHt + amountVat;

      const invoice = await ctx.db.invoice.create({
        data: {
          companyId: company.id,
          clientId: input.clientId,
          number: input.number,
          date: new Date(input.date),
          dueDate: new Date(input.dueDate),
          notes: input.notes,
          amountHt,
          amountVat,
          amountTtc,
          status: 'SENT',
          lines: {
            create: linesData,
          },
        },
      });

      // Automatically generate Accounting Entry in VT (Journal des Ventes)
      const journalVT = await ctx.db.journal.findFirst({
        where: { companyId: company.id, code: 'VT' },
      });

      if (journalVT) {
        await ctx.db.accountingEntry.create({
          data: {
            companyId: company.id,
            journalId: journalVT.id,
            date: new Date(input.date),
            pieceRef: input.number,
            label: `Facture ${input.number}`,
            isLocked: true,
            lines: {
              create: [
                {
                  accountNumber: '411100',
                  accountLabel: 'Clients',
                  debit: amountTtc,
                  credit: 0,
                },
                {
                  accountNumber: '706000',
                  accountLabel: 'Prestations de services',
                  debit: 0,
                  credit: amountHt,
                },
                {
                  accountNumber: '445710',
                  accountLabel: 'TVA collectée 20%',
                  debit: 0,
                  credit: amountVat,
                },
              ],
            },
          },
        });
      }

      return invoice;
    }),

  markInvoicePaid: publicProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        paymentDate: z.string(),
        reference: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      });
      if (!invoice) throw new Error('Facture introuvable.');

      await ctx.db.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amountTtc,
          date: new Date(input.paymentDate),
          reference: input.reference || `VIR-${invoice.number}`,
        },
      });

      const updated = await ctx.db.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' },
      });

      // Auto-generate Bank accounting entry for payment
      const journalBQ = await ctx.db.journal.findFirst({
        where: { companyId: invoice.companyId, code: 'BQ' },
      });

      if (journalBQ) {
        await ctx.db.accountingEntry.create({
          data: {
            companyId: invoice.companyId,
            journalId: journalBQ.id,
            date: new Date(input.paymentDate),
            pieceRef: input.reference || `VIR-${invoice.number}`,
            label: `Règlement Facture ${invoice.number}`,
            isLocked: true,
            lines: {
              create: [
                {
                  accountNumber: '512000',
                  accountLabel: 'Banque Principal',
                  debit: invoice.amountTtc,
                  credit: 0,
                },
                {
                  accountNumber: '411100',
                  accountLabel: 'Clients',
                  debit: 0,
                  credit: invoice.amountTtc,
                },
              ],
            },
          },
        });
      }

      return updated;
    }),

  // Expenses
  getExpenses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.expense.findMany({
      include: { supplier: true, receipts: true },
      orderBy: { date: 'desc' },
    });
  }),

  createExpense: publicProcedure
    .input(
      z.object({
        supplierId: z.string().optional(),
        description: z.string().min(1),
        category: z.string(),
        date: z.string(),
        amountHt: z.number(),
        vatRate: z.number().default(20.0),
        isNoteDeFrais: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst();
      if (!company) throw new Error('Société introuvable.');

      const amountVat = input.amountHt * (input.vatRate / 100);
      const amountTtc = input.amountHt + amountVat;

      const expense = await ctx.db.expense.create({
        data: {
          companyId: company.id,
          supplierId: input.supplierId,
          description: input.description,
          category: input.category,
          date: new Date(input.date),
          amountHt: input.amountHt,
          amountVat,
          amountTtc,
          vatRate: input.vatRate,
          isNoteDeFrais: input.isNoteDeFrais,
          status: 'APPROVED',
        },
      });

      // Auto-generate HA (Journal des Achats) entry
      const journalHA = await ctx.db.journal.findFirst({
        where: { companyId: company.id, code: 'HA' },
      });

      if (journalHA) {
        await ctx.db.accountingEntry.create({
          data: {
            companyId: company.id,
            journalId: journalHA.id,
            date: new Date(input.date),
            pieceRef: `EXP-${expense.id.substring(0, 8)}`,
            label: `Dépense: ${input.description}`,
            isLocked: true,
            lines: {
              create: [
                {
                  accountNumber: '625600',
                  accountLabel: 'Frais divers / Dépense',
                  debit: input.amountHt,
                  credit: 0,
                },
                {
                  accountNumber: '445660',
                  accountLabel: 'TVA déductible',
                  debit: amountVat,
                  credit: 0,
                },
                {
                  accountNumber: '401100',
                  accountLabel: 'Fournisseurs',
                  debit: 0,
                  credit: amountTtc,
                },
              ],
            },
          },
        });
      }

      return expense;
    }),

  // Banking & Reconciliation
  getBankAccounts: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.bankAccount.findMany({
      include: { transactions: true },
    });
  }),

  getBankTransactions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.bankTransaction.findMany({
      include: { reconciliations: true },
      orderBy: { date: 'desc' },
    });
  }),

  matchTransaction: publicProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bankTransaction.update({
        where: { id: input.transactionId },
        data: { status: 'MATCHED' },
      });
    }),

  // Accounting Ledger & FEC
  getAccountingEntries: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.accountingEntry.findMany({
      include: { journal: true, lines: true },
      orderBy: { date: 'desc' },
    });
  }),

  getTrialBalance: publicProcedure.query(async ({ ctx }) => {
    const lines = await ctx.db.accountingLine.findMany({
      include: { entry: true },
    });

    const balanceMap: Record<
      string,
      { accountNumber: string; accountLabel: string; debit: number; credit: number; balance: number }
    > = {};

    lines.forEach((l) => {
      if (!balanceMap[l.accountNumber]) {
        balanceMap[l.accountNumber] = {
          accountNumber: l.accountNumber,
          accountLabel: l.accountLabel,
          debit: 0,
          credit: 0,
          balance: 0,
        };
      }
      balanceMap[l.accountNumber].debit += l.debit;
      balanceMap[l.accountNumber].credit += l.credit;
      balanceMap[l.accountNumber].balance =
        balanceMap[l.accountNumber].debit - balanceMap[l.accountNumber].credit;
    });

    return Object.values(balanceMap).sort((a, b) => a.accountNumber.localeCompare(b.accountNumber));
  }),

  exportFEC: publicProcedure.query(async ({ ctx }) => {
    const entries = await ctx.db.accountingEntry.findMany({
      include: { journal: true, lines: true },
      orderBy: { date: 'asc' },
    });

    const fecRows: Parameters<typeof generateFEC>[0] = [];

    entries.forEach((entry, idx) => {
      entry.lines.forEach((line) => {
        fecRows.push({
          journalCode: entry.journal.code,
          journalLib: entry.journal.name,
          ecritureNum: String(idx + 1).padStart(5, '0'),
          ecritureDate: entry.date,
          compteNum: line.accountNumber,
          compteLib: line.accountLabel,
          pieceRef: entry.pieceRef,
          pieceDate: entry.date,
          ecritureLib: entry.label,
          debit: line.debit,
          credit: line.credit,
          ecritureLet: line.lettre || '',
          validDate: entry.createdAt,
        });
      });
    });

    return generateFEC(fecRows);
  }),

  // Tax & Social Calculators
  calculateIS: publicProcedure
    .input(z.object({ taxableProfit: z.number() }))
    .query(({ input }) => {
      return calculateCorporateTax(input.taxableProfit);
    }),

  calculatePayroll: publicProcedure
    .input(z.object({ grossSalary: z.number() }))
    .query(({ input }) => {
      return calculatePresidentPayroll(input.grossSalary);
    }),

  calculateDividends: publicProcedure
    .input(z.object({ grossAmount: z.number() }))
    .query(({ input }) => {
      return calculateDividendPFU(input.grossAmount);
    }),

  getTaxDeadlines: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.taxDeadline.findMany({
      orderBy: { dueDate: 'asc' },
    });
  }),

  getAuditLogs: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }),
});

export type AppRouter = typeof appRouter;
