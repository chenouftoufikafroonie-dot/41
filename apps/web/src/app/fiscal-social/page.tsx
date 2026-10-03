'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Scale, Calculator, Calendar, DollarSign, Percent } from 'lucide-react';

export default function FiscalSocialPage() {
  const { data: deadlines } = trpc.getTaxDeadlines.useQuery();

  // Simulators state
  const [taxableProfit, setTaxableProfit] = useState(50000);
  const [grossSalary, setGrossSalary] = useState(4000);
  const [dividendGross, setDividendGross] = useState(15000);

  const { data: isCalc } = trpc.calculateIS.useQuery({ taxableProfit: Number(taxableProfit) });
  const { data: payrollCalc } = trpc.calculatePayroll.useQuery({ grossSalary: Number(grossSalary) });
  const { data: divCalc } = trpc.calculateDividends.useQuery({ grossAmount: Number(dividendGross) });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fiscalité & Rémunération du Président</h1>
        <p className="text-sm text-slate-500 mt-1">
          Échéancier fiscal, simulateur d'Impôt sur les Sociétés (IS), paie président (URSSAF) et distribution de dividendes.
        </p>
      </div>

      {/* Tax Deadlines Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          Calendrier des Obligation Fiscables & Sociales 2025
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deadlines?.map((dl) => (
            <div key={dl.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {dl.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {new Date(dl.dueDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900">{dl.title}</p>
              <p className="text-xs text-amber-700 font-medium">
                {dl.amount ? `Estimation : ${dl.amount.toLocaleString('fr-FR')} €` : 'À régulariser'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* IS Simulator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center border-b pb-2">
            <Calculator className="h-5 w-5 mr-2 text-indigo-600" />
            Simulateur Impôt Sociétés (IS)
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Bénéfice Imposable Estimé (€)</label>
            <input
              type="number"
              value={taxableProfit}
              onChange={(e) => setTaxableProfit(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
            />
          </div>
          {isCalc && (
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Tranche 15% (jusqu'à 42500€) :</span>
                <span className="font-bold text-slate-800">{isCalc.taxAmount15} €</span>
              </div>
              <div className="flex justify-between">
                <span>Tranche 25% (au-delà) :</span>
                <span className="font-bold text-slate-800">{isCalc.taxAmount25} €</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold text-indigo-900">
                <span>Total IS à payer :</span>
                <span>{isCalc.totalTax} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Payroll Simulator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center border-b pb-2">
            <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
            Simulateur Rémunération Président
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Salaire Brut Mensuel (€)</label>
            <input
              type="number"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
            />
          </div>
          {payrollCalc && (
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Charges Salariales (~22%) :</span>
                <span>{payrollCalc.employeeSocialCharges} €</span>
              </div>
              <div className="flex justify-between">
                <span>Charges Patronales URSSAF (~42%) :</span>
                <span>{payrollCalc.employerSocialCharges} €</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Net avant Prélèvement à la Source :</span>
                <span>{payrollCalc.netBeforeTax} €</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-slate-900">
                <span>Coût Total Entreprise :</span>
                <span>{payrollCalc.totalCompanyCost} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Dividend Simulator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center border-b pb-2">
            <Percent className="h-5 w-5 mr-2 text-purple-600" />
            Simulateur Dividendes Flat Tax (30%)
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Montant Brut Distribué (€)</label>
            <input
              type="number"
              value={dividendGross}
              onChange={(e) => setDividendGross(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
            />
          </div>
          {divCalc && (
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Impôt sur le Revenu (12,8%) :</span>
                <span>{divCalc.incomeTax128} €</span>
              </div>
              <div className="flex justify-between">
                <span>Prélèvements Sociaux (17,2%) :</span>
                <span>{divCalc.socialLevy172} €</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-purple-900 text-sm">
                <span>Dividende Net perçu :</span>
                <span>{divCalc.netDistributed} €</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
