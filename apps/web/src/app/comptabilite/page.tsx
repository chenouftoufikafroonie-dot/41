'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Calculator, Download, FileSpreadsheet, Lock } from 'lucide-react';

export default function AccountingPage() {
  const { data: entries } = trpc.getAccountingEntries.useQuery();
  const { data: balance } = trpc.getTrialBalance.useQuery();
  const { data: fecData } = trpc.exportFEC.useQuery();

  const [activeTab, setActiveTab] = useState<'journal' | 'balance'>('journal');

  const downloadFEC = () => {
    if (!fecData) return;
    const blob = new Blob([fecData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FEC_901234567_20251231.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comptabilité Générale & Export FEC</h1>
          <p className="text-sm text-slate-500 mt-1">
            Conforme au Plan Comptable Général (PCG) français et aux normes DGFiP (Art. A47 A-1).
          </p>
        </div>
        <button
          onClick={downloadFEC}
          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger l'Export FEC (.txt)
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('journal')}
            className={`pb-4 text-sm font-semibold border-b-2 ${
              activeTab === 'journal'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Journaux Comptables ({entries?.length || 0} écriture(s))
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`pb-4 text-sm font-semibold border-b-2 ${
              activeTab === 'balance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Balance Générale 6 Colonnes ({balance?.length || 0} compte(s))
          </button>
        </nav>
      </div>

      {activeTab === 'journal' ? (
        <div className="space-y-4">
          {entries?.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded">
                    Journal {entry.journal.code}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{entry.label}</span>
                  <span className="text-xs text-slate-400 font-mono">Réf: {entry.pieceRef}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verrouillé le {new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 text-left border-b">
                    <th className="py-1">N° Compte PCG</th>
                    <th className="py-1">Libellé Compte</th>
                    <th className="py-1 text-right">Débit (€)</th>
                    <th className="py-1 text-right">Crédit (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="text-slate-700">
                      <td className="py-1.5 font-bold text-slate-900">{line.accountNumber}</td>
                      <td className="py-1.5 font-sans">{line.accountLabel}</td>
                      <td className="py-1.5 text-right">{line.debit > 0 ? line.debit.toLocaleString('fr-FR') : '-'}</td>
                      <td className="py-1.5 text-right">{line.credit > 0 ? line.credit.toLocaleString('fr-FR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
              <tr>
                <th className="px-6 py-3">Compte PCG</th>
                <th className="px-6 py-3">Intitulé du Compte</th>
                <th className="px-6 py-3 text-right">Total Débit</th>
                <th className="px-6 py-3 text-right">Total Crédit</th>
                <th className="px-6 py-3 text-right">Solde Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-xs">
              {balance?.map((row) => (
                <tr key={row.accountNumber} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-bold text-indigo-600">{row.accountNumber}</td>
                  <td className="px-6 py-3 font-sans font-medium text-slate-900">{row.accountLabel}</td>
                  <td className="px-6 py-3 text-right">{row.debit.toLocaleString('fr-FR')} €</td>
                  <td className="px-6 py-3 text-right">{row.credit.toLocaleString('fr-FR')} €</td>
                  <td
                    className={`px-6 py-3 text-right font-bold ${
                      row.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {row.balance.toLocaleString('fr-FR')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
