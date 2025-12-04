# 📁 Structure du code - SessionExecution

Vue d'ensemble complète de la structure et de chaque fichier.

---

## 🗂️ Arborescence

```
src/Features/Sessions/
├── components/
│   └── SessionExecution/
│       ├── SessionExecution.jsx              ⭐ Composant principal
│       ├── SessionExecutionContext.jsx       🌍 Context + Provider
│       ├── SessionHeader.jsx                 📊 En-tête simple
│       ├── index.js                          📤 Exports
│       └── SessionExerciseCard/
│           ├── index.js                      📤 Exports
│           ├── SessionExerciseCard.jsx       📇 Carte exercice (memo)
│           ├── SessionExerciseHeader.jsx     🎫 En-tête exercice
│           ├── CompleteExerciseCard.jsx      ✔️ Résumé exercice (memo)
│           └── CurrentExerciseCard/
│               ├── index.js                  📤 Exports
│               └── CurrentExerciseCard.jsx   ✏️ Formulaire exercice (memo)
│
├── hooks/
│   ├── index.js
│   ├── useSessionHandlers.js                 🔧 Tous les handlers
│   ├── useSessionState.js                    📊 État global
│   ├── useSessionCompletion.js               ✅ Fin de session
│   ├── useSessionTimer.js                    ⏱️ Timer
│   ├── useSessionBackup.js                   💾 Backup local
│   ├── useAutoSave.js                        🔄 Auto-sauvegarde
│   └── useSessions.js                        📝 Requêtes API
│
├── utils/
│   ├── index.js
│   ├── validateExercise.js                   ✓ Validation d'exercice
│   └── getSessions.js                        📥 Requêtes sessions
│
└── modals/
    ├── index.js
    ├── IncompleteExerciseModal.jsx
    ├── FinishSessionModal.jsx
    ├── CancelSessionModal.jsx
    └── RestTimerModal.jsx
```

---

## 📄 Fichiers détaillés

### 1️⃣ `SessionExecution.jsx` - ⭐ Composant principal

**Responsabilités :**
- Initialiser l'état global
- Gérer les hooks principaux
- Créer et fournir les handlers via Context
- Orchestrer les modales
- Afficher l'interface

**Imports clés :**
```javascript
import { useSessionState } from "../../hooks";
import { useSessionHandlers } from "../../hooks";
import { useSessionCompletion } from "../../hooks";
import { useSessionTimer } from "../../hooks";
import { useSessionBackup } from "../../hooks";
import { useAutoSave } from "../../hooks";
import { SessionExecutionProvider } from "./SessionExecutionContext";
import { SessionHeader } from "./index";
import { SessionExerciseCard } from "./SessionExerciseCard";
```

**État :**
```javascript
const {
  exercises,
  setExercises,
  currentExerciseIndex,
  setCurrentExerciseIndex,
  isSaving,
  setIsSaving,
  completedCount,
  totalExercises,
} = useSessionState(sessionData);
```

**Handlers fournis au Context :**
```javascript
const sessionHandlers = {
  handleSetChange,
  handleNotesChange,
  handleEffortChange,
  handleSetComplete,
  handleExerciseComplete,
  handleReopenExercise,
  handleRestTimer,
  currentExerciseIndex,
};
```

**Rendu :**
```jsx
<SessionExecutionProvider handlers={sessionHandlers}>
  <SessionHeader ... />
  <SessionExerciseCard[] /> {/* Accède au Context */}
  <Modals ... />
</SessionExecutionProvider>
```

---

### 2️⃣ `SessionExecutionContext.jsx` - 🌍 Context et Provider

**Responsabilités :**
- Créer le Context
- Créer le Provider
- Exporter un hook personnalisé

**Code :**
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
  const context = useContext(SessionExecutionContext);
  
  if (!context) {
    throw new Error(
      "useSessionExecutionContext doit être dans SessionExecutionProvider"
    );
  }
  
  return context;
}
```

**Utilisation dans un composant :**
```javascript
const { handleSetChange } = useSessionExecutionContext();
```

---

### 3️⃣ `useSessionHandlers.js` - 🔧 Tous les handlers

**Responsabilités :**
- Créer tous les handlers avec `useCallback`
- Retourner les handlers stables

**Handlers :**

#### `handleSetChange`
```javascript
const handleSetChange = useCallback(
  (exerciseIndex, setIndex, field, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      // Créer le set si n'existe pas
      if (!newExercises[exerciseIndex].actualSets[setIndex]) {
        newExercises[exerciseIndex].actualSets[setIndex] = {
          reps: null,
          weight: newExercises[exerciseIndex].targetWeight || null,
          completed: false,
        };
      }
      // Modifier le champ
      newExercises[exerciseIndex].actualSets[setIndex][field] = value;
      return newExercises;
    });
  },
  [setExercises]
);
```

#### `handleNotesChange`
```javascript
const handleNotesChange = useCallback(
  (exerciseIndex, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].notes = value;
      return newExercises;
    });
  },
  [setExercises]
);
```

#### `handleEffortChange`
```javascript
const handleEffortChange = useCallback(
  (exerciseIndex, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].effort = value;
      return newExercises;
    });
  },
  [setExercises]
);
```

#### `handleExerciseComplete`
```javascript
const handleExerciseComplete = useCallback(
  (exerciseIndex) => {
    const validation = validateExercise(exercises, exerciseIndex);
    
    if (!validation.isComplete) {
      openModal("incompleteExercise", { validation, exerciseIndex });
    } else {
      completeExercise(exerciseIndex);
    }
  },
  [exercises, openModal, completeExercise]
);
```

---

### 4️⃣ `SessionExerciseCard.jsx` - 📇 Carte exercice (MEMO)

**Responsabilités :**
- Afficher un exercice
- Basculer entre vue résumé et vue formulaire
- Accéder aux handlers via Context

**Optimisation :**
```javascript
const SessionExerciseCard = memo(function SessionExerciseCard({
  exercise,
  index,
  isActive,
}) {
  // Accéder au Context
  const { handleEffortChange: onEffortChange, handleRestTimer } =
    useSessionExecutionContext();
  
  // ... rendu
});
```

**Props minimales :**
- `exercise` - L'exercice
- `index` - Position dans la liste
- `isActive` - Si c'est l'exercice actuellement actif

**Rendu :**
```jsx
{isExpanded && exercise.completed && (
  <CompleteExerciseCard exercise={exercise} index={index} />
)}

{isExpanded && !exercise.completed && (
  <CurrentExerciseCard
    exercise={exercise}
    index={index}
    localEffort={localEffort}
  />
)}
```

---

### 5️⃣ `CurrentExerciseCard.jsx` - ✏️ Formulaire exercice (MEMO)

**Responsabilités :**
- Afficher les séries
- Afficher l'effort (RPE)
- Afficher les notes
- Afficher le bouton terminer

**Optimisation :**
```javascript
const CurrentExerciseCard = memo(function CurrentExerciseCard({
  exercise,
  index,
  localEffort,
  onEffortChange,
}) {
  const { handleSetChange, handleNotesChange, handleExerciseComplete } =
    useSessionExecutionContext();
  
  // ... rendu
});
```

**Props :**
- `exercise` - L'exercice
- `index` - Position
- `localEffort` - État local de l'effort
- `onEffortChange` - Callback effort

---

### 6️⃣ `CompleteExerciseCard.jsx` - ✔️ Résumé exercice (MEMO)

**Responsabilités :**
- Afficher les séries réalisées
- Afficher les notes
- Afficher l'effort
- Bouton pour réouvrir

**Optimisation :**
```javascript
const CompleteExerciseCard = memo(function CompleteExerciseCard({
  exercise,
  index,
}) {
  const { handleReopenExercise } = useSessionExecutionContext();
  
  // ... rendu
});
```

---

## 🔄 Flux de données - Architecture

```
┌─────────────────────────────────────────────────────┐
│ SessionExecution (Principal)                        │
│  ├─ État: exercises, currentExerciseIndex, ...     │
│  ├─ Hooks: useSessionHandlers, useSessionState, .. │
│  └─ Crée: sessionHandlers = { all handlers }       │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ SessionExecutionProvider (Context)                  │
│  └─ value={sessionHandlers}                        │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ SessionHeader (Simple) + SessionExerciseCard[]     │
│                           (memo - optimisé)        │
│                           ↓                         │
│                    Accède via Context:             │
│                    useSessionExecutionContext()    │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Dépendances entre fichiers

```
SessionExecution.jsx
├── imports useSessionHandlers → useSessionHandlers.js
├── imports useSessionState → useSessionState.js
├── imports useSessionCompletion → useSessionCompletion.js
├── imports useSessionTimer → useSessionTimer.js
├── imports useSessionBackup → useSessionBackup.js
├── imports useAutoSave → useAutoSave.js
├── imports SessionExecutionProvider → SessionExecutionContext.jsx
├── imports SessionHeader → SessionHeader.jsx
├── imports SessionExerciseCard → SessionExerciseCard.jsx
└── imports Modals → modals/

SessionExerciseCard.jsx
├── imports useSessionExecutionContext → SessionExecutionContext.jsx
├── imports SessionExerciseHeader → SessionExerciseHeader.jsx
├── imports CompleteExerciseCard → CompleteExerciseCard.jsx
└── imports CurrentExerciseCard → CurrentExerciseCard/

CurrentExerciseCard.jsx
├── imports useSessionExecutionContext → SessionExecutionContext.jsx
└── imports SetRow → ../SetRow.jsx

CompleteExerciseCard.jsx
└── imports useSessionExecutionContext → SessionExecutionContext.jsx
```

---

## ✅ Checklist de compréhension

- [ ] Je comprends pourquoi SessionExerciseCard a `memo`
- [ ] Je comprends pourquoi useSessionHandlers a `useCallback`
- [ ] Je comprends pourquoi on utilise Context
- [ ] Je peux expliquer le flux de données
- [ ] Je peux ajouter un nouveau handler sans aide
- [ ] Je peux expliquer pourquoi SessionHeader n'a pas `memo`
- [ ] Je peux lire le code de SessionExecution et l'expliquer
- [ ] Je peux tester les re-renders avec console.log


