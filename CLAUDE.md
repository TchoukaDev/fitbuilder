# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Turbopack)
npm run dev

# Build (Turbopack)
npm run build

# Start production server
npm run start
```

There is no test suite configured in this project.

## Architecture Overview

FitBuilder is a Next.js 15 fitness tracking app (App Router) backed by MongoDB Atlas, with NextAuth v4 for authentication and Zustand for client state.

### Route Structure

```
src/app/
  (authenticated)/       # Route group — requires session (enforced by middleware)
    layout.tsx           # Wraps all authenticated pages with <Header />
    dashboard/
    workouts/            # CRUD for workout plans
    sessions/            # Workout session execution & history
    exercises/           # Exercise library
    calendar/            # Scheduled sessions calendar
    profile/
  api/                   # Next.js API routes (REST)
  admin/                 # ADMIN role only
  page.tsx               # Login page (public)
  signup/
  verify-email/
  resend-verification/
```

### Authentication

- **NextAuth v4** configured in `src/libs/auth.ts` with two providers: Google OAuth and Credentials (email/password)
- **JWT strategy** — session data lives in a cookie, not the database
- **Session fields** extended in `src/types/next-auth.d.ts`: `id`, `username`, `role`, `blocked`, `provider`
- **Route protection** handled by `src/middleware.ts` — protected routes redirect unauthenticated users to `/`; authenticated users on public-only routes are redirected to `/dashboard`
- **Admin role**: set by matching `session.user.email === process.env.ADMIN_EMAIL`
- **API route auth**: call `requireAuth(req)` (or `requireAdmin(req)`) from `src/libs/authMiddleware.ts` at the top of every API route handler

### Database

- MongoDB Atlas — connection singleton in `src/libs/mongodb.ts` via `connectDB()`
- **Schema**: all user data (workouts, exercises, sessions, favorites) is embedded in the `users` collection document. The global `exercises` collection holds public exercises
- **Type pattern**: every entity has a `*DB` type (with `ObjectId`) and an app-facing type (with `string` id). Always transform `_id → id` when returning data to the client
- Data-fetching server functions use `unstable_cache` with `revalidate: 300` and named tags (`"workouts"`, `"exercises"`, `"favorites"`). Call `revalidateTag(tag)` or `revalidatePath(path)` after mutations in API routes

### Feature Organization (`src/Features/`)

Each feature (`Auth`, `Calendar`, `Dashboard`, `Exercises`, `Sessions`, `Workouts`) follows this internal structure:

```
components/   # React components (UI)
forms/        # react-hook-form forms with Zod schemas
hooks/        # Custom hooks (data fetching via TanStack Query, UI logic)
modals/       # Modal components
store/        # Zustand store (if needed)
utils/        # Server-side data fetchers, Zod schemas, helpers
```

Barrel `index.ts` files are used throughout — always import from the barrel, not from individual files.

### Global Shared Code (`src/Global/`)

- `components/layout/` — `Header`, `Navbar`, `Footer`, `ModalLayout`
- `components/ui/` — shared UI primitives (Buttons, form components, Loader)
- `components/ui/shadcn/` — shadcn/ui components (button, dropdown-menu)
- `hooks/` — `useBlockScroll`, `useUnsavedChanges`
- `store/unsavedStore.tsx` — global Zustand store for tracking unsaved form changes

### State Management

- **Workouts form**: uses a Zustand store-per-instance pattern via `WorkoutStoreProvider` + `useWorkoutStore`. Each form mounts its own provider to isolate state. Exercises are auto-saved to `localStorage` key `"exercises"`.
- **Session execution**: global singleton Zustand store (`useSessionStore`) with localStorage backup under key `session_backup_<sessionId>`.
- **Modals**: `ModalContext` / `useModals` hook — open/close modals by string name with optional data payload. All modals are auto-closed on route change.
- **Server data**: TanStack Query (`@tanstack/react-query`) for client-side caching of API responses (see hooks in `Features/*/hooks/useQuery*`)

### Providers (wrapping the whole app in `src/app/layout.tsx`)

`AuthProvider` → `QueryClientProvider` → `ModalProvider` → children

### API Conventions

- All API responses use standardised objects from `src/libs/apiResponse.ts` (`ApiError.*`, `ApiSuccess.*`)
- Always call `requireAuth` / `requireAdmin` first and return early if it returns a `NextResponse`
- Validate request bodies with Zod schemas before touching the database
- After write operations call `revalidatePath` and/or `revalidateTag` to bust the `unstable_cache`

### Path Aliases

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `jsconfig.json`).

### Mixed JS/TS

Some files (Calendar forms, a few API routes) are plain `.js`/`.jsx`. New files should use TypeScript.

### Environment Variables Required

```
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ADMIN_EMAIL
```

---

## ✅ Étape 1 — Refactorisation Repository/Service (TERMINÉE)

### Architecture implémentée

```
Route (HTTP layer)       → valide req, appelle service, retourne ApiSuccess/ApiError
Service (business logic) → règles métier, transformations, orchestration
Repository (data access) → requêtes MongoDB, transformation _id → id
```

### Fichiers créés

```
src/
  repositories/
    WorkoutRepository.ts
    ExerciseRepository.ts
    SessionRepository.ts
    StatsRepository.ts
  services/
    WorkoutService.ts
    ExerciseService.ts
    SessionService.ts
    StatsService.ts        ← documentation dans StatsService.md
```

### Routes refactorisées

- `src/app/api/workouts/route.ts` + `[id]/route.ts`
- `src/app/api/exercises/route.ts` + `[id]/route.ts` + `favorites/route.ts`
- `src/app/api/sessions/route.ts` + `[id]/route.ts`
- `src/app/api/stats/route.ts` (converti de `.js` → `.ts`)

### Règles de la couche de données

- `unstable_cache` + helpers (`src/Features/*/utils/get*.ts`) = **Server Components uniquement** (chargement initial de page)
- Routes API = appellent **directement le service**, jamais les helpers cachés
- Après toute mutation : `revalidateTag(...)` ET `queryClient.invalidateQueries(...)` côté client

### Erreurs métier disponibles (`src/libs/ServicesErrors.ts`)

| Classe | HTTP | Usage |
|---|---|---|
| `UnauthorizedError` | 401 | userId manquant |
| `ForbiddenError` | 403 | ressource appartenant à un autre user |
| `NotFoundError` | 404 | document introuvable |
| `DuplicateError` | 409 | nom déjà utilisé |
| `ValidationError` | 400 | règle métier violée |
| `DbError` | 500 | erreur MongoDB inattendue |

---

## 🔜 Étape 2 — Tests (À FAIRE)

### Objectif

Couvrir la logique métier des services avec des tests automatisés.

### Stack recommandée

- **Vitest** (compatible Next.js 15 + Turbopack, plus rapide que Jest)
- **`@testing-library/react`** pour les composants
- **`mongodb-memory-server`** pour les tests d'intégration des repositories

### Plan

1. Configurer Vitest dans le projet (`vitest.config.ts`)
2. **Tests unitaires des Services** — logique pure, mocker le repository
   - `WorkoutService` : règle d'unicité du nom, mise à jour `timesUsed`
   - `SessionService` : `buildSessionExercises`, `computeWorkoutStatsAfterRemoval`
   - `StatsService` : `computeStreak` (cas limites DST, streak = 0, streak > 1), `computeVolume`, `computeTotalDuration`
3. **Tests d'intégration des Repositories** — avec `mongodb-memory-server`
   - `WorkoutRepository.findAll`, `create`, `update`, `delete`
   - `SessionRepository.start`, `cancel`, `complete`

### Priorité haute

`StatsService.computeStreak` — algorithme complexe, plusieurs cas limites documentés dans `src/services/StatsService.md`.

---

## 🔜 Étape 3 — Restructuration MongoDB (À FAIRE)

### Problème actuel

Tout est embarqué dans le document `users` :
- `users.workouts[]`
- `users.sessions[]`
- `users.exercises[]`

Conséquences : pagination en mémoire, document qui grossit indéfiniment, indexes inefficaces.

### Cible

```
Collections séparées :
  workouts    { userId, name, exercises[], timesUsed, ... }
  sessions    { userId, workoutId, exercises[], status, ... }
  exercises   { userId | null (public), name, muscle, ... }
  users       { email, role, favoritesExercises[], ... }
```

### Plan d'exécution

1. Écrire le script de migration (`scripts/migrate.ts`)
2. Mettre à jour les **Repositories uniquement** (seul layer à modifier grâce à l'étape 1)
3. Ajouter des indexes MongoDB (`userId`, `status`, `scheduledDate`)
4. Tester la migration sur un dump de données de dev

> ⚠️ Faire **après** l'étape 2 (tests) pour valider qu'il n'y a pas de régression.

---

## 🔜 Étape 4 — Refonte Mobile-First (À FAIRE)

### Problème actuel

- Navigation desktop-first (header horizontal)
- Zones de tap trop petites (< 44px)
- Pas de bottom navigation bar (standard apps fitness)
- Formulaires non optimisés pour le clavier mobile

### Cible

- **Bottom navigation bar** sur mobile (Dashboard, Workouts, Sessions, Exercises)
- **Header simplifié** mobile (titre + actions contextuelles)
- **Cards touch-friendly** (zones ≥ 44px, swipe actions)
- **Formulaires mobiles** (clavier numérique pour poids/reps, scroll naturel)

### Fichiers clés à modifier

- `src/Global/components/layout/Header.tsx` — refonte responsive
- `src/Global/components/layout/Navbar.tsx` — bottom nav mobile
- `src/app/(authenticated)/layout.tsx` — layout principal
- Composants Sessions (use case principal sur mobile)

### Ordre recommandé

1. Audit : identifier les écrans les plus utilisés sur mobile
2. Layout global (bottom nav)
3. Feature par feature : commencer par l'exécution de session
