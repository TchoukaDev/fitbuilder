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

Tests unitaires configurés avec **Vitest** (`npm test` / `npm run test:run`). Fichiers dans `src/services/__tests__/`.

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
ANTHROPIC_API_KEY   # Requis pour le chatbot FitBot
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

## ✅ Étape 2 — Tests (TERMINÉE)

### Ce qui a été fait

- **Vitest** configuré (`vitest.config.ts`, alias `@/*`, environment node)
- **Husky** pre-commit : bloque les `console.log` + lance les tests
- **80 tests** tous verts au pre-commit

### Fichiers de tests

```
src/services/__tests__/
  StatsService.test.ts     — 15 tests (streak, durée, volume, guards)
  WorkoutService.test.ts   —  9 tests (create, update, delete)
  SessionService.test.ts   — 12 tests (buildSessionExercises, cancel, guards)
  ExerciseService.test.ts  — 20 tests (admin/non-admin, favorites)

src/Features/Sessions/store/__tests__/
  sessionStore.test.ts     — 13 tests (completeExercise, reopen, toggle, update)

src/Features/Workouts/store/__tests__/
  workoutStore.test.ts     — 11 tests (add, remove, update, move)
```

### Reste à faire (optionnel)

- Tests d'intégration des Repositories avec `mongodb-memory-server` — à faire après l'étape 3 (refonte MongoDB)

---

## ✅ Étape 3 — Restructuration MongoDB (TERMINÉE)

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

## ✅ Étape 4 — Refonte Mobile-First (TERMINÉE)

### ✅ Réalisé

**Layout global**
- `Header.tsx` — version mobile simplifiée (titre centré) + desktop conservé
- `NavbarClient.tsx` — bottom navigation bar fixe sur mobile (`fixed bottom-0 z-50 h-16`)
- `authenticated/layout.tsx` — `pb-20 lg:pb-0` pour laisser place à la bottom nav
- `LogoutButton.tsx` — variante mobile dans la bottom nav

**Composants UI**
- `Button` — migré vers `cva` variants typés (`variant="close"` remplace le prop booléen `close`)
- `LoaderButton` — `disabled={disabled || isLoading}` (auto-disable pendant le chargement)
- `.input` (globals.css) — `w-full` au lieu de largeur fixe
- `.modalFooter` (globals.css) — `flex-col sm:flex-row` (boutons empilés sur mobile)

**Modales**
- `ModalLayout` — z-index `z-[60]` (au-dessus de la bottom nav `z-50`), `p-4` mobile, close button avec zone de tap `p-2`
- `ModalHeader` — `pr-10` pour éviter le chevauchement avec le bouton de fermeture
- Toutes les modales Sessions — suppression du double-padding intérieur
- `RestTimerModal` — redesign mobile : grid 2-cols boutons principaux, grid 4-cols préréglages, `tabular-nums`, `inputMode="numeric"`

**Formulaires & inputs**
- `inputMode="decimal"` sur les inputs de poids (clavier décimal mobile)
- `inputMode="numeric"` sur les inputs entiers (reps, séries, RPE, timer)
- `parseFloat(value.replace(",", "."))` sur tous les inputs décimaux (fix locale FR)
- `SetRow` — checkbox `w-5 h-5` (touch target suffisant)

**SessionExecution**
- Padding `p-4 lg:p-6`, titre `text-xl lg:text-3xl`
- Bouton Abandonner avec `py-2 px-4`
- Footer sticky `bottom-16 lg:bottom-0` (au-dessus de la bottom nav)

**Exercises**
- `ExerciseTabs` + `ExerciseMuscleFilters` — `overflow-x-auto` + `shrink-0` (scroll horizontal au lieu de wrap)
- Touch targets `py-3` sur les filtres/tabs

**Calendar**
- `MobileCalendar.tsx` — composant custom remplaçant React Big Calendar sur mobile
  - Grille mensuelle avec navigation mois précédent/suivant
  - Sélection d'un jour → liste des événements du jour
  - Même système d'events/callbacks/modales que le desktop
  - Détection `isMobile` via `window.innerWidth < 768` dans `useCalendarStates`

### 🔜 Reste à faire

- **Footer** — ajouter `pb-24 lg:pb-10` pour éviter le chevauchement avec la bottom nav
- **Dashboard** — vérifier padding mobile et touch targets des StatCards
- **Sessions list** — vérifier filtres, pagination et chevauchement bottom nav
- **Workouts list** — vérifier touch targets et padding mobile

---

## ✅ Étape 5 — Refactorisation du système de validation des exercices en séance (TERMINÉE)

### Problème identifié

Le système de validation des exercices pendant une séance (`src/Features/Sessions/`) est jugé trop complexe et peu lisible :
- Fonctions avec trop de responsabilités
- Logique difficile à suivre et fragile
- Difficulté à maintenir et faire évoluer

### Objectif

Simplifier et clarifier la logique de validation sans en changer le comportement :
- Identifier toutes les fonctions impliquées (`completeExercise`, store, hooks associés)
- Réduire la complexité, améliorer la lisibilité
- S'assurer que le reset des séries non complétées (`weight: 0`, `reps: 0`) est bien isolé et explicite

> ⚠️ Faire **après** l'étape 2 (tests) pour avoir un filet de sécurité avant de refactoriser.

---

## ✅ Étape 6 — Filtre muscles secondaires + Combobox + flag Cardio (TERMINÉE)

### Ce qui a été fait

- **`muscleCategory.ts`** — ajout de `"Cardio": "Autre"` dans le mapping
- **`ExerciseFormFields.tsx`** — ajout de "Cardio" dans le groupe "Autre" du formulaire
- **`useExerciseFilters.ts`** — ajout de `selectedSecondaryMuscle`, `availableSecondaryMuscles`, `muscleSelectGroups`, reset automatique quand le primaire change
- **`ExercisesList.tsx` + `ExercisePageList.tsx`** — `<select>` natif affiché après les filtres primaires
- **`ExerciseSelector.tsx`** (workout) — même logique

### Comportement du `<select>` natif

- **Filtre "Tous"** : options groupées par catégorie (`<optgroup>`) — filtre sur le muscle primaire granulaire
- **Filtre catégorie** : liste plate des muscles secondaires disponibles pour cette catégorie
- Changer de catégorie primaire → le filtre granulaire se remet à "Tous"

### Documentation

- `docs/Exercises.md` — documentation complète du flux Exercices (muscles, filtres, formulaires, API, Combobox)
- `docs/FEATURES.md` — section Exercices mise à jour
- `docs/README.md` — fonctionnalités mises à jour + lien vers Exercises.md

---

## ✅ Étape 7 — Chatbot IA FitBot (TERMINÉE — branche `feature/chatbot`)

### Architecture

```
src/Features/Chat/
  components/
    ChatFAB.tsx       # Bouton flottant (FAB) avec badge non lus
    ChatInput.tsx     # Input + bouton envoi (Entrée = envoyer, Shift+Entrée = saut de ligne)
    ChatMessage.tsx   # Bulle de message (user = bleue droite / assistant = grise gauche)
    ChatPanel.tsx     # Panel principal : cycle envoi → stream SSE → mise à jour store
  store/
    chatStore.ts      # Zustand persist — messages, isOpen, isLoading, unreadCount
  utils/
    systemPrompt.ts   # Prompt système FitBot (rôle, fonctionnalités, règles)
  index.ts

src/app/api/chat/
  route.ts            # POST — streaming SSE via Anthropic SDK
```

### Fonctionnement

- **API** : `POST /api/chat` — reçoit `messages[]` (historique complet), stream SSE (`text/event-stream`)
- **Modèle** : `claude-haiku-4-5` (rapide, économique)
- **Auth** : `requireAuth` — accessible aux utilisateurs connectés uniquement
- **Store** : historique persisté dans `localStorage` (`chat_history`), états temporaires (`isOpen`, `isLoading`, `unreadCount`) non persistés

### Cycle d'envoi d'un message (`ChatPanel.handleSend`)

1. `addMessage({ role: "user" })` → message utilisateur affiché immédiatement
2. `addMessage({ role: "assistant", content: "" })` → placeholder vide (indicateur `...`)
3. `fetch POST /api/chat` avec l'historique (hors placeholder)
4. Lecture du stream SSE chunk par chunk → `updateLastAssistantMessage(accumulated)`
5. `finally` : `setIsLoading(false)` + `incrementUnread()` si le panel est fermé

### Badge non-lus (`unreadCount`)

- Incrémenté **une seule fois** à la fin du stream (`finally` dans `ChatPanel`), uniquement si `!isOpen`
- Remis à 0 quand l'utilisateur ouvre le panel (`setIsOpen(true)`)
- ⚠️ `setIsOpen(false)` ne doit PAS passer `unreadCount: undefined` — Zustand écrirait `undefined` en dur et le badge ne s'afficherait plus jamais

### Scroll automatique

- `scrollContainerRef` sur le div scrollable des messages
- `useEffect([messages, isLoading, isOpen])` : `el.scrollTop = el.scrollHeight`
- `isOpen` dans les dépendances est indispensable : sans lui, la réouverture du panel (remount) ne déclencherait pas le scroll

### Variables d'environnement

```
ANTHROPIC_API_KEY   # Clé API Anthropic (requis)
```

### Intégration layout

Le FAB et le panel sont intégrés dans `src/app/(authenticated)/layout.tsx` (au-dessus de la bottom nav sur mobile).

### Z-index

- Bottom nav : `z-50`
- Modales : `z-[60]`
- ChatFAB + ChatPanel : `z-[70]` (toujours au-dessus)
