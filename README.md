# 🚀 SASU Manager - Plateforme de Gestion Tout-en-Un pour SASU (France)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black.svg)](https://nextjs.org/)

**SASU Manager** est une application web moderne et complète conçue sur-mesure pour les Présidents et associés uniques de SASU en France. Elle permet de piloter l'intégralité de l'activité de l'entreprise de A à Z : juridiques, comptabilité générale PCG, facturation, dépenses, banque, fiscalité, paie président et export FEC.

---

## 💡 Fonctionnalités Clés (MVP Livré)

1. **Tableau de Bord de Pilotage :**
   - Trésorerie consolidée en temps réel.
   - Suivi du Chiffre d'Affaires HT et du Résultat Net Estimé.
   - Suivi de la TVA collectée, déductible et nette à payer.
   - Échéancier des obligations fiscales (TVA CA3, IS, CFE).

2. **Société & Mandataires :**
   - Fiche d'identité SIREN/SIRET, Code APE/NAF, N° TVA Intracommunautaire.
   - Registre du Président (Assimilé Salarié) et de l'Associé unique à 100%.

3. **Clients, Devis & Facturation :**
   - Numérotation légale continue et chronologique (`F2025-XXX`).
   - Taux de TVA configurables (20%, 10%, 5.5%, 0%).
   - Generateur de factures avec mentions légales obligatoires (Délai de paiement, pénalités, indemnité forfaitaire de 40€).
   - Génération automatique des écritures comptables dans le Journal des Ventes (VT).

4. **Dépenses & Notes de Frais :**
   - Saisie des factures fournisseurs et notes de frais avancées par le président.
   - Ventillation de la TVA déductible et génération automatique dans le Journal des Achats (HA).

5. **Banque & Rapprochement :**
   - Mouvements bancaires, catégorisation automatique et lettrage avec les pièces justificatives.

6. **Comptabilité Générale PCG & Export FEC :**
   - Plan Comptable Général (PCG) français.
   - Journaux auxiliaires : Ventes (VT), Achats (HA), Banque (BQ), Paie (PA), Opérations Diverses (OD).
   - Balance Générale à 6 colonnes.
   - **Export FEC (Fichier des Écritures Comptables)** au format texte tabulation réglementaire conforme aux exigences de la DGFiP (Art. A47 A-1).

7. **Simulateurs Fiscaux & Sociaux :**
   - Simulateur Impôt sur les Sociétés (IS) : barème progressif 15% (jusqu'à 42 500 €) / 25%.
   - Simulateur Rémunération Président (Cotisations sociales URSSAF ~52%).
   - Simulateur Dividendes Flat Tax / PFU (Prélèvement Forfaitaire Unique à 30%).

8. **Juridique & Coffre-Fort Documentaire :**
   - Archiving des Statuts Constitutifs, PV d'Assemblée Générale, et extrait Kbis.

9. **Sécurité & Traçabilité :**
   - Journal d'audit inaltérable.
   - Avertissement légal conforme à la réglementation des professions d'expert-comptable et d'avocat.

---

## 🛠️ Stack Technique

- **Monorepo :** `pnpm` + `Turborepo`
- **Frontend :** Next.js 15 (App Router), React 19, TypeScript
- **Style & UI :** Tailwind CSS, Lucide Icons
- **Base de Données & ORM :** Prisma + SQLite / PostgreSQL
- **API :** tRPC v10 + Zod
- **Tests :** Vitest

---

## 📦 Installation & Démarrage Rapide

### Prérequis
- Node.js >= 18.0
- pnpm >= 8.0

### Commandes
```bash
# 1. Cloner le projet et installer les dépendances
pnpm install

# 2. Initialiser la base de données et générer les données de démonstration
DATABASE_URL="file:./dev.db" npx --package=prisma@5.22.0 prisma db push --schema=packages/db/prisma/schema.prisma
DATABASE_URL="file:./dev.db" npx tsx packages/db/prisma/seed.ts

# 3. Lancer la suite de tests automatisés
npx vitest run

# 4. Lancer l'application web en mode développement
pnpm dev
```

L'application web sera accessible sur `http://localhost:3000`.

---

## 📄 Licence
Ce projet est sous licence MIT.
