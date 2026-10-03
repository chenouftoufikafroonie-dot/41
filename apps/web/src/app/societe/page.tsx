'use client';

import { trpc } from '@/lib/trpc';
import { Building2, User, Landmark, ShieldCheck } from 'lucide-react';

export default function CompanyPage() {
  const { data: company, isLoading } = trpc.getCompany.useQuery();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Chargement de la fiche société...</div>;
  if (!company) return <div className="p-8 text-center text-red-500">Aucune société SASU trouvée.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil de la SASU & Mandataires</h1>
        <p className="text-sm text-slate-500 mt-1">
          Informations légales, capital social, immatriculation SIREN / SIRET et régime fiscal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Legal Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center border-b pb-3">
            <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
            Identité Legale SASU
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Raison Sociale</span>
              <span className="font-semibold text-slate-900">{company.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Forme Juridique</span>
              <span className="font-semibold text-slate-900">{company.legalForm} (Associé Unique)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Numéro SIREN</span>
              <span className="font-semibold text-slate-900">{company.siren}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Numéro SIRET (Siège)</span>
              <span className="font-semibold text-slate-900">{company.siret}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Code APE / NAF</span>
              <span className="font-semibold text-slate-900">{company.apeCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">N° TVA Intracommunautaire</span>
              <span className="font-semibold text-slate-900">{company.vatNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Capital Social</span>
              <span className="font-semibold text-slate-900">{company.shareCapital.toLocaleString('fr-FR')} €</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Adresse du Siège</span>
              <span className="font-semibold text-slate-900">{company.address}, {company.postalCode} {company.city}</span>
            </div>
          </div>
        </div>

        {/* Fiscal & Bank Setup */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center border-b pb-3">
            <Landmark className="h-5 w-5 mr-2 text-indigo-600" />
            Régimes Fiscaux & Coordonnées Bancaires
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Régime d'Imposition</span>
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                IS (Impôt sur les Sociétés)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Régime de TVA</span>
              <span className="font-semibold text-slate-900">{company.vatRegime} (Mensuel CA3)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Clôture d'Exercice</span>
              <span className="font-semibold text-slate-900">31 Décembre</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Pays de Domiciliation</span>
              <span className="font-semibold text-slate-900">France 🇫🇷</span>
            </div>
            <div className="col-span-2 pt-2 border-t">
              <span className="text-slate-500 block text-xs">IBAN Principal</span>
              <span className="font-mono text-xs font-semibold text-slate-800">{company.bankIban || 'Non renseigné'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">BIC / SWIFT</span>
              <span className="font-mono text-xs font-semibold text-slate-800">{company.bankBic || 'Non renseigné'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandataires & Shareholders */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center border-b pb-3">
          <User className="h-5 w-5 mr-2 text-indigo-600" />
          Président & Actionnariat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Président de la SASU</h3>
            {company.executives.map((exec) => (
              <div key={exec.id} className="text-sm space-y-1">
                <p className="font-bold text-slate-800">{exec.firstName} {exec.lastName}</p>
                <p className="text-slate-600">Statut : Assimilé Salarié (Régime Général Sécurité Sociale)</p>
                <p className="text-slate-500 text-xs">Email : {exec.email} | Tel : {exec.phone || 'N/A'}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Répartition des Actions</h3>
            {company.shareholders.map((sh) => (
              <div key={sh.id} className="text-sm space-y-1">
                <p className="font-bold text-slate-800">{sh.name}</p>
                <p className="text-slate-600">Actions détenues : {sh.sharesCount} ({sh.percentage}%)</p>
                <p className="text-slate-500 text-xs">Associé Unique à 100%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
