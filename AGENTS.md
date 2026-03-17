# Repository Guidelines

## Rules Index

**IMPORTANT:** Before implementing ANY feature, consult the **Rules Index** at:
📋 [`.cursor/rules/RULES-INDEX.md`](.cursor/rules/RULES-INDEX.md)

This index is a table of contents for all project implementation rules. Browse it to quickly find the relevant rule(s) for your task.

## Code Generation Prerequisites

Before generating ANY new code, you **MUST** complete these verification steps:

1. **Consult the Rules Index**
   Open [`.cursor/rules/RULES-INDEX.md`](.cursor/rules/RULES-INDEX.md) and:
   - Use the **Quick Decision Matrix** to identify relevant rules for your task
   - Read the **Description** column to find matching rules
   - **Read the full rule file(s)** before writing any code

   Common rule mappings:
   | Task | Rules to Read |
   |------|---------------|
   | New page/component | `rule-presentation`, `rule-safe-route` |
   | Form implementation | `rule-form-front-and-back`, `rule-zod-client-server-internationalization` |
   | Server Action | `rule-safe-server-action`, `rule-server-actions-imports` |
   | Business service | `rule-service`, `rule-authorization-service` |
   | Database model | `rule-persistence` |
   | API Route | `rule-api-routes` |

2. **Check Existing Codebase Patterns**
   Find and analyze **at least three existing examples** of similar functionality in the codebase. Look for:
   - Similar components, functions, or modules
   - Existing patterns that solve comparable problems
   - Code structure and conventions already in use

   If no such examples exist, explicitly state that fact before proceeding.

3. **Follow the Rules Exactly**
   If a rule exists for your task, you **MUST** follow it exactly. The rules contain:
   - Required patterns and code structure
   - Security requirements (auth, validation)
   - File naming and organization conventions
   - Integration patterns with other layers

**Until all verifications are complete, do NOT proceed with implementation.**
Every new feature must be analyzed against existing rules and codebase patterns before any code is written. Always propose an implementation plan and wait for approval before coding.

## Project Structure & Module Organization

Application code lives in `src`; Next.js routes sit under `src/app` and shared UI components in `src/components`. Utilities and cross-cutting helpers belong in `src/lib`, while database schemas and migrations live in `drizzle` with supporting scripts in `src/db/scripts`. End-to-end Playwright scenarios are under `e2e`, docs for subsystems (auth, Stripe, Inngest) reside in `docs`, shared assets in `public`, and automation helpers in `scripts`.

## Build, Test, and Development Commands

Use `pnpm dev` to launch the Next.js 15 app with Turbopack. `pnpm build` compiles the production bundle and `pnpm start` serves it. Run code quality checks with `pnpm lint` and `pnpm format`; apply automatic formatting via `pnpm format:fix`. Execute unit and integration suites with `pnpm test`, and run Playwright journeys via `pnpm test:e2e` (append `--ui` for debugging). Database tasks rely on Drizzle: `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:reset-seed` to refresh fixtures.

## Coding Style & Naming Conventions

Follow Prettier defaults: two-space indentation, single quotes, no semicolons, 80-character line width, and Tailwind class sorting. ESLint enforces module ordering and disallows direct `process.env` access; import configuration from `@/env`. Name React components with PascalCase, variables and helpers with camelCase, and non-component files using kebab-case.

## Testing Guidelines

Vitest powers unit and integration tests with separate `jsdom` and `node` projects; colocate specs as `*.test.ts(x)` near the code under test. Initialize mocks using the setup files referenced in `vitest.config.ts`. For browser flows, add Playwright specs under `e2e` and run `pnpm test:e2e --project=chromium` when isolating failures. Keep seeds deterministic by updating `src/db/scripts/seed.ts` whenever tests rely on fixture data.

## Commit & Pull Request Guidelines

Use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`); Husky hooks will lint, format, and run targeted tests on staged files. Pull requests should summarize scope, call out impacted areas (UI, API, DB), and note any `.env` or migration updates. Include relevant screenshots or terminal output for visible changes and link to docs updates in `docs/` when applicable.

## Security & Configuration Tips

Bootstrap environment files with `pnpm init:env`, then fill values from `env.example`. Generate secrets such as `AUTH_SECRET` and Stripe keys using the scripts referenced in `README.md`, and never commit `.env`. When validating Stripe webhooks locally, run `pnpm stripe:listen` alongside `pnpm dev`.

## Instructions Associé IA : Projet My Home Farmer (SaaS Home Farmer)

## 1. Vision & Objectif

My Home Farmer(pour le moment, je vais peut-être changer de nom plus tard) est un SaaS B2B2B conçu pour structurer le métier de "Home Farmer" (entrepreneur jardinier).
**L'objectif principal** est de digitaliser l'activité des entrepreneurs jardiniers du réseau "Home Farmer" pour :

1. Automatiser leur gestion administrative (gain de temps de 20%).
2. Justifier la valeur de leur prestation (150€/mois) via un calcul de ROI pour le client final.
3. Sécuriser les revenus sur 12 mois en cassant la saisonnalité du jardinage.

## 2. Écosystème d'Utilisateurs

> ⚠️ **Attention à la confusion de nommage** : "Home Farmer" désigne à la fois la franchise (maison mère) ET le métier de l'entrepreneur. Dans le code, utiliser les noms ci-dessous.

### Les 4 rôles distincts

- **`SuperAdmin` (Moi, le créateur du SaaS) :** Accès au panel admin du boilerplate. Suit tous les abonnés (`Farmer`), le CA, le MRR, les stats globales. C'est MON outil de pilotage business.

- **`Franchisor` (La Franchise "Home Farmer", la maison mère) :** Vend une formation + accompagnement 6 mois à 6000€ (one-shot, pas d'abonnement). N'a PAS d'espace dans l'app pour le MVP. Son objectif : former les entrepreneurs à réussir leur activité. Pas de commission sur les clients des Farmers.

- **`Farmer` (L'Entrepreneur Jardinier) :** Utilisateur principal de l'app. Abonnement mensuel Early Bird (9€/mois Pousse, 39€/mois Récolte FR, 29€/mois Récolte BE/CH) puis tarif standard (49€/mois Pousse, 99€/mois Récolte FR, 69€/mois Récolte BE/CH) après 12 mois. Gère ses tournées, ses fiches clients et ses rapports d'entretien. Correspond au concept `Organization` du boilerplate.

- **`Client` (Le Particulier) :** Le client du Farmer. Accède à son espace pour voir les photos du pro, saisir ses récoltes et consulter son dashboard ROI. Correspond au concept `Member` du boilerplate.

## 3. Architecture Technique (Stack)

Ce projet utilise le boilerplate **Ship-SaaS** :

- **Framework :** Next.js (App Router).
- **Style :** Tailwind CSS + ShadcnUI (Composants Mobile-First impératifs).
- **Backend/Base de données :** Supabase (PostgreSQL + Auth + Storage).
- **Paiements :** Stripe (Abonnements SaaS Pros).
- **Mobile :** Web-App responsive (Capacitor.js prévu en Phase 2).

## 4. Logique Métier Critique (Core Logic)

L'IA doit toujours garder en tête ces règles métiers lors de la génération de code :

### A. Tarification & Plans d'Abonnement

| Offre               | Année 1 "Early Bird" | Année 2+ Standard | Capacité               |
| ------------------- | -------------------- | ----------------- | ---------------------- |
| **Graine**          | 0 €                  | 0 €               | 1 client (Test)        |
| **Pousse**          | 9 € / mois           | 49 € / mois       | Jusqu'à 20 clients     |
| **Récolte (FR)**    | 39 € / mois          | 99 € / mois       | Illimité + API Fiscale |
| **Récolte (BE/CH)** | 29 € / mois          | 69 € / mois       | Illimité               |

**Règle de Pricing Early Bird :** Appliquer un tarif "Early Bird" pendant les 12 premiers mois suivant l'inscription du `Farmer`. Après 12 mois, le tarif standard s'applique automatiquement via Stripe (upgrade de price_id sur la subscription).

**Stratégie :** L'offre "Graine" gratuite permet un accès sans risque (psychologiquement indolore après les 6000€ de formation). Le lock-in se crée naturellement une fois que le Farmer a ses clients, photos et historique fiscal dans l'app.

### B. Segmentation Géographique & Fiscale

- **France :** Activation du module "Service à la Personne". Calcul du crédit d'impôt de 50%. Plan "Récolte FR" à 39€/mois (an 1) puis 99€/mois (inclut API fiscale).
- **Belgique/Suisse/Autre :** Pas de crédit d'impôt, pas d'API Fiscale. Plan "Récolte non-FR" à 29€/mois (an 1) puis 69€/mois.
- La différence entre Récolte FR et Récolte non-FR est **uniquement le module API Fiscale** (Service à la Personne). Le prix reflète ce module supplémentaire.
- La landing page affiche un **switch FR / non-FR** sur la section pricing pour montrer les deux tarifs.
- **Autre :** Dans quelques années, Home Farmer voudra développer leur concept dans l'Europe entier et dans le monde.

### C. Le Calculateur de ROI (Le coeur de la valeur)

- Le Pro entretient, mais ne récolte pas.
- Le Client saisit ses récoltes (kg) dans l'app.
- L'app doit calculer : `Poids (kg) x Prix Bio Marché = Valeur Récoltée`.
- L'app affiche : `Valeur Récoltée` (Valorisation de la production au prix du marché bio).
- **Note importante :** Ne PAS comparer avec le coût de l'abonnement du Farmer. Le service est un accompagnement, pas uniquement une rentabilité financière directe. L'objectif est de montrer la valeur produite par le jardin.

### D. Justification de la Saisonnalité

- L'app doit proposer des checklists de tâches pour les 12 mois de l'année (même en hiver : planification, amendement, semis intérieurs) pour justifier l'abonnement mensuel constant.

## 5. Roadmap MVP

1. **Module Pro :** CRUD Clients, Fiche technique terrain (exposition, sol), Log d'intervention (Checklist + Photo).
2. **Module Client :** Saisie des récoltes simplifiée, Dashboard de gains (ROI).
3. **Module Admin/Fiscal :** Génération de factures et d'attestations fiscales PDF.

## 6. Tes Responsabilités en tant qu'Associé

- **Mobile-First :** Chaque interface doit être utilisable d'une seule main avec des "gros boutons" (mains sales/gants).
- **Performance :** Optimisation du chargement des images (photos du potager).
- **Cohérence :** Toujours vérifier que les tables Drizzle correspondent aux besoins des quatre rôles utilisateurs (`SuperAdmin`, `Franchisor`, `Farmer`, `Client`).
- **Proactivité :** Si une fonctionnalité peut simplifier la vie de l'entrepreneur (ex: itinéraire Maps), suggère-la.
