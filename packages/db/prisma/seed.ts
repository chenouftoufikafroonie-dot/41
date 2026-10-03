import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SASU Manager database...');

  // Clear existing records for clean idempotent seed
  await prisma.auditLog.deleteMany();
  await prisma.reconciliation.deleteMany();
  await prisma.bankTransaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.client.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.accountingLine.deleteMany();
  await prisma.accountingEntry.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.taxDeadline.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.dividend.deleteMany();
  await prisma.legalDocument.deleteMany();
  await prisma.executive.deleteMany();
  await prisma.shareholder.deleteMany();
  await prisma.fiscalYear.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Organization & User
  const org = await prisma.organization.create({
    data: {
      name: 'Tech SASU Holding',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'president@techsasu.fr',
      name: 'Alexandre Dupont',
      role: 'PRESIDENT',
      organizationId: org.id,
      twoFactorAuth: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'expert@cabinet-comptable.fr',
      name: 'Cabinet Audit & Conseils SAS',
      role: 'EXPERT_ACCOUNTANT',
      organizationId: org.id,
    },
  });

  // 2. Company
  const company = await prisma.company.create({
    data: {
      organizationId: org.id,
      name: 'TechConsult SASU',
      siren: '901234567',
      siret: '90123456700012',
      apeCode: '6202A',
      vatNumber: 'FR12901234567',
      shareCapital: 1000.0,
      legalForm: 'SASU',
      address: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
      fiscalRegime: 'IS',
      vatRegime: 'REAL_NORMAL',
      fiscalYearEndMonth: 12,
      bankIban: 'FR7630001007941234567890185',
      bankBic: 'QONTFR21XXX',
    },
  });

  // 3. Fiscal Year
  await prisma.fiscalYear.create({
    data: {
      companyId: company.id,
      year: 2025,
      startDate: new Date('2025-01-01T00:00:00Z'),
      endDate: new Date('2025-12-31T23:59:59Z'),
      isClosed: false,
    },
  });

  // 4. Executive & Shareholder
  await prisma.executive.create({
    data: {
      companyId: company.id,
      firstName: 'Alexandre',
      lastName: 'Dupont',
      title: 'Président',
      email: 'alexandre@techsasu.fr',
      phone: '+33612345678',
      startDate: new Date('2024-01-01T00:00:00Z'),
      isSalariedAssimilated: true,
    },
  });

  await prisma.shareholder.create({
    data: {
      companyId: company.id,
      name: 'Alexandre Dupont',
      sharesCount: 1000,
      percentage: 100.0,
    },
  });

  // 5. Clients & Suppliers
  const clientACME = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'ACME Corp France',
      siren: '123456789',
      vatNumber: 'FR99123456789',
      email: 'comptabilite@acme.fr',
      address: '10 Avenue des Champs-Élysées, 75008 Paris',
      paymentTerms: 30,
    },
  });

  const clientGlobalTech = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Global Tech Solutions',
      siren: '987654321',
      vatNumber: 'FR88987654321',
      email: 'billing@globaltech.io',
      address: '42 Boulevard Haussmann, 75009 Paris',
      paymentTerms: 30,
    },
  });

  const supplierAWS = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'Amazon Web Services EMEA',
      vatNumber: 'LU30140865',
      email: 'aws-receivables@amazon.com',
      address: '38 Avenue John F. Kennedy, L-1855 Luxembourg',
    },
  });

  const supplierCoworking = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'WeWork France',
      siren: '824123987',
      vatNumber: 'FR55824123987',
      address: '33 Rue La Fayette, 75009 Paris',
    },
  });

  // 6. Bank Account & Transactions
  const bankAccount = await prisma.bankAccount.create({
    data: {
      companyId: company.id,
      name: 'Compte Pro Qonto',
      bankName: 'Qonto Bank',
      iban: 'FR7630001007941234567890185',
      bic: 'QONTFR21XXX',
      balance: 38450.0,
    },
  });

  await prisma.bankTransaction.createMany({
    data: [
      {
        bankAccountId: bankAccount.id,
        date: new Date('2025-01-15T10:00:00Z'),
        label: 'Virement ACME Corp - Facture F2025-001',
        amount: 6000.0,
        status: 'MATCHED',
        category: 'VENTES',
      },
      {
        bankAccountId: bankAccount.id,
        date: new Date('2025-01-20T14:30:00Z'),
        label: 'Prélèvement AWS EMEA',
        amount: -240.0,
        status: 'MATCHED',
        category: 'HERBERGEMENT',
      },
      {
        bankAccountId: bankAccount.id,
        date: new Date('2025-01-28T09:15:00Z'),
        label: 'Abonnement WeWork',
        amount: -450.0,
        status: 'MATCHED',
        category: 'LOYER',
      },
      {
        bankAccountId: bankAccount.id,
        date: new Date('2025-02-05T11:00:00Z'),
        label: 'Virement Global Tech Solutions',
        amount: 9600.0,
        status: 'UNMATCHED',
        category: 'VENTES',
      },
    ],
  });

  // 7. Invoices & Quotes
  const invoice1 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientACME.id,
      number: 'F2025-001',
      date: new Date('2025-01-05T00:00:00Z'),
      dueDate: new Date('2025-02-04T00:00:00Z'),
      amountHt: 5000.0,
      amountVat: 1000.0,
      amountTtc: 6000.0,
      status: 'PAID',
      notes: 'Prestation de conseil en architecture Cloud - Janvier 2025',
      lines: {
        create: [
          {
            description: 'Conseil & Expertises IT (5 jours)',
            quantity: 5,
            unitPrice: 1000.0,
            vatRate: 20.0,
            amountHt: 5000.0,
            amountVat: 1000.0,
            amountTtc: 6000.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 6000.0,
      date: new Date('2025-01-15T00:00:00Z'),
      paymentMethod: 'TRANSFER',
      reference: 'VIR-ACME-8912',
    },
  });

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientGlobalTech.id,
      number: 'F2025-002',
      date: new Date('2025-02-01T00:00:00Z'),
      dueDate: new Date('2025-03-03T00:00:00Z'),
      amountHt: 8000.0,
      amountVat: 1600.0,
      amountTtc: 9600.0,
      status: 'SENT',
      notes: 'Développement Full-Stack SaaS MVP - Février 2025',
      lines: {
        create: [
          {
            description: 'Sprint Développement Web (8 jours)',
            quantity: 8,
            unitPrice: 1000.0,
            vatRate: 20.0,
            amountHt: 8000.0,
            amountVat: 1600.0,
            amountTtc: 9600.0,
          },
        ],
      },
    },
  });

  await prisma.quote.create({
    data: {
      companyId: company.id,
      clientId: clientACME.id,
      number: 'DEV2025-001',
      date: new Date('2025-02-10T00:00:00Z'),
      expiryDate: new Date('2025-03-10T00:00:00Z'),
      amountHt: 12000.0,
      amountVat: 2400.0,
      amountTtc: 14400.0,
      status: 'SENT',
    },
  });

  // 8. Expenses
  await prisma.expense.create({
    data: {
      companyId: company.id,
      supplierId: supplierAWS.id,
      description: 'Hébergement Infras Cloud AWS',
      category: 'SOFTWARE',
      date: new Date('2025-01-18T00:00:00Z'),
      amountHt: 200.0,
      amountVat: 40.0,
      amountTtc: 240.0,
      vatRate: 20.0,
      status: 'APPROVED',
    },
  });

  await prisma.expense.create({
    data: {
      companyId: company.id,
      supplierId: supplierCoworking.id,
      description: 'Location bureau flex WeWork Paris',
      category: 'TRAVEL',
      date: new Date('2025-01-25T00:00:00Z'),
      amountHt: 375.0,
      amountVat: 75.0,
      amountTtc: 450.0,
      vatRate: 20.0,
      status: 'APPROVED',
    },
  });

  // 9. Accounting Journals & Entries
  const journalVT = await prisma.journal.create({
    data: { companyId: company.id, code: 'VT', name: 'Journal des Ventes' },
  });
  await prisma.journal.create({
    data: { companyId: company.id, code: 'HA', name: 'Journal des Achats' },
  });
  const journalBQ = await prisma.journal.create({
    data: { companyId: company.id, code: 'BQ', name: 'Journal de Banque' },
  });
  await prisma.journal.create({
    data: { companyId: company.id, code: 'OD', name: 'Opérations Diverses' },
  });
  await prisma.journal.create({
    data: { companyId: company.id, code: 'PA', name: 'Journal de Paie' },
  });

  // Sample sale accounting entry
  await prisma.accountingEntry.create({
    data: {
      companyId: company.id,
      journalId: journalVT.id,
      date: new Date('2025-01-05T00:00:00Z'),
      pieceRef: 'F2025-001',
      label: 'Facture F2025-001 - ACME Corp',
      isLocked: true,
      lines: {
        create: [
          { accountNumber: '411100', accountLabel: 'Clients', debit: 6000.0, credit: 0.0, lettre: 'A1' },
          { accountNumber: '706000', accountLabel: 'Prestations de services', debit: 0.0, credit: 5000.0 },
          { accountNumber: '445710', accountLabel: 'TVA collectée 20%', debit: 0.0, credit: 1000.0 },
        ],
      },
    },
  });

  // Sample payment accounting entry
  await prisma.accountingEntry.create({
    data: {
      companyId: company.id,
      journalId: journalBQ.id,
      date: new Date('2025-01-15T00:00:00Z'),
      pieceRef: 'VIR-ACME-8912',
      label: 'Règlement F2025-001 - ACME Corp',
      isLocked: true,
      lines: {
        create: [
          { accountNumber: '512000', accountLabel: 'Banque Qonto', debit: 6000.0, credit: 0.0 },
          { accountNumber: '411100', accountLabel: 'Clients', debit: 0.0, credit: 6000.0, lettre: 'A1' },
        ],
      },
    },
  });

  // 10. Tax Deadlines
  await prisma.taxDeadline.createMany({
    data: [
      {
        companyId: company.id,
        title: 'Déclaration TVA CA3 - Janvier 2025',
        category: 'TVA',
        dueDate: new Date('2025-02-21T00:00:00Z'),
        amount: 885.0,
        isCompleted: true,
      },
      {
        companyId: company.id,
        title: 'Acompte Impôt sur les Sociétés (IS) N°1',
        category: 'IS',
        dueDate: new Date('2025-03-15T00:00:00Z'),
        amount: 1500.0,
        isCompleted: false,
      },
      {
        companyId: company.id,
        title: 'Déclaration CFE (Cotisation Foncière des Entreprises)',
        category: 'CFE',
        dueDate: new Date('2025-12-15T00:00:00Z'),
        amount: 350.0,
        isCompleted: false,
      },
    ],
  });

  // 11. Payroll & Dividends
  const payroll1 = await prisma.payroll.create({
    data: {
      companyId: company.id,
      month: 1,
      year: 2025,
      grossSalary: 3500.0,
      netSalary: 2730.0,
      socialCharges: 1820.0,
      totalCost: 5320.0,
    },
  });

  await prisma.payslip.create({
    data: {
      payrollId: payroll1.id,
      executiveName: 'Alexandre Dupont',
      period: 'Janvier 2025',
      grossSalary: 3500.0,
      netImposable: 2800.0,
      netPayable: 2730.0,
      employerContributions: 1400.0,
      employeeContributions: 420.0,
    },
  });

  await prisma.dividend.create({
    data: {
      companyId: company.id,
      fiscalYear: 2024,
      grossAmount: 15000.0,
      pfuRate: 30.0,
      incomeTaxWithheld: 1920.0,
      socialLevyWithheld: 2580.0,
      netDistributed: 10500.0,
      decisionDate: new Date('2025-01-10T00:00:00Z'),
      paymentDate: new Date('2025-01-12T00:00:00Z'),
    },
  });

  // 12. Legal Documents
  await prisma.legalDocument.createMany({
    data: [
      {
        companyId: company.id,
        title: 'Statuts Constitutifs TechConsult SASU',
        type: 'STATUTES',
        content: 'Statuts de la SASU TechConsult enregistrés au greffe du tribunal de commerce de Paris.',
      },
      {
        companyId: company.id,
        title: 'Procès-Verbal d\'AG - Approbation des comptes 2024',
        type: 'AG_MINUTES',
        content: 'PV d\'assemblée générale ordinaire statuant sur la distribution des dividendes.',
      },
    ],
  });

  // 13. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'Company',
      entityId: company.id,
      details: 'Base de données initialisée avec le jeu de démonstration SASU.',
    },
  });

  console.log('✅ SASU Manager database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
