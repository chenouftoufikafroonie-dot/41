'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { FileText, Plus, Check, DollarSign, Download, Printer } from 'lucide-react';

export default function InvoicesPage() {
  const { data: invoices, refetch } = trpc.getInvoices.useQuery();
  const { data: clients } = trpc.getClients.useQuery();

  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form state
  const [clientId, setClientId] = useState('');
  const [number, setNumber] = useState(`F2025-00${(invoices?.length || 0) + 1}`);
  const [description, setDescription] = useState('Prestation de conseil en systèmes d\'information');
  const [quantity, setQuantity] = useState(5);
  const [unitPrice, setUnitPrice] = useState(1000);
  const [vatRate, setVatRate] = useState(20);

  const createInvoiceMutation = trpc.createInvoice.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
    },
  });

  const markPaidMutation = trpc.markInvoicePaid.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    createInvoiceMutation.mutate({
      clientId,
      number,
      date: today,
      dueDate,
      notes: 'Paiement à 30 jours par virement bancaire. Escompte pour paiement anticipé : néant.',
      lines: [
        {
          description,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          vatRate: Number(vatRate),
        },
      ],
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturation Clients (Devis & Factures)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Numérotation légale continue, calculs de TVA et génération des écritures comptables automatiques.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer une Facture
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
            <tr>
              <th className="px-6 py-3">N° Facture</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Date / Échéance</th>
              <th className="px-6 py-3">Montant HT</th>
              <th className="px-6 py-3">Montant TTC</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-indigo-600">{inv.number}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{inv.client.name}</td>
                <td className="px-6 py-4 text-xs">
                  <div>{new Date(inv.date).toLocaleDateString('fr-FR')}</div>
                  <div className="text-slate-400">Éch: {new Date(inv.dueDate).toLocaleDateString('fr-FR')}</div>
                </td>
                <td className="px-6 py-4 font-mono">{inv.amountHt.toLocaleString('fr-FR')} €</td>
                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                  {inv.amountTtc.toLocaleString('fr-FR')} €
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status === 'PAID' ? 'PAYÉE' : 'EN ATTENTE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {inv.status !== 'PAID' && (
                    <button
                      onClick={() =>
                        markPaidMutation.mutate({
                          invoiceId: inv.id,
                          paymentDate: new Date().toISOString().split('T')[0],
                        })
                      }
                      className="inline-flex items-center text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Marquer Payée
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="inline-flex items-center text-xs border border-slate-300 text-slate-700 px-2.5 py-1.5 rounded hover:bg-slate-100"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1" />
                    Aperçu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice PDF Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 space-y-6 text-slate-900">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">FACTURE {selectedInvoice.number}</h2>
                <p className="text-xs text-slate-500">Mentions Légales SASU France</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-bold text-indigo-900">ÉMETTEUR :</p>
                <p className="font-semibold">TechConsult SASU</p>
                <p className="text-xs text-slate-600">SIREN: 901 234 567 • TVA: FR12901234567</p>
                <p className="text-xs text-slate-600">15 Rue de la Paix, 75002 Paris</p>
                <p className="text-xs text-slate-600">Capital : 1 000,00 €</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-bold text-indigo-900">DESTINATAIRE :</p>
                <p className="font-semibold">{selectedInvoice.client.name}</p>
                <p className="text-xs text-slate-600">SIREN: {selectedInvoice.client.siren || 'N/A'}</p>
                <p className="text-xs text-slate-600">{selectedInvoice.client.address}</p>
              </div>
            </div>

            {/* Table Lines */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-left border-b">
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Qté</th>
                  <th className="p-2 text-right">P.U HT</th>
                  <th className="p-2 text-right">TVA</th>
                  <th className="p-2 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.lines.map((line: any) => (
                  <tr key={line.id} className="border-b">
                    <td className="p-2">{line.description}</td>
                    <td className="p-2 text-right">{line.quantity}</td>
                    <td className="p-2 text-right">{line.unitPrice.toLocaleString('fr-FR')} €</td>
                    <td className="p-2 text-right">{line.vatRate}%</td>
                    <td className="p-2 text-right font-medium">{line.amountHt.toLocaleString('fr-FR')} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-sm bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Total HT :</span>
                  <span className="font-medium">{selectedInvoice.amountHt.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%) :</span>
                  <span className="font-medium">{selectedInvoice.amountVat.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1 text-indigo-900">
                  <span>Total TTC :</span>
                  <span>{selectedInvoice.amountTtc.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t pt-4 space-y-1">
              <p>Conditions de règlement : Paiement sous 30 jours à réception de facture.</p>
              <p>Pas d'escompte pour règlement anticipé. Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €.</p>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Nouvelle Facture Client</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Sélectionner le Client *</label>
                <select
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">-- Choisir un client --</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Numéro de Facture *</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description Prestation *</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quantité / Jours</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Prix Unitaire HT (€)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
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
                    <option value={5.5}>5,5 %</option>
                    <option value={0}>0 % (Exonéré)</option>
                  </select>
                </div>
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
                  Générer la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
