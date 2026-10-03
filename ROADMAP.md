# ROADMAP SASU Manager

Ce document présente la feuille de route du produit SASU Manager, du MVP livré jusqu'aux versions V1 et V2.

---

## 🟢 MVP — Livré & Fonctionnel
- [x] Structure Monorepo (pnpm + Turborepo).
- [x] Modélisation Base de Données Prisma complète (30+ entités).
- [x] Jeu de données de démonstration SASU (Seed).
- [x] Tableau de bord de pilotage (Trésorerie, CA, Résultat net estimé, TVA).
- [x] Fiche Société & Mandataire Président (SIREN, SIRET, APE, Capital, Régimes Fiscaux).
- [x] Gestion des Clients et Fournisseurs avec numéros de TVA Intracommunautaire.
- [x] Facturation Clients : création, calculs TVA, statut, aperçu PDF et mentions légales obligatoires.
- [x] Suivi des Dépenses & Notes de Frais avec ventilation comptable.
- [x] Rapprochement Bancaire des mouvements de compte courant.
- [x] Moteur Comptable PCG : Journaux auxiliaires (VT, HA, BQ, PA, OD), Balance 6 colonnes.
- [x] Générateur & Export du Fichier des Écritures Comptables (FEC) au format réglementaire DGFiP.
- [x] Échéancier fiscal et simulateurs (Impôt Sociétés IS, Paie Président URSSAF, Dividendes Flat Tax 30%).
- [x] Coffre-fort documentaire juridique (Statuts, PV d'AG, Kbis).
- [x] Piste d'audit inaltérable.
- [x] Suite de tests automatisés (Vitest).

---

## 🟡 Version V1 (Évolution Prochaine)
- [ ] Connexion bancaire automatique en temps réel via API (Powens / Qonto / Bridge).
- [ ] OCR automatique des reçus et factures d'achats avec extraction IA/Tesseract.
- [ ] Support du format Factur-X pour la facturation électronique.
- [ ] Génération automatique des liasses fiscales (Formulaires 2065 et annexes 2033).
- [ ] Télétransmissions DSN (Déclaration Sociale Nominative) pour l'URSSAF.
- [ ] Signature électronique des PV d'AG et actes juridiques.

---

## 🔵 Version V2 (Chantier Long Terme)
- [ ] Portail Client dédié pour la validation des devis et règlement en ligne Stripe.
- [ ] Facturation récurrente et abonnements automatisés.
- [ ] Gestion automatisée des amortissements d'actifs et immobilisations (Compte 218).
- [ ] Conformité obligatoire e-invoicing 2026/2027 (Plateforme de Dématérialisation Partenaire PDP).
