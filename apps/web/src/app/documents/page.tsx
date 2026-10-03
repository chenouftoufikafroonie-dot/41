'use client';

import { FolderLock, FileText, Download, ShieldCheck } from 'lucide-react';

export default function DocumentsPage() {
  const documents = [
    { title: 'Statuts Constitutifs TechConsult SASU', type: 'STATUTS', date: '01/01/2024', size: '2.4 MB' },
    { title: 'Procès-Verbal d\'AG - Approbation des comptes 2024', type: 'PV_AG', date: '10/01/2025', size: '1.1 MB' },
    { title: 'Attestation de Vigilance URSSAF', type: 'ATTESTATION', date: '15/01/2025', size: '450 KB' },
    { title: 'Kbis de moins de 3 mois', type: 'KBIS', date: '01/02/2025', size: '600 KB' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Juridique & Coffre-fort Documentaire</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stockage sécurisé des pièces juridiques, statuts, procès-verbaux d'assemblée générale et registres.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm flex items-center">
            <FolderLock className="h-4 w-4 mr-2 text-indigo-600" />
            Documents Officiels de la Société
          </h3>
        </div>

        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
            <tr>
              <th className="px-6 py-3">Intitulé du Document</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date d'Ajout</th>
              <th className="px-6 py-3">Taille</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {documents.map((doc, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                  {doc.title}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded">
                    {doc.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono">{doc.date}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{doc.size}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-100 inline-flex items-center">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Télécharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
