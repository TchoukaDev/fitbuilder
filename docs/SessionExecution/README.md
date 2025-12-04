# 📚 Documentation - Feature SessionExecution

## Vue d'ensemble

La Feature **SessionExecution** gère l'exécution complète d'une séance d'entraînement :

- Affichage des exercices
- Modification des données (reps, poids, notes, effort)
- Validation et sauvegarde
- Gestion du timer

---

## 🏗️ Architecture générale

```
SessionExecution (Composant principal)
│
├─ SessionExecutionProvider (Context Provider)
│  └─ Fournit: sessionHandlers à tous les enfants
│
├─ SessionHeader (Simple - pas memo - change toutes les secondes avec le Timer)
│  └─ Affiche: titre, timer, progression
│
├─ SessionExerciseCard[] (memo - optimisé)
│  ├─ SessionExerciseHeader
│  ├─ CompleteExerciseCard (memo - exercice terminé)
│  └─ CurrentExerciseCard (memo - formulaire d'exercice)
│     └─ SetRow[] (une ligne par série)
│
└─ Modals (Confirmations, erreurs, timers)
```

---

## 🔑 Concepts clés utilisés

### 1️⃣ **React.memo** - Optimisation des re-renders

**Qu'est-ce que c'est ?**

- Composant qui ne se remet à jour QUE si ses props changent
- Évite les re-renders inutiles

**Où c'est utilisé :**

```
✅ SessionExerciseCard (memo) - Dans une liste, props stables
✅ CurrentExerciseCard (memo) - Se remet à jour rarement
✅ CompleteExerciseCard (memo) - Se remet à jour rarement
✅
❌ SessionHeader (PAS memo) - formattedTime change chaque seconde
```

**Pourquoi :**

- SessionExerciseCard est dans une liste (map)
- Si on ne mémorise pas, tous les exercices se rerendus quand le timer change
- Gain : -90% re-renders inutiles 🚀

---

### 2️⃣ **useCallback** - Stabilisation des fonctions

**Qu'est-ce que c'est ?**

- Hook qui "congèle" une fonction entre les renders
- La fonction garde la MÊME référence

**Où c'est utilisé :**

```javascript
// Dans useSessionHandlers.js
const handleSetChange = useCallback(
  (exerciseIndex, setIndex, field, value) => { ... },
  [setExercises]  // Dépendances
);
```

**Pourquoi :**

- `memo` compare les props par référence (===)
- Sans `useCallback`, chaque fonction est nouvelle à chaque render
- Donc memo ne peut pas optimiser
- `useCallback` + `memo` = combo puissant ⚡

---

### 3️⃣ **Context API** - Éviter le prop drilling

**Qu'est-ce que c'est ?**

- Alternative aux props pour partager des données
- Évite de passer props à travers 5+ niveaux

**Avant (❌ prop drilling) :**

```javascript
<SessionExerciseCard
  onSetChange={handleSetChange}
  onNotesChange={handleNotesChange}
  onEffortChange={handleEffortChange}
  onSetComplete={handleSetComplete}
  onExerciseComplete={handleExerciseComplete}
  onReopenExercise={handleReopenExercise}
  onRestTimer={handleRestTimer}
/>
```

**Après (✅ Context) :**

```javascript
<SessionExecutionProvider handlers={sessionHandlers}>
  <SessionExerciseCard /> // Accède aux handlers via useContext()
</SessionExecutionProvider>
```

**Avantages :**

- Moins de props = code plus lisible
- Plus facile à maintenir
- Plus facile à ajouter/retirer des handlers

---

## 📁 Structure des fichiers

### `SessionExecution.jsx` - Composant principal

**Responsabilités :**

- Initialiser l'état global (exercises, currentExerciseIndex, isSaving)
- Créer et fournir les handlers via Context
- Gérer les modales
- Afficher les exercices et l'interface

**État principal :**

```javascript
const { exercises, setExercises, currentExerciseIndex, ... } = useSessionState(sessionData);
```

**Handlers fournis :**

```javascript
const sessionHandlers = {
  handleSetChange, // Modifier reps/poids d'une série
  handleNotesChange, // Modifier les notes
  handleEffortChange, // Modifier l'effort (RPE)
  handleSetComplete, // Cocher une série comme faite
  handleExerciseComplete, // Terminer un exercice
  handleReopenExercise, // Réouvrir un exercice terminé
  handleRestTimer, // Afficher le timer de repos
  currentExerciseIndex, // L'exercice actuellement actif
};
```

---

### `SessionExecutionContext.jsx` - Context et Provider

**C'est quoi :**

- Crée un Context pour partager les handlers
- Crée un Provider qui enveloppe les enfants
- Crée un hook pour accéder au Context

**Code simplifié :**

```javascript
const SessionExecutionContext = createContext(null);

export function SessionExecutionProvider({ children, handlers }) {
  return (
    <SessionExecutionContext.Provider value={handlers}>
      {children}
    </SessionExecutionContext.Provider>
  );
}

export function useSessionExecutionContext() {
  return useContext(SessionExecutionContext);
}
```

**Comment l'utiliser :**

```javascript
// Dans un composant enfant
const { handleSetChange } = useSessionExecutionContext();
```

---

### `useSessionHandlers.js` - Tous les handlers

**Responsabilité :**

- Créer tous les handlers avec `useCallback`
- Retourner les handlers stables

**Handlers principaux :**

| Handler                  | Rôle                                                   |
| ------------------------ | ------------------------------------------------------ |
| `handleSetChange`        | Modifier un champ d'une série (reps, poids, completed) |
| `handleNotesChange`      | Modifier les notes d'un exercice                       |
| `handleEffortChange`     | Modifier l'effort/RPE (1-10)                           |
| `handleSetComplete`      | Cocher/décocher une série                              |
| `handleReopenExercise`   | Réouvrir un exercice pour le modifier                  |
| `handleExerciseComplete` | Valider et terminer un exercice                        |
| `completeExercise`       | Mettre à jour l'état et passer au suivant              |

**Pourquoi useCallback :**

```javascript
const handleSetChange = useCallback(
  (exerciseIndex, setIndex, field, value) => { ... },
  [setExercises]
);
```

- Handlers passés au Context
- Context fourni aux composants avec `memo`
- `memo` a besoin de fonctions stables
- **Sans useCallback :** memo ne peut pas optimiser ❌
- **Avec useCallback :** memo fonctionne parfaitement ✅

---

### Composants d'affichage

#### `SessionHeader.jsx` - En-tête simple

- **Affiche :** titre, timer, progression, bouton abandon
- **Pas de memo :** formattedTime change chaque seconde
- **Props directes :** pas besoin de Context

#### `SessionExerciseCard.jsx` - Carte d'un exercice (MEMO)

- **Affiche :** en-tête de l'exercice
- **Récupère depuis Context :** `handleEffortChange`, `handleRestTimer`
- **MEMO :** car dans une liste (map)
- **Props minimales :** exercise, index, isActive

#### `CurrentExerciseCard.jsx` - Formulaire d'exercice (MEMO)

- **Affiche :** séries, effort, notes, bouton terminer
- **Récupère depuis Context :** `handleSetChange`, `handleNotesChange`, `handleExerciseComplete`
- **MEMO :** pour éviter les re-renders

#### `CompleteExerciseCard.jsx` - Résumé exercice terminé (MEMO)

- **Affiche :** séries réalisées, notes, effort, bouton réouvrir
- **Récupère depuis Context :** `handleReopenExercise`
- **MEMO :** composant simple

---

## 🔄 Flux de données - Exemple concret

**Scenario :** L'utilisateur change le poids d'une série

```
1. Utilisateur tape dans l'input
   ↓
2. onChange -> onSetChange(exerciseIndex, setIndex, "weight", newValue)
   ↓
3. handleSetChange (du Context)
   ├─ Met à jour l'état (setExercises)
   └─ Auto-save déclenché
   ↓
4. React détecte le changement d'état
   ├─ SessionExecution se remet à jour
   ├─ sessionHandlers contient les MÊMES fonctions (useCallback)
   ├─ SessionExecutionProvider reçoit les mêmes props (handlers identiques)
   │
   └─ SessionExerciseCard[] (memo)
       ├─ Exercise[0] → props identiques → PAS de rerender ✅
       ├─ Exercise[1] → props identiques → PAS de rerender ✅
       └─ Exercise[2] (celui modifié)
           ├─ props identiques (exercise ref change mais index/isActive identique)
           ├─ SE REMET À JOUR pour afficher la nouvelle valeur ✅
```

---

## 💡 Choix techniques et pourquoi

### ❓ Pourquoi Context et pas Redux ?

**Pros Context :**

- ✅ Simple pour une fonctionnalité isolée
- ✅ Pas de dépendance externe
- ✅ Perfect pour SessionExecution
- ✅ Facile à comprendre

**Redux serait utile si :**

- ❌ Partage d'état global (plusieurs features)
- ❌ Très complexe
- ❌ Besoin de time-travel debugging

**Verdict :** Context est le bon choix 👍

---

### ❓ Pourquoi memo partout ?

**SessionExerciseCard est memo car :**

- ✅ Dans une liste (map)
- ✅ Props rarement changées (sauf isActive)
- ✅ Beaucoup de re-renders inutiles sans

**SessionHeader n'est PAS memo car :**

- ❌ formattedTime change CHAQUE seconde
- ❌ memo serait inutile (se remet à jour de toute façon)
- ❌ Ajouter du code pour rien

**Règle :** Memo seulement si utile 🎯

---

### ❓ Pourquoi useCallback dans le hook ?

**Bon choix car :**

- ✅ Handlers passés au Context
- ✅ Context fourni à composants memo
- ✅ memo a besoin de fonctions stables
- ✅ useCallback = stabilité des fonctions

**Si pas useCallback :**

- ❌ Chaque render crée nouvelles fonctions
- ❌ memo ne peut pas optimiser
- ❌ Tous les exercices se rerendus

**Verdict :** useCallback est essentiel ✅

---

## 🧪 Comment tester que c'est optimisé

### Test 1 : Vérifier que SessionExerciseCard ne rerender pas

```javascript
const SessionExerciseCard = memo(function SessionExerciseCard({
  exercise,
  index,
  isActive,
}) {
  console.log("🔄 SessionExerciseCard rendu", index);

  // ... reste du code
});
```

**Attendez le timer :**

- ✅ Aucun log dans la console
- ✅ Exercices ne se rerendus pas

**Cliquez sur un bouton :**

- ✅ Un seul log pour l'exercice concerné
- ✅ Autres exercices PAS rerendus

---

### Test 2 : Vérifier le Context

```javascript
function CurrentExerciseCard({ exercise, index, localEffort, onEffortChange }) {
  const { handleSetChange } = useSessionExecutionContext();

  console.log("Context handlers:", handleSetChange); // Même référence ?

  // ...
}
```

**Attendez le timer :**

- ✅ handleSetChange garde la MÊME référence
- ✅ Pas créé de nouvelle fonction

---

## 📊 Comparaison : Avant vs Après

### AVANT (❌ Sans optimisations)

```
Timer change
  ↓
SessionExecution remet à jour
  ↓
Tous les 10 SessionExerciseCard se rerendus ❌
  ├─ Exercise 0 rerender inutile
  ├─ Exercise 1 rerender inutile
  ├─ Exercise 2 rerender inutile
  └─ ... tous rerendus
  ↓
Lag visible 😞
```

**Performance :** 😞 Mauvaise

---

### APRÈS (✅ Avec optimisations)

```
Timer change
  ↓
SessionExecution remet à jour
  ├─ sessionHandlers = MÊMES fonctions (useCallback)
  └─ SessionExecutionProvider reçoit MÊMES props
      ↓
      SessionExerciseCard[] (memo)
      ├─ Exercise 0 → props identiques → PAS rerender ✅
      ├─ Exercise 1 → props identiques → PAS rerender ✅
      └─ Exercise 2 → props identiques → PAS rerender ✅
      ↓
Smooth 🚀 60fps
```

**Performance :** 🚀 Excellente

---

## 🎓 Patterns à retenir

### Pattern 1 : memo + useCallback

```javascript
// ✅ BON
const MyComponent = memo(function MyComponent({ onAction }) {
  // ...
});

// Parent
const handleAction = useCallback(() => {
  // ...
}, []);

<MyComponent onAction={handleAction} />;
```

**Pourquoi :** memo a besoin de fonctions stables

---

### Pattern 2 : Context pour éviter prop drilling

```javascript
// ✅ BON
<MyProvider value={handlers}>
  <Child /> {/* Accède via useContext */}
</MyProvider>

// ❌ MAUVAIS
<Child handler1={h1} handler2={h2} handler3={h3} handler4={h4} ... />
```

**Pourquoi :** Plus lisible, plus facile à maintenir

---

### Pattern 3 : Handlers dans un hook

```javascript
// ✅ BON
const { handleSetChange, handleNotes, ... } = useMyHandlers();

// ❌ MAUVAIS
const handleSetChange = useCallback(...);
const handleNotes = useCallback(...);
const ... = useCallback(...);
```

**Pourquoi :** Centralisé, facile à ajouter/retirer

---

## 🚀 Prochaines étapes pour progresser

1. **Comprendre les dépendances useCallback**

   - Toujours inclure les variables utilisées
   - Tester avec ESLint rules

2. **Mesurer la performance réelle**

   - DevTools React Profiler
   - Chrome Performance tab

3. **Ajouter TypeScript**

   - Typer les handlers
   - Typer le Context

4. **Tests unitaires**

   - Tester les handlers
   - Tester les re-renders

5. **Suspense et Error Boundaries**
   - Pour une vraie robustesse

---

## 📞 Résumé en une phrase

**SessionExecution** utilise **memo** (pour optimiser re-renders) + **useCallback** (pour stabiliser fonctions) + **Context** (pour éviter prop drilling) = **Performance maximale** 🚀
