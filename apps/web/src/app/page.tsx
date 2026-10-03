'use client';

import { trpc } from '@/lib/trpc';
import {
  TrendingUp,
  Wallet,
  Receipt,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = trpc.getDashboardStats.useQuery();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Chargement du tableau de bord SASU...</div>;
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
        Erreur lors de la récupération des données du tableau de bord.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Disclaimer Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-start space-x-3 text-amber-800">
        <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold">Avertissement légal :</span> SASU Manager aide au suivi de votre SASU TechConsult. Elle ne remplace pas la validation finale par un expert-comptable inscrit à l'Ordre ou un avocat.
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord de Pilotage</h1>
        <p className="text-sm text-slate-500 mt-1">
          Vue d'ensemble en temps réel de votre SASU (IS / TVA Réelle Normale)
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Trésorerie Consolidée</span>
            <Wallet className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.totalCash.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Compte Qonto Actif
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Chiffre d'Affaires Encaissé</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.revenueYear.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Dépenses HT : {stats.expensesYear.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Résultat Net Estimé</span>
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.netResultEst.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Avant Impôt sur les Sociétés (IS)
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">TVA à Payer Est.</span>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.vatPayableEst.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Collectée : {stats.vatCollected} € | Déductible : {stats.vatDeductible} €
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prochaines Échéances Fiscables & Sociales */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-indigo-600" />
              Prochaines Échéances Fiscables
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              Calendrier Officiel
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Aucune échéance urgente.</p>
            ) : (
              stats.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{deadline.title}</p>
                    <p className="text-xs text-slate-500">
                      Échéance le {new Date(deadline.dueDate).toLocaleDateString('fr-FR')} • Catégorie : {deadline.category}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">
                    {deadline.amount ? `${deadline.amount.toLocaleString('fr-FR')} €` : 'À déclarer'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Factures en Attente de Règlement */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Factures à Recouvrer
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.unpaidInvoices.length === 0 ? (
              <div className="py-6 text-center text-emerald-600 text-sm flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Toutes les factures ont été encaissées !
              </div>
            ) : (
              stats.unpaidInvoices.map((invoice) => (
                <div key={invoice.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {invoice.number} - {invoice.client.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Échéance le {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {invoice.amountTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                    <span className="inline-block text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      En attente
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
