import { describe, it, expect } from 'vitest';
import {
  calculateCorporateTax,
  calculatePresidentPayroll,
  calculateDividendPFU,
  generateFEC,
} from './accounting';

describe('French Accounting Engine Domain Tests', () => {
  it('calculates IS (Corporate Tax) correctly with 15% reduced rate up to 42500€', () => {
    const res1 = calculateCorporateTax(30000);
    expect(res1.taxAmount15).toBe(4500);
    expect(res1.taxAmount25).toBe(0);
    expect(res1.totalTax).toBe(4500);

    const res2 = calculateCorporateTax(100000);
    expect(res2.taxAmount15).toBe(6375); // 42500 * 0.15
    expect(res2.taxAmount25).toBe(14375); // (100000 - 42500) * 0.25
    expect(res2.totalTax).toBe(20750);
  });

  it('calculates President Payroll URSSAF simulation correctly', () => {
    const res = calculatePresidentPayroll(4000);
    expect(res.grossSalary).toBe(4000);
    expect(res.employeeSocialCharges).toBe(880); // 22%
    expect(res.employerSocialCharges).toBe(1680); // 42%
    expect(res.netBeforeTax).toBe(3120);
    expect(res.totalCompanyCost).toBe(5680);
  });

  it('calculates Dividend PFU (Flat Tax 30%) correctly', () => {
    const res = calculateDividendPFU(20000);
    expect(res.grossAmount).toBe(20000);
    expect(res.incomeTax128).toBe(2560); // 12.8%
    expect(res.socialLevy172).toBe(3440); // 17.2%
    expect(res.totalTax30).toBe(6000); // 30%
    expect(res.netDistributed).toBe(14000);
  });

  it('generates valid French FEC tab-separated string', () => {
    const fec = generateFEC([
      {
        journalCode: 'VT',
        journalLib: 'Journal des Ventes',
        ecritureNum: '00001',
        ecritureDate: new Date('2025-01-10'),
        compteNum: '411100',
        compteLib: 'Clients',
        pieceRef: 'F2025-001',
        pieceDate: new Date('2025-01-10'),
        ecritureLib: 'Facture Client ACME',
        debit: 1200,
        credit: 0,
        ecritureLet: 'A1',
        validDate: new Date('2025-01-10'),
      },
      {
        journalCode: 'VT',
        journalLib: 'Journal des Ventes',
        ecritureNum: '00001',
        ecritureDate: new Date('2025-01-10'),
        compteNum: '706000',
        compteLib: 'Prestations de services',
        pieceRef: 'F2025-001',
        pieceDate: new Date('2025-01-10'),
        ecritureLib: 'Facture Client ACME',
        debit: 0,
        credit: 1000,
        ecritureLet: '',
        validDate: new Date('2025-01-10'),
      },
    ]);

    expect(fec).toContain('JournalCode\tJournalLib\tEcritureNum');
    expect(fec).toContain('VT\tJournal des Ventes\t00001\t20250110\t411100\tClients\t\t\tF2025-001\t20250110\tFacture Client ACME\t1200,00\t0,00\tA1\t\t20250110\t\tEUR');
  });
});
