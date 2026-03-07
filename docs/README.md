# FitBuilder

Une application moderne et intuitive pour créer vos programmes de musculation personnalisés et gérer votre progression sportive au quotidien.

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Stack technologique](#stack-technologique)
- [Architecture](#architecture)
- [Installation & Démarrage](#installation--démarrage)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [Choix techniques principaux](#choix-techniques-principaux)
- [Documentation supplémentaire](#documentation-supplémentaire)

## 🎯 À propos

**FitBuilder** est une plateforme complète de gestion d'entraînement sportif conçue pour les passionnés de musculation. Elle permet aux utilisateurs de :

- Créer et personnaliser leurs propres programmes d'entraînement (workouts)
- Définir une bibliothèque d'exercices personnalisés ou globaux
- Planifier leurs séances sur un calendrier interactif
- Suivre l'exécution détaillée de chaque séance (sessions)
- Analyser leur progression avec des statistiques en temps réel
- Gérer leur profil et leurs préférences

L'application propose une expérience utilisateur fluide avec un système d'authentification sécurisé, une gestion d'état centralisée et une interface responsive adaptée à tous les appareils.

## ✨ Fonctionnalités principales

### 1. **Authentification & Gestion des utilisateurs**

- Connexion/Inscription avec email et mot de passe (bcrypt)
- Authentification OAuth (Google)
- Gestion des rôles (USER, ADMIN)

### 2. **Programmes d'entraînement (Workouts)**

- Créer et éditer des programmes d'entraînement personnalisés
- Ajouter/modifier/supprimer des exercices dans un programme
- Organiser les exercices avec configurations spécifiques (sets, reps, poids, repos)
- Ajouter des exercices à ses favoris
- Validation complète des données

### 3. **Exercices**

- Bibliothèque complète d'exercices (globaux et personnels)
- Créer des exercices personnalisés avec **muscle primaire** et **muscles secondaires** granulaires
- Filtrer par catégorie musculaire primaire + filtre secondaire (Combobox cascadée)
- Recherche texte en temps réel
- Marquer les exercices comme favoris
- Gestion des exercices par rôle (admin/utilisateur)
- Catégorie "Autre" incluant Corps entier et Cardio

### 4. **Calendrier & Planification**

- Vue calendrier interactif (React Big Calendar)
- Planifier des sessions d'entraînement
- Affichage du statut des séances (planifiée, en cours, terminée, annulée)
- Filtrage par statut
- Modification et suppression des événements

### 5. **Exécution des séances (Sessions)**

- Démarrer et exécuter une séance d'entraînement
- Suivi en temps réel des exercices
- Enregistrement des séries, répétitions et poids réels
- Minuteur de repos entre les séries
- Notes et ressenti d'effort après chaque exercice
- Sauvegarde automatique de la progression
- Historique complet des séances terminées

### 6. **Tableau de bord**

- Vue d'ensemble de la journée
- Carte de la prochaine séance programmée
- Favoris les plus utilisés
- Statistiques du jour
- Liste des séances du jour

### 7. **Statistiques & Analyse**

- Affichage détaillé des séances terminées
- Calcul automatique des statistiques (volume total, nombre de séries, répétitions)
- Évolution des performances sur le temps
- Visualisation des données d'entraînement

## 🏗️ Stack technologique

### Frontend

| Technologie         | Version  | Utilisation                  |
| ------------------- | -------- | ---------------------------- |
| **Next.js**         | 15.5.9   | Framework React avec SSR/SSG |
| **React**           | 19.2.1   | Bibliothèque UI              |
| **React DOM**       | 19.2.1   | Rendu DOM                    |
| **TypeScript/JSX**  | Latest   | Typage statique              |
| **TailwindCSS**     | 4        | Styling CSS utilitaire       |
| **Framer Motion**   | 12.23.24 | Animations fluides           |
| **React Hook Form** | 7.65.0   | Gestion des formulaires      |
| **Zod**             | 4.1.12   | Validation de schémas        |

### État & Données

| Technologie                | Version | Utilisation                                 |
| -------------------------- | ------- | ------------------------------------------- |
| **Zustand**                | 5.0.9   | Gestion d'état global centralisée           |
| **React Query (TanStack)** | 5.90.5  | Gestion du cache et synchronisation serveur |
| **Next-Auth**              | 4.24.11 | Authentification OAuth/JWT                  |

### Base de données & Backend

| Technologie  | Version | Utilisation                        |
| ------------ | ------- | ---------------------------------- |
| **MongoDB**  | 6.20.0  | Base de données NoSQL              |
| **Bcryptjs** | 3.0.2   | Hachage sécurisé des mots de passe |

### UI & Components

| Technologie                  | Version  | Utilisation                                 |
| ---------------------------- | -------- | ------------------------------------------- |
| **Radix UI**                 | Dernière | Composants accessibles ( Dropdown, etc.)    |
| **Lucide React**             | 0.546.0  | Icônes SVG modernes                         |
| **React Icons**              | 5.5.0    | Icônes additionnelles                       |
| **React Big Calendar**       | 1.19.4   | Composant calendrier                        |
| **React Toastify**           | 11.0.5   | Notifications toast                         |
| **React Spinners**           | 0.17.0   | Indicateurs de chargement                   |
| **CMDk**                     | 1.1.1    | Palette de commandes                        |
| **Moment.js**                | 2.30.1   | Manipulation des dates                      |
| **Class Variance Authority** | 0.7.1    | Variantes de composants                     |
| **Clsx**                     | 2.1.1    | Gestion des classes conditionnelles         |
| **Tailwind Merge**           | 3.4.0    | Fusion intelligente des classes TailwindCSS |

### Développement

| Technologie              | Version | Utilisation                             |
| ------------------------ | ------- | --------------------------------------- |
| **Turbopack**            | Latest  | Bundler haute performance (--turbopack) |
| **Tailwind CSS Postcss** | 4       | Traitement du CSS                       |

## 🏛️ Architecture

### Organisation globale

```
src/
├── app/                          # Routes Next.js App Router
│   ├── api/                     # Routes API
│   ├── auth/                    # Pages d'authentification
│   ├── dashboard/               # Tableau de bord
│   ├── calendar/                # Calendrier
│   ├── exercises/               # Gestion des exercices
│   ├── workouts/                # Gestion des programmes
│   ├── sessions/                # Gestion des séances
│   └── layout.js                # Layout racine
├── Features/                     # Fonctionnalités métier
│   ├── Auth/                    # Authentification
│   ├── Calendar/                # Calendrier
│   ├── Dashboard/               # Tableau de bord
│   ├── Exercises/               # Exercices
│   ├── Sessions/                # Séances
│   └── Workouts/                # Programmes
├── Global/                       # Composants & hooks globaux
│   ├── components/              # Composants réutilisables
│   └── hooks/                   # Hooks utilitaires
├── Providers/                    # Providers React (Auth, Modals, Queries)
├── libs/                         # Utilitaires métier (auth, API, DB)
└── middleware.js                # Middleware Next.js
```

### Pattern architectural par Feature

Chaque feature (Feature) suit une structure cohérente :

```
Feature/FeatureName/
├── components/                  # Composants métier
│   ├── index.js                # Exports
│   └── DetailComponent.jsx      # Composants
├── forms/                       # Formulaires
│   ├── index.js
│   ├── NewForm.jsx
│   ├── UpdateForm.jsx
│   └── formsComponents/
├── hooks/                       # Hooks métier
│   ├── index.js
│   ├── useFeatureData.js
│   └── useFeatureHandlers.js
├── modals/                      # Modales spécifiques
│   ├── index.js
│   └── FeatureModal.jsx
├── store/                       # Stores Zustand (si applicable)
│   └── featureStore.js
└── utils/                       # Utilitaires métier
    ├── index.js
    ├── schema.js                # Schémas Zod
    └── helpers.js
```

### Gestion d'état

**Zustand** est utilisé pour la gestion d'état global centralisée :

- **Approche hybride** : actions simples accèdent directement au store, actions complexes utilisent des wrappers avec `useCallback`
- **Sélecteurs** : minimisent les re-rendus inutiles
- **Persist** : état persisté localement quand approprié
- **DevTools** : intégration pour débogage

### Gestion des formulaires

**React Hook Form + Zod** :

- **Validation déclarative** via schémas Zod
- **Validation asynchrone** possible (validation serveur)
- **Performance optimisée** : uniquement les champs modifiés re-rendu
- **Erreurs affichées** en temps réel

### Authentification

**NextAuth.js** avec stratégies multiples :

- **Credentials** : email/mot de passe avec bcrypt
- **OAuth** : Google
- **JWT** : tokens de session
- **Rôles** : ADMIN et USER

## 📦 Installation & Démarrage

### Prérequis

- Node.js 18+
- MongoDB 6.0+
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/yourusername/fitbuilder.git
cd fitbuilder

# Installer les dépendances
npm install
# ou
yarn install
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Authentification
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base de données
MONGODB_URI=mongodb://localhost:27017/fitbuilder

# API externe (optionnel)
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Démarrage en développement

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible à `http://localhost:3000`

### Build pour production

```bash
npm run build
npm run start
# ou
yarn build
yarn start
```

## ⚙️ Configuration

### NextAuth Configuration

Configuration dans `src/libs/auth.js` :

- Providers : Credentials, Google
- Callbacks : `jwt`, `session`, `signIn`
- Base de données MongoDB pour les sessions
- Hachage sécurisé avec bcryptjs

### MongoDB Connection

Utilitaire dans `src/libs/mongodb.js` :

- Pool de connexions réutilisable
- Gestion des erreurs de connexion
- Configuration automatique

### Middleware d'authentification

Middleware dans `src/middleware.js` et `src/libs/authMiddleware.js` :

- Vérification des tokens JWT
- Protection des routes privées
- Redirections automatiques

## 📂 Structure du projet détaillée

### Routes principales

| Route                   | Description            | Authentification |
| ----------------------- | ---------------------- | ---------------- |
| `/`                     | Page d'accueil / Login | Publique         |
| `/signup`               | Inscription            | Publique         |
| `/dashboard`            | Tableau de bord        | Privée           |
| `/workouts`             | Liste des programmes   | Privée           |
| `/workouts/create`      | Créer un programme     | Privée           |
| `/workouts/[id]/edit`   | Éditer un programme    | Privée           |
| `/exercises`            | Liste des exercices    | Privée           |
| `/calendar`             | Calendrier des séances | Privée           |
| `/sessions`             | Historique des séances | Privée           |
| `/sessions/[id]/detail` | Détails d'une séance   | Privée           |
| `/profile`              | Profil utilisateur     | Privée           |

### API Routes

| Endpoint                  | Méthode          | Description                |
| ------------------------- | ---------------- | -------------------------- |
| `/api/auth/[...nextauth]` | GET/POST         | NextAuth callbacks         |
| `/api/auth/signup`        | POST             | Enregistrement utilisateur |
| `/api/exercises`          | GET/POST         | CRUD exercices             |
| `/api/exercises/[id]`     | GET/PATCH/DELETE | Détails exercices          |
| `/api/workouts`           | GET/POST         | CRUD programmes            |
| `/api/workouts/[id]`      | GET/PATCH/DELETE | Détails programmes         |
| `/api/sessions`           | GET/POST         | CRUD séances               |
| `/api/sessions/[id]`      | GET/PATCH/DELETE | Détails séances            |
| `/api/calendar`           | GET              | Événements calendrier      |
| `/api/stats`              | GET              | Statistiques utilisateur   |

## 🎨 Choix techniques principaux

### 1. **Next.js App Router vs Pages Router**

**Choix** : App Router (`/app`)

**Justification** :

- Architecture moderne et flexible
- Streaming et suspense natifs
- Meilleure séparation client/serveur
- Support complet des Server Components

### 2. **Zustand pour la gestion d'état**

**Choix** : Zustand (vs Redux, Context)

**Justification** :

- Boilerplate minimal
- API simple et intuitive
- Bundle size réduit (~1kb)
- Excellent pour les applications de taille moyenne
- Support natif des DevTools

### 3. **React Query (TanStack Query) pour les données serveur**

**Choix** : TanStack Query v5

**Justification** :

- Gestion automatique du cache
- Synchronisation serveur élégante
- Deduplication des requêtes
- Refetch automatique à l'intervalle
- Excellent pour les données asynchrones

### 4. **Zod + React Hook Form pour les formulaires**

**Choix** : Zod (vs Yup, Joi) + React Hook Form (vs Formik)

**Justification** :

- Zod : TypeScript-first, validation déclarative, performant
- RHF : performance optimale, peu de re-rendus
- Intégration seamless avec @hookform/resolvers

### 5. **TailwindCSS pour le styling**

**Choix** : Tailwind v4 (vs styled-components, Sass)

**Justification** :

- Développement rapide avec classes utilitaires
- Bundle size optimisé (purge automatique)
- Design system cohérent
- Responsive design simplifié
- Excellent support de la dark mode

### 6. **MongoDB + NextAuth pour la persistance**

**Choix** : MongoDB (vs PostgreSQL, Firebase)

**Justification** :

- Flexible schema pour évolution rapide
- JSON-like syntax (JavaScript-friendly)
- Scalabilité horizontale facile
- NextAuth intégré nativement

### 7. **Approche hybride pour SessionExecution**

**Choix** : Store centralisé + Context + Wrappers

**Justification** :

- Actions simples : accès direct au store (zéro overhead)
- Actions complexes : wrappers avec logique métier
- Coordination centralisée avec Context
- Props drilling éliminé
- Maintenabilité améliorée

### 8. **Turbopack pour le bundling**

**Choix** : Turbopack (`--turbopack`)

**Justification** :

- 10x plus rapide que Webpack
- Build time drastiquement réduit
- Expérience développeur améliorée
- Présenté comme avenir du bundling Next.js

## 📚 Documentation supplémentaire

Pour plus de détails sur l'implémentation, consultez :

- **[FEATURES.md](./FEATURES.md)** - Description détaillée de chaque feature
- **[Exercises.md](./Exercises.md)** - Flux complet de la feature Exercices (muscles, filtres, formulaires, API)

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Fork le repository
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository.

---

**FitBuilder** - Construisez votre meilleure version 💪
