import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/components/TRPCProvider';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'SASU Manager - Platforme de Gestion de SASU A à Z',
  description: 'Gestion juridique, comptable, fiscale, sociale, facturation et banque pour SASU.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <TRPCProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Navigation />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
