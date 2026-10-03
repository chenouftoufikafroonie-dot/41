# Guide de Contribution (CONTRIBUTING.md)

Merci de contribuer à **SASU Manager** !

## Standards de Code & Qualité
1. **Langue :**
   - Interface utilisateur : Français 🇫🇷
   - Code source, variables et commentaires : Anglais 🇬🇧
2. **Architecture :**
   - Monorepo pnpm + Turborepo.
   - Routage Next.js 15 App Router.
   - API tRPC typée de bout en bout avec schémas Zod.
3. **Tests :**
   - Tout nouveau calcul financier, fiscal ou comptable doit être couvert par des tests unitaires Vitest dans `packages/shared/src/accounting.test.ts`.

## Commandes Principales
```bash
# Installation des dépendances
pnpm install

# Génération du client Prisma & Migration
pnpm db:push
pnpm db:seed

# Lancement des tests
npx vitest run

# Lancement du serveur de développement
pnpm dev
```
