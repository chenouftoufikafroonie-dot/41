'use client';

import { trpc } from '@/lib/trpc';
import { Landmark, ArrowUpRight, ArrowDownRight, CheckCircle, Upload } from 'lucide-react';

export default function BankingPage() {
  const { data: accounts } = trpc.getBankAccounts.useQuery();
  const { data: transactions, refetch } = trpc.getBankTransactions.useQuery();

  const matchMutation = trpc.matchTransaction.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Banque & Rapprochement Bancaire</h1>
        <p className="text-sm text-slate-500 mt-1">
          Importez vos relevés bancaires (CSV/OFX) et rapprochez vos opérations avec vos factures et pièces comptables.
        </p>
      </div>

      {/* Account Balance Card */}
      {accounts?.map((acc) => (
        <div key={acc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{acc.name} ({acc.bankName})</h2>
              <p className="text-xs text-slate-500 font-mono">IBAN : {acc.iban}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Solde Actuel</span>
            <span className="text-2xl font-bold text-emerald-600">
              {acc.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>
      ))}

      {/* Bank Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Dernières Mouvements Bancaires</h3>
          <button className="inline-flex items-center text-xs bg-white border border-slate-300 font-medium text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50">
            <Upload className="h-3.5 w-3.5 mr-1" />
            Importer Relevé CSV
          </button>
        </div>

        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Libellé Bancaire</th>
              <th className="px-6 py-3">Catégorie</th>
              <th className="px-6 py-3">Montant</th>
              <th className="px-6 py-3">Statut Rapprochement</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {transactions?.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-xs">
                  {new Date(tx.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{tx.label}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">{tx.category || 'GÉNÉRAL'}</td>
                <td className="px-6 py-4 font-mono font-bold">
                  {tx.amount > 0 ? (
                    <span className="text-emerald-600 flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-0.5" />
                      +{tx.amount.toLocaleString('fr-FR')} €
                    </span>
                  ) : (
                    <span className="text-slate-900 flex items-center">
                      <ArrowDownRight className="h-4 w-4 mr-0.5" />
                      {tx.amount.toLocaleString('fr-FR')} €
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {tx.status === 'MATCHED' ? (
                    <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" /> RAPPROCHÉ
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                      À RAPPROCHER
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {tx.status !== 'MATCHED' && (
                    <button
                      onClick={() => matchMutation.mutate({ transactionId: tx.id })}
                      className="text-xs bg-indigo-600 text-white font-medium px-2.5 py-1 rounded hover:bg-indigo-700"
                    >
                      Valider Rapprochement
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
