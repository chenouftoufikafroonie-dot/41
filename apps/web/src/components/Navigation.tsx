'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  Landmark,
  Calculator,
  Scale,
  FolderLock,
  History,
  ShieldAlert,
  Sliders,
} from 'lucide-react';

const navItems = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Société & Président', href: '/societe', icon: Building2 },
  { name: 'Clients & Suppliers', href: '/contacts', icon: Users },
  { name: 'Facturation & Devis', href: '/facturation', icon: FileText },
  { name: 'Dépenses & Notes de frais', href: '/depenses', icon: CreditCard },
  { name: 'Banque & Rapprochement', href: '/banque', icon: Landmark },
  { name: 'Comptabilité (PCG & FEC)', href: '/comptabilite', icon: Calculator },
  { name: 'Fiscalité & Social', href: '/fiscal-social', icon: Scale },
  { name: 'Juridique & Coffre-fort', href: '/documents', icon: FolderLock },
  { name: 'Journal d\'Audit', href: '/audit', icon: History },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              SASU
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">SASU Manager</h1>
              <span className="text-xs text-indigo-400 font-medium">Édition 2025 France</span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-start space-x-2 text-xs text-amber-400/90 leading-snug">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Cette application ne remplace pas un expert-comptable ou un avocat. Avertissement légal conforme DGFiP.
          </p>
        </div>
      </div>
    </aside>
  );
}
