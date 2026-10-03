'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Users, Plus, Building, Mail, MapPin } from 'lucide-react';

export default function ContactsPage() {
  const { data: clients, refetch: refetchClients } = trpc.getClients.useQuery();
  const { data: suppliers, refetch: refetchSuppliers } = trpc.getSuppliers.useQuery();

  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [siren, setSiren] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const createClientMutation = trpc.createClient.useMutation({
    onSuccess: () => {
      refetchClients();
      setShowModal(false);
      resetForm();
    },
  });

  const createSupplierMutation = trpc.createSupplier.useMutation({
    onSuccess: () => {
      refetchSuppliers();
      setShowModal(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setSiren('');
    setVatNumber('');
    setEmail('');
    setAddress('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'clients') {
      createClientMutation.mutate({ name, siren, vatNumber, email, address, paymentTerms: 30 });
    } else {
      createSupplierMutation.mutate({ name, siren, vatNumber, email, address });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients & Fournisseurs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez votre carnet de contacts professionnels avec SIREN et numéros de TVA.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau {activeTab === 'clients' ? 'Client' : 'Fournisseur'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-4 text-sm font-semibold border-b-2 ${
              activeTab === 'clients'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Clients ({clients?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-4 text-sm font-semibold border-b-2 ${
              activeTab === 'suppliers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Fournisseurs ({suppliers?.length || 0})
          </button>
        </nav>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'clients' ? (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
              <tr>
                <th className="px-6 py-3">Nom Client</th>
                <th className="px-6 py-3">SIREN / TVA</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Adresse</th>
                <th className="px-6 py-3">Factures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {clients?.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className="block text-xs font-mono">{c.siren || 'N/A'}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{c.vatNumber || ''}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center text-slate-600">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      {c.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate">{c.address}</td>
                  <td className="px-6 py-4 font-medium">{c.invoices.length} facture(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
              <tr>
                <th className="px-6 py-3">Nom Fournisseur</th>
                <th className="px-6 py-3">SIREN / TVA Intracom</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Adresse</th>
                <th className="px-6 py-3">Dépenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {suppliers?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{s.vatNumber || s.siren || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs">{s.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate">{s.address || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium">{s.expenses.length} dépense(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Ajouter un {activeTab === 'clients' ? 'Client' : 'Fournisseur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Raison Sociale *</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SIREN</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={siren}
                    onChange={(e) => setSiren(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">N° TVA Intracom</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Adresse complète</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
