'use client';

import { trpc } from '@/lib/trpc';
import { History, Shield, CheckCircle2 } from 'lucide-react';

export default function AuditPage() {
  const { data: logs } = trpc.getAuditLogs.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Journal d'Audit & Traçabilité Sécurisée</h1>
        <p className="text-sm text-slate-500 mt-1">
          Piste d'audit inaltérable pour la conformité fiscale française (LIVPF) et le contrôle de l'expert-comptable.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm flex items-center">
            <Shield className="h-4 w-4 mr-2 text-indigo-600" />
            Événements Systèmes & Actions Utilisateurs
          </h3>
          <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Conforme Norme NF Z42-013
          </span>
        </div>

        <table className="min-w-full divide-y divide-slate-200 text-sm font-mono">
          <thead className="bg-slate-50 text-slate-500 text-left font-semibold">
            <tr>
              <th className="px-6 py-3">Horodatage</th>
              <th className="px-6 py-3">Utilisateur</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Entité Cible</th>
              <th className="px-6 py-3">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4">{log.user?.name || 'Système Automatique'}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold">{log.entity}</td>
                <td className="px-6 py-4 text-slate-500 font-sans max-w-sm truncate">
                  {log.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
