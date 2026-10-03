'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { CreditCard, Plus, Receipt, FileUp } from 'lucide-react';

export default function ExpensesPage() {
  const { data: expenses, refetch } = trpc.getExpenses.useQuery();
  const { data: suppliers } = trpc.getSuppliers.useQuery();

  const [showModal, setShowModal] = useState(false);

  // Form State
  const [description, setDescription] = useState('Abonnement Logiciel Cloud & Outils Dev');
  const [category, setCategory] = useState('SOFTWARE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountHt, setAmountHt] = useState(200);
  const [vatRate, setVatRate] = useState(20);
  const [isNoteDeFrais, setIsNoteDeFrais] = useState(false);

  const createExpenseMutation = trpc.createExpense.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createExpenseMutation.mutate({
      description,
      category,
      date,
      amountHt: Number(amountHt),
      vatRate: Number(vatRate),
      isNoteDeFrais,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dépenses & Notes de Frais</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enregistrez vos frais professionnels, suivez la TVA déductible et ventilez en comptabilité.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une Dépense
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Description / Catégorie</th>
              <th className="px-6 py-3">Fournisseur</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Montant HT</th>
              <th className="px-6 py-3">TVA Déductible</th>
              <th className="px-6 py-3">Montant TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {expenses?.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-xs">
                  {new Date(exp.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{exp.description}</p>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-4">{exp.supplier?.name || 'Divers / Note de frais'}</td>
                <td className="px-6 py-4">
                  {exp.isNoteDeFrais ? (
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                      Note de Frais Président
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      Facture Achats
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono">{exp.amountHt.toLocaleString('fr-FR')} €</td>
                <td className="px-6 py-4 font-mono text-emerald-600 font-semibold">
                  {exp.amountVat.toLocaleString('fr-FR')} € ({exp.vatRate}%)
                </td>
                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                  {exp.amountTtc.toLocaleString('fr-FR')} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Ajouter une Dépense ou Note de Frais</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Libellé de la Dépense *</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Catégorie</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="SOFTWARE">Logiciels & Cloud</option>
                    <option value="RESTAURANT">Repas & Invitations</option>
                    <option value="TRAVEL">Déplacements / Transports</option>
                    <option value="SUPPLIES">Fournitures & Matériel</option>
                    <option value="SERVICES">Honoraires & Conseils</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Montant HT (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={amountHt}
                    onChange={(e) => setAmountHt(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Taux TVA (%)</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                  >
                    <option value={20}>20 %</option>
                    <option value={10}>10 %</option>
                    <option value={5.5}>5.5 %</option>
                    <option value={0}>0 % (Non déductible / Exonéré)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="notedefrais"
                  checked={isNoteDeFrais}
                  onChange={(e) => setIsNoteDeFrais(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="notedefrais" className="text-xs font-semibold text-slate-700">
                  Note de frais (avancé par le président personnellement)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  Enregistrer Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
