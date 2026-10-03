# SASU Manager - Decisions Architecturales & Hypothèses

Ce document répertorie toutes les décisions d'architecture, choix de modélisation et hypothèses métiers retenues pour le développement du produit **SASU Manager**.

---

## 1. Hypothèses Métier Défaut (SASU France)

1. **Régime Fiscal & TVA :**
   - Imposition à l'Impôt sur les Sociétés (IS) au régime réel normal.
   - TVA déclarée mensuellement via le formulaire CA3.
   - Clôture de l'exercice comptable fixée au 31 décembre.

2. **Président Assimilé-Salarié :**
   - Le président est actionnaire unique (100% des parts).
   - Statut "assimilé salarié" affilié au Régime Général de la Sécurité Sociale (URSSAF).
   - Pas de contrat de travail de droit commun (pas de cotisation Pôle Emploi / France Travail).
   - Fiches de paie générées sur une base minimale de cotisations ~52-62% du brut.

3. **Comptabilité & Conduite Légale :**
   - Respect strict du Plan Comptable Général (PCG 2025).
   - Séparation en journaux auxiliaires : Ventes (VT), Achats (HA), Banque (BQ), Paie (PA), Opérations Diverses (OD).
   - Numérotation continue et chrono-séquentielle des factures sans rupture ni doublon (`FYYYY-XXX`).
   - Export conforme aux exigences de l'administration fiscale française (DGFiP - Art. A47 A-1) au format FEC (Fichier des Écritures Comptables).

---

## 2. Choix d'Architecture Technique

1. **Monorepo (pnpm & Turborepo) :**
   - Architecture monorepo modulaire séparant les domaines métiers (`packages/shared`), la persistance des données (`packages/db`), et l'application web frontend/API (`apps/web`).

2. **Base de Données & ORM (Prisma + SQLite/PostgreSQL) :**
   - Utilisation de Prisma comme couche ORM typée de bout en bout.
   - Support natif de SQLite en environnement embarqué/local et PostgreSQL pour la production multi-tenant.

3. **API tRPC Typée de Bout en Bout :**
   - Communication direct client-serveur ultra-performante sans contrat Open API verbeux.
   - Validation stricte des schémas d'entrée/sortie via Zod.

4. **UI/UX & Accessibilité :**
   - Stack moderne : Next.js 15 App Router, React 19, Tailwind CSS, Lucide Icons.
   - Interface utilisateur 100% en Français, professionnelle et adaptée desktop/mobile.

---

## 3. Conformité & Avertissement Réglementaire

- **Clause d'avertissement obligatoire :** SASU Manager fournit des outils d'assistance au pilotage, de la pré-comptabilité et des simulations. Elle n'a pas vocation à se substituer aux prérogatives d'un expert-comptable agréé ou d'un avocat.
- **Journal d'Audit :** Traçabilité complète et inaltérable des modifications pour la piste d'audit fiable (PAF).
