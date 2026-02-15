# AHMI – Plateforme Solidaire

[![CI](https://github.com/seliegarrigues/projet-AHMI/actions/workflows/ci.yml/badge.svg)](https://github.com/seliegarrigues/projet-AHMI/actions/workflows/ci.yml)

> **Pitch en une phrase :** Application web et mobile qui centralise toutes les actions solidaires de l’association AHMI — gestion d’événements, boutique de dons revalorisés et mise en relation — afin d’améliorer le quotidien des citoyens tout en soutenant l’économie locale.

## Sommaire

- [AHMI – Plateforme Solidaire](#ahmi--plateforme-solidaire)
  - [Sommaire](#sommaire)
  - [Contexte](#contexte)
  - [Fonctionnalités clés](#fonctionnalités-clés)
  - [Stack technique](#stack-technique)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Lancement en développement](#lancement-en-développement)
  - [Scripts npm utiles](#scripts-npm-utiles)
  - [Variables d’environnement](#variables-denvironnement)
  - [Structure des dossiers](#structure-des-dossiers)
  - [Tests](#tests)
  - [Déploiement](#déploiement)
  - [Roadmap](#roadmap)
  - [Contribuer](#contribuer)
  - [Licence](#licence)
  - [Contact](#contact)

---

## Contexte

L’association **AHMI (Aide Humanitaire des Motards Interdépartemental)**, fondée en 2022 à Pau, lutte contre :

- le gaspillage alimentaire et matériel ;
- la précarité des publics fragiles ;
- les difficultés logistiques des petits événements associatifs.

Composée d’un salarié et d’une vingtaine de bénévoles, AHMI organise des ateliers socio‑culturels, un jardin participatif, des marchés nocturnes et une boutique solidaire. Le site WordPress créé en 2023 était figé ; impossible pour les bénévoles non‑techniques d’ajouter un événement ou un produit sans passer par un développeur.

Le stage de 11 semaines (25 mars → 30 mai 2025) a donc eu pour objectif de transformer ce site statique en **plateforme dynamique, responsive et accessible**, dotée d’un back‑office simplifié, afin de :

1. Accroître la visibilité en ligne des actions d’AHMI ;
2. Simplifier la publication de contenus (événements, articles, produits) ;
3. Offrir aux citoyens une réservation et un paiement rapides depuis mobile ;
4. Valoriser les partenaires locaux et recruter de nouveaux bénévoles.

## Fonctionnalités clés

- [x] **Authentification JWT** et gestion fine des rôles (Admin, Partenaire, Utilisateur)
- [x] **Catalogue d’événements CRUD** avec workflow de modération
- [x] **Réservation en ligne** et suivi en temps réel des places restantes
- [ ] **Paiements / dons** – module prêt pour intégration Stripe
- [ ] **Boutique solidaire** de produits de seconde main
- [x] **Tableau de bord personnel** (historique des réservations & adhésions)
- [x] **Soumission d’événement** par les partenaires, validation admin
- [x] **API REST** (Express + MongoDB) validée par **Joi**
- [x] **Front Vue 3 + Vite + Tailwind**, 100 % responsive & objectif WCAG AA / bonnes pratiques accessibilité
- [ ] Pipeline GitHub Actions & tests (à finaliser)

## Stack technique

| Front‑end                   | Back‑end             | Base de données    | Tests                     |
| --------------------------- | -------------------- | ------------------ | ------------------------- |
| Vue 3 + Vite + Tailwind CSS | Node.js 18 + Express | MongoDB + Mongoose | Vitest / Jest / Supertest |

➡️ Détails back-end (architecture, sécurité, variables .env, endpoints) : voir [backend/README.md](./backend/README.md)

## Prérequis

- Node >= 18
- npm >= 10 / pnpm / yarn
- MongoDB en local **ou** URI Atlas
- …

## Installation

```bash
# Clone du repo
$ git clone https://github.com/seliegarrigues/projet-AHMI.git


$ cd projet-AHMI

# Installation des dépendances front‑end
$ cd frontend && npm ci

# Installation des dépendances back‑end
$ cd ../backend && npm ci
```

## Lancement en développement

```bash
# Terminal 1 – API
$ cd backend
$ npm run dev

# Terminal 2 – Front
$ cd frontend
$ npm run dev
```

L’API tourne par défaut sur http://localhost:5000 et le front sur http://localhost:5173.

## Scripts npm utiles

| Dossier  | Script          | Description                           |
| -------- | --------------- | ------------------------------------- |
| backend  | `npm run dev`   | Démarre l’API en mode watch (nodemon) |
| backend  | `npm test`      | Tests à venir (placeholder)           |
| frontend | `npm run dev`   | Dev server Vite                       |
| frontend | `npm run build` | Build production                      |
| frontend | `npm run test`  | Tests Vitest                          |

## Variables d’environnement

Créer un fichier `.env` à la racine de **backend/** en se basant sur ce modèle :

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ahmi
JWT_SECRET=changeme
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

## Structure des dossiers

```
projet-AHMI/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── …
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── …
│   └── package.json
└── docs/
    └── …
```

## Tests

- Front : tests Vitest .
- Back : tests automatisés à venir ; pour l’instant, la validation fonctionnelle est réalisée via Postman + Swagger (/docs).

## Déploiement

- Front : Vercel / Netlify / Render
- Back : Render / Railway / Heroku
- Environnement : variables, secrets, build hooks

## Roadmap

1. ✅ Documentation de base
2. ✅ Pipeline CI GitHub Actions (à enrichir : tests, lint, etc.)
3. ☐ Badge couverture Codecov
4. ☐ Internationalisation (i18n)

## Contribuer

Les contributions sont les bienvenues ! Merci de suivre les étapes :

1. Fork et clone
2. Crée une branche `feat/…`
3. Push et ouvre une _Pull Request_

## Licence

Ce projet est sous licence **MIT** — voir le fichier [LICENSE](./LICENSE) pour plus d’informations.

## Contact

\*seliegarrigues — \*[_eliseg64@icloud.com_](mailto:eliseg64@icloud.com)

LinkedIn : [https://www.linkedin.com/in/elisegarrigues](https://www.linkedin.com/in/elisegarrigues) GitHub : [https://github.com/seliegarrigues](https://github.com/seliegarrigues)
