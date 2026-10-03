# Politique de Sécurité & Protection des Données (SECURITY.md)

## 1. Engagement de Sécurité & Confidentialité
SASU Manager traite des données financières, comptables et personnelles d'entreprises françaises. La sécurité et la confidentialité sont au cœur de la conception de la plateforme.

---

## 2. Piste d'Audit & Traçabilité (NF Z42-013)
- **Horodatage & Inaltérabilité :** Chaque saisie de facture, paiement ou écriture comptable fait l'objet d'un verrouillage automatique et d'une entrée dans la table `AuditLog`.
- **Rôle & Permissons (RBAC) :**
  - **ADMIN / PRESIDENT :** Accès complet à la gestion, facturation et paie.
  - **EXPERT_ACCOUNTANT :** Accès de lecture, révision et export FEC.
  - **READ_ONLY :** Consultation restreinte.

---

## 3. Conformité RGPD (Règlement Général sur la Protection des Données)
- **Minimisation des données :** Seules les données nécessaires à l'immatriculation et au traitement comptable sont collectées.
- **Exportation des données :** Les utilisateurs peuvent exporter l'intégralité de leurs données via l'export FEC et les fichiers CSV/JSON.
- **Droit à l'effacement :** Suppression sécurisée des comptes et données associées (hors obligations légales d'archivage comptable de 10 ans).

---

## 4. Signalement des Vulnérabilités
Si vous découvrez une faille de sécurité, veuillez contacter immédiatement l'équipe technique à `security@techsasu.fr`.
