// PCG (Plan Comptable Général) French Chart of Accounts definitions & rules

export interface PCGAccount {
  code: string;
  label: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
}

export const PCG_PLAN: Record<string, PCGAccount> = {
  // Class 1: Capital accounts
  '101000': { code: '101000', label: 'Capital social', type: 'EQUITY' },
  '110000': { code: '110000', label: 'Report à nouveau (créditeur)', type: 'EQUITY' },
  '120000': { code: '120000', label: 'Résultat de l\'exercice (bénéfice)', type: 'EQUITY' },
  '129000': { code: '129000', label: 'Résultat de l\'exercice (perte)', type: 'EQUITY' },
  '164000': { code: '164000', label: 'Emprunts auprès des établissements de crédit', type: 'LIABILITY' },
  '455100': { code: '455100', label: 'Compte courant d\'associé', type: 'LIABILITY' },

  // Class 2: Fixed assets
  '218300': { code: '218300', label: 'Matériel informatique', type: 'ASSET' },
  '281830': { code: '281830', label: 'Amortissement matériel informatique', type: 'ASSET' },

  // Class 4: Third party accounts
  '401100': { code: '401100', label: 'Fournisseurs', type: 'LIABILITY' },
  '411100': { code: '411100', label: 'Clients', type: 'ASSET' },
  '421000': { code: '421000', label: 'Personnel - Rémunérations dues', type: 'LIABILITY' },
  '431000': { code: '431000', label: 'Sécurité sociale et URSSAF', type: 'LIABILITY' },
  '445510': { code: '445510', label: 'TVA à payer', type: 'LIABILITY' },
  '445660': { code: '445660', label: 'TVA déductible sur autres biens et services', type: 'ASSET' },
  '445710': { code: '445710', label: 'TVA collectée 20%', type: 'LIABILITY' },
  '445670': { code: '445670', label: 'Crédit de TVA à reporter', type: 'ASSET' },
  '444000': { code: '444000', label: 'Impôt sur les sociétés (IS)', type: 'LIABILITY' },

  // Class 5: Financial accounts
  '512000': { code: '512000', label: 'Banque Qonto / SG / Shine', type: 'ASSET' },
  '530000': { code: '530000', label: 'Caisse', type: 'ASSET' },

  // Class 6: Expense accounts
  '606400': { code: '606400', label: 'Fournitures administratives', type: 'EXPENSE' },
  '613200': { code: '613200', label: 'Locations immobilières (Coworking / Bureaux)', type: 'EXPENSE' },
  '618500': { code: '618500', label: 'Frais de colloques et séminaires', type: 'EXPENSE' },
  '622600': { code: '622600', label: 'Honoraires comptables et juridiques', type: 'EXPENSE' },
  '625100': { code: '625100', label: 'Voyages et déplacements', type: 'EXPENSE' },
  '625600': { code: '625600', label: 'Missions et réceptions / Restaurants', type: 'EXPENSE' },
  '626200': { code: '626200', label: 'Frais de télécommunications / Internet', type: 'EXPENSE' },
  '627000': { code: '627000', label: 'Services bancaires et assimilés', type: 'EXPENSE' },
  '641100': { code: '641100', label: 'Salaires et traitements (Président)', type: 'EXPENSE' },
  '645100': { code: '645100', label: 'Cotisations URSSAF et Sécurité Sociale', type: 'EXPENSE' },
  '681100': { code: '681100', label: 'Dotations aux amortissements', type: 'EXPENSE' },
  '695000': { code: '695000', label: 'Impôt sur les sociétés (IS)', type: 'EXPENSE' },

  // Class 7: Revenue accounts
  '706000': { code: '706000', label: 'Prestations de services / Conseil', type: 'REVENUE' },
  '708000': { code: '708000', label: 'Produits annexes', type: 'REVENUE' },
};

/**
 * Generate French FEC (Fichier des Écritures Comptables) string conforming to DGFiP standard Art. A47 A-1
 */
export function generateFEC(entries: Array<{
  journalCode: string;
  journalLib: string;
  ecritureNum: string;
  ecritureDate: Date;
  compteNum: string;
  compteLib: string;
  compAuxNum?: string;
  compAuxLib?: string;
  pieceRef: string;
  pieceDate: Date;
  ecritureLib: string;
  debit: number;
  credit: number;
  ecritureLet: string;
  dateLet?: Date;
  validDate: Date;
  montantdevise?: number;
  iddevise?: string;
}>): string {
  const headers = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcritureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise',
  ].join('\t');

  const rows = entries.map((e) => {
    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}${mm}${dd}`;
    };

    const formatAmount = (val: number) => val.toFixed(2).replace('.', ',');

    return [
      e.journalCode,
      e.journalLib,
      e.ecritureNum,
      formatDate(e.ecritureDate),
      e.compteNum,
      e.compteLib,
      e.compAuxNum || '',
      e.compAuxLib || '',
      e.pieceRef,
      formatDate(e.pieceDate),
      e.ecritureLib,
      formatAmount(e.debit),
      formatAmount(e.credit),
      e.ecritureLet || '',
      e.dateLet ? formatDate(e.dateLet) : '',
      formatDate(e.validDate),
      e.montantdevise ? formatAmount(e.montantdevise) : '',
      e.iddevise || 'EUR',
    ].join('\t');
  });

  return [headers, ...rows].join('\r\n');
}

/**
 * French Corporate Tax (IS - Impôt sur les Sociétés) calculation formula
 * Reduced rate 15% up to 42,500 €, normal rate 25% above.
 */
export function calculateCorporateTax(taxableProfit: number): {
  taxableProfit: number;
  taxAmount15: number;
  taxAmount25: number;
  totalTax: number;
  effectiveRate: number;
} {
  if (taxableProfit <= 0) {
    return { taxableProfit: 0, taxAmount15: 0, taxAmount25: 0, totalTax: 0, effectiveRate: 0 };
  }

  const threshold15 = 42500;
  let tax15 = 0;
  let tax25 = 0;

  if (taxableProfit <= threshold15) {
    tax15 = taxableProfit * 0.15;
  } else {
    tax15 = threshold15 * 0.15;
    tax25 = (taxableProfit - threshold15) * 0.25;
  }

  const totalTax = tax15 + tax25;
  const effectiveRate = (totalTax / taxableProfit) * 100;

  return {
    taxableProfit,
    taxAmount15: Math.round(tax15 * 100) / 100,
    taxAmount25: Math.round(tax25 * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

/**
 * President Payroll & URSSAF simulation for SASU (Assimilé Salarié)
 * Average URSSAF social charges: ~52-60% of gross salary for employer + employee combined.
 */
export function calculatePresidentPayroll(grossSalary: number): {
  grossSalary: number;
  employeeSocialCharges: number;
  employerSocialCharges: number;
  totalSocialCharges: number;
  netBeforeTax: number;
  totalCompanyCost: number;
} {
  if (grossSalary <= 0) {
    return {
      grossSalary: 0,
      employeeSocialCharges: 0,
      employerSocialCharges: 0,
      totalSocialCharges: 0,
      netBeforeTax: 0,
      totalCompanyCost: 0,
    };
  }

  const employeeRate = 0.22; // ~22%
  const employerRate = 0.42; // ~42%

  const employeeSocialCharges = Math.round(grossSalary * employeeRate * 100) / 100;
  const employerSocialCharges = Math.round(grossSalary * employerRate * 100) / 100;
  const netBeforeTax = Math.round((grossSalary - employeeSocialCharges) * 100) / 100;
  const totalCompanyCost = Math.round((grossSalary + employerSocialCharges) * 100) / 100;
  const totalSocialCharges = Math.round((employeeSocialCharges + employerSocialCharges) * 100) / 100;

  return {
    grossSalary,
    employeeSocialCharges,
    employerSocialCharges,
    totalSocialCharges,
    netBeforeTax,
    totalCompanyCost,
  };
}

/**
 * French Dividend Flat Tax (PFU - Prélèvement Forfaitaire Unique) calculation
 * 30% Flat Tax = 12.8% Income Tax (IR) + 17.2% Social Levies (Prélèvements Sociaux)
 */
export function calculateDividendPFU(grossAmount: number): {
  grossAmount: number;
  incomeTax128: number;
  socialLevy172: number;
  totalTax30: number;
  netDistributed: number;
} {
  if (grossAmount <= 0) {
    return { grossAmount: 0, incomeTax128: 0, socialLevy172: 0, totalTax30: 0, netDistributed: 0 };
  }

  const incomeTax128 = Math.round(grossAmount * 0.128 * 100) / 100;
  const socialLevy172 = Math.round(grossAmount * 0.172 * 100) / 100;
  const totalTax30 = Math.round((incomeTax128 + socialLevy172) * 100) / 100;
  const netDistributed = Math.round((grossAmount - totalTax30) * 100) / 100;

  return {
    grossAmount,
    incomeTax128,
    socialLevy172,
    totalTax30,
    netDistributed,
  };
}
