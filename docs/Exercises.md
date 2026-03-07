# Documentation — Feature Exercices

## Vue d'ensemble

La bibliothèque d'exercices (`src/Features/Exercises/`) est organisée selon le pattern Feature standard du projet. Elle gère trois types d'acteurs : les exercices publics (créés par l'admin), les exercices privés (créés par l'utilisateur) et le système de favoris.

---

## Structure des fichiers

```
src/Features/Exercises/
├── components/
│   └── ExercisesList/
│       ├── ExercisesList.tsx              # Conteneur principal (données + filtres)
│       └── ExercisePageList/
│           ├── ExercisePageList.tsx       # Rendu de la liste avec onglets, filtres, modales
│           ├── ExerciseTabs.tsx           # Onglets Tous / Mes exercices / Favoris
│           ├── ExerciseMuscleFilters.tsx  # Filtres boutons par catégorie musculaire primaire
│           └── ExerciseGroup/
│               ├── ExerciseGroup.tsx      # Groupe d'exercices d'un même muscle
│               └── ExerciseCard.tsx       # Carte d'un exercice (badges muscles, actions)
├── forms/
│   ├── ExerciseFormFields.tsx             # Champs partagés (nom, muscles, équipement, description)
│   ├── NewExerciseForm.tsx                # Formulaire de création
│   └── UpdateExerciseForm.tsx             # Formulaire de mise à jour
├── hooks/
│   ├── useExerciseFilters.ts              # Logique de filtrage (onglets, muscles, recherche)
│   ├── useExercises.ts                    # TanStack Query — liste des exercices
│   ├── useFavorites.ts                    # TanStack Query — favoris
│   ├── useCreateExercise.ts
│   ├── useUpdateExercise.ts
│   └── useDeleteExercise.ts
├── modals/
│   ├── NewExerciseModal.tsx
│   └── UpdateExerciseModal.tsx
└── utils/
    ├── muscleCategory.ts                  # Mapping muscle granulaire → catégorie (ex: "Triceps" → "Bras")
    ├── ExerciseSchema.ts                  # Schéma Zod de validation des formulaires
    └── getExercises.ts                    # Fetcher serveur (unstable_cache)
```

---

## Modèle de données

### Type `Exercise` (`src/types/exercise.ts`)

```ts
type Exercise = {
  exerciseId: string;
  name: string;
  primary_muscle: string;       // Muscle granulaire principal (ex: "Pectoraux supérieurs")
  secondary_muscles: string[];  // Muscles secondaires (ex: ["Triceps", "Deltoïde antérieur"])
  equipment: string;
  description?: string;
  isPublic: boolean;            // true = exercice admin, false = exercice utilisateur
  userId?: string;
};
```

### Document MongoDB (`src/models/ExerciseDocument.ts`)

Même structure que `Exercise`, avec `_id: ObjectId` au lieu de `exerciseId: string`. La transformation est faite dans le Repository.

---

## Système de muscles

### Deux niveaux

| Niveau | Champ | Rôle |
|---|---|---|
| **Muscle granulaire** | `primary_muscle` / `secondary_muscles[]` | Granularité fine, stocké en base |
| **Catégorie** | calculée via `getMuscleCategory()` | Regroupement pour filtres et affichage |

### Mapping muscle → catégorie (`muscleCategory.ts`)

```ts
"Pectoraux supérieurs" → "Poitrine"
"Grand dorsal"         → "Dos"
"Deltoïde antérieur"   → "Épaules"
"Biceps"               → "Bras"
"Quadriceps"           → "Jambes"
"Grand fessier"        → "Fessiers"
"Abdominaux"           → "Core"
"Corps entier"         → "Autre"
"Cardio"               → "Autre"
```

La fonction `getMuscleCategory(muscle: string)` retourne la catégorie ou le muscle lui-même si non trouvé.

### Liste complète des muscles disponibles

**Poitrine** : Pectoraux supérieurs, Pectoraux moyens, Pectoraux inférieurs

**Dos** : Grand dorsal, Rhomboïdes, Trapèzes, Érecteurs du rachis

**Épaules** : Deltoïde antérieur, Deltoïde médial, Deltoïde postérieur

**Bras** : Biceps, Triceps, Avant-bras, Brachialis

**Jambes** : Quadriceps, Ischio-jambiers, Adducteurs, Mollets

**Fessiers** : Grand fessier, Moyen fessier

**Core** : Abdominaux, Obliques, Core profond

**Autre** : Corps entier, Cardio

---

## Ajouter un nouveau muscle

1. **`muscleCategory.ts`** — Ajouter l'entrée dans `MUSCLE_TO_CATEGORY` :
   ```ts
   "Nouveau muscle": "Catégorie existante",
   ```

2. **`ExerciseFormFields.tsx`** — Ajouter dans le tableau `MUSCLE_GROUPS` :
   ```ts
   { label: "Catégorie", muscles: [..., "Nouveau muscle"] }
   ```

3. Si c'est une nouvelle catégorie, créer également une entrée dans `MUSCLE_GROUPS` avec un nouveau `label`.

4. Vérifier les tests : `src/Features/Exercises/utils/__tests__/muscleCategory.test.ts` (ajouter un cas si nécessaire).

---

## Flux de filtrage (`useExerciseFilters.ts`)

Le hook centralise toute la logique de filtrage. Il suit cet ordre :

```
Tous les exercices
  → Filtre recherche (search)
  → Filtre onglet (all / mine / favorites)
  → [calcul des compteurs stables ici]
  → Filtre catégorie primaire (selectedMuscle)
  → [calcul des muscles secondaires disponibles ici]
  → Filtre muscle secondaire (selectedSecondaryMuscle)
  → Groupage par catégorie (grouped)
```

### États du hook

| État | Type | Valeur initiale | Description |
|---|---|---|---|
| `activeTab` | `string` | `"all"` | Onglet actif |
| `selectedMuscle` | `string` | `"all"` | Catégorie primaire filtrée |
| `selectedSecondaryMuscle` | `string` | `"all"` | Muscle secondaire filtré |
| `search` | `string` | `""` | Texte de recherche |

### Valeurs retournées

| Valeur | Type | Description |
|---|---|---|
| `grouped` | `Record<string, Exercise[]>` | Exercices groupés par catégorie (après tous les filtres) |
| `counts` | `{ all, mine, favorites }` | Compteurs pour les onglets |
| `muscleCounts` | `Record<string, number>` | Compteurs par muscle (après filtres) |
| `fixedMuscleCounts` | `Record<string, number>` | Compteurs par muscle (avant filtre muscle, stables) |
| `allExerciseMuscles` | `string[]` | Catégories disponibles (onglet "Tous") |
| `myExerciseMuscles` | `string[]` | Catégories disponibles (onglet "Mes exercices") |
| `favoriteExerciseMuscles` | `string[]` | Catégories disponibles (onglet "Favoris") |
| `availableSecondaryMuscles` | `string[]` | Muscles secondaires disponibles après filtre primaire |

### Comportement du reset

Quand le muscle primaire change (`setSelectedMuscle`), le secondaire est automatiquement resetté à `"all"`. Cela est géré par le wrapper interne `handleSetSelectedMuscle`.

---

## Filtre muscle granulaire (`<select>` natif)

Un `<select>` natif HTML est affiché sous les filtres de catégorie (boutons). Son comportement dépend du filtre primaire actif.

### Mode "Tous" (`selectedMuscle === "all"`)

Le select affiche tous les muscles primaires granulaires disponibles, **groupés par catégorie** via `<optgroup>` :

```
-- Tous les muscles --
  Bras
    Biceps
    Triceps
  Poitrine
    Pectoraux inférieurs
    Pectoraux supérieurs
  ...
```

Choisir un muscle filtre la liste par `primary_muscle === valeur`.

### Mode catégorie (`selectedMuscle !== "all"`)

Le select affiche les **muscles secondaires** des exercices de la catégorie sélectionnée (liste plate). Choisir un muscle filtre par `secondary_muscles.includes(valeur)`.

### Visibilité

- Mode "Tous" : visible si `muscleSelectGroups.length > 0` (i.e., il y a des exercices)
- Mode catégorie : visible si `availableSecondaryMuscles.length > 0`

### Reset

- Le filtre granulaire (`selectedSecondaryMuscle`) se remet à `"all"` automatiquement quand la catégorie primaire change.
- L'option `-- Tous les muscles --` / `-- Tous les muscles secondaires --` remet le filtre à `"all"`.

---

## Flux de création/modification d'un exercice

### Schéma Zod (`ExerciseSchema.ts`)

```ts
{
  name: string (requis, min 1, max 50)
  primary_muscle: string (requis)
  secondary_muscles: string[] (optionnel)
  equipment: string (requis)
  description: string (optionnel)
}
```

### Sélection des muscles dans le formulaire

Le formulaire utilise une grille de badges cliquables (`ExerciseFormFields.tsx`). La logique de sélection :

- **Cliquer sur un muscle non sélectionné** :
  - Si aucun primaire → devient primaire
  - Si primaire déjà pris → devient secondaire
- **Cliquer sur le primaire** :
  - Si des secondaires existent → le premier secondaire devient primaire
  - Sinon → désélection complète
- **Cliquer sur un secondaire** → désélection

### Couche API

```
POST   /api/exercises         → ExerciseService.createExercise()
PATCH  /api/exercises/[id]    → ExerciseService.updateExercise()
DELETE /api/exercises/[id]    → ExerciseService.deleteExercise()
POST   /api/exercises/favorites → ExerciseService.toggleFavorite()
```

Chaque route :
1. Appelle `requireAuth(req)` ou `requireAdmin(req)`
2. Valide le body avec Zod
3. Appelle le service
4. Appelle `revalidateTag("exercises")` après mutation
5. Retourne `ApiSuccess` ou `ApiError`

---

## Système de favoris

- Stocké dans `users.favoritesExercises[]` (tableau d'IDs)
- Toggle via `POST /api/exercises/favorites`
- Récupéré via `useFavorites({ userId, initialData })`
- Affiché dans l'onglet "Favoris" de la bibliothèque

---

## Différence admin vs utilisateur

| Action | USER | ADMIN |
|---|---|---|
| Voir les exercices publics | ✅ (onglet "Tous") | ✅ (onglet "Tous" = ses exercices publics) |
| Créer un exercice | ✅ (privé) | ✅ (public, visible par tous) |
| Modifier un exercice | ✅ (seulement ses privés) | ✅ (n'importe quel public) |
| Supprimer un exercice | ✅ (seulement ses privés) | ✅ (n'importe quel public) |
| Favoris | ✅ | ✅ |

---

## Tests

Les tests du service sont dans `src/services/__tests__/ExerciseService.test.ts` (20 tests).

Ils couvrent :
- Création (admin vs non-admin, validation)
- Mise à jour (ownership, champs)
- Suppression (guard ownership)
- Toggle favoris

Les tests du mapping muscle sont dans `src/Features/Exercises/utils/__tests__/muscleCategory.test.ts`.
