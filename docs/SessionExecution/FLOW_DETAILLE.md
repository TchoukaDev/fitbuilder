# 🔄 Flux détaillé - Comment votre SessionExecution fonctionne VRAIMENT

## 📊 Vue globale

```
┌─────────────────────────────────────────────────────────────────┐
│ SessionExecution (Composant principal)                          │
│ ├─ État: exercises[], currentExerciseIndex, ...                │
│ ├─ Hooks: useSessionState, useSessionHandlers, ...             │
│ └─ Crée sessionHandlers = { tous les handlers }               │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ SessionExecutionProvider (Context)                              │
│ └─ value={sessionHandlers} (tous les handlers)                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
     ┌────────────────────┴────────────────────┐
     ↓                                          ↓
┌─────────────────┐              ┌──────────────────────────┐
│ SessionHeader   │              │ SessionExerciseCard[]    │
│ (simple)        │              │ (memo - dans liste)      │
│ ├─ Pas memo     │              │ ├─ Accède Context       │
│ └─ Timer change │              │ ├─ Contient:            │
│   toutes les s  │              │ │  ├─ SessionExerciseHeader
│                 │              │ │  ├─ CompleteExerciseCard
└─────────────────┘              │ │  └─ CurrentExerciseCard
                                 │ │     ├─ State local: localEffort
                                 │ │     ├─ useEffect sync
                                 │ │     └─ SetRow[]
                                 └──────────────────────────┘
```

---

## 🎯 Scénario concret : L'utilisateur saisit "5" dans l'effort

### Étape 1 : Input change dans CurrentExerciseCard

```javascript
// CurrentExerciseCard.jsx ligne 72
<input
  value={localEffort ?? ""}
  onChange={(e) => handleChangeEffort(e.target.value)}  // ← "5"
/>
```

### Étape 2 : Validation locale

```javascript
// CurrentExerciseCard.jsx
const handleChangeEffort = (value) => {  // value = "5"
  const numValue = value === "" ? null : parseInt(value);  // numValue = 5
  
  if (numValue === null || (numValue >= 1 && numValue <= 10)) {  // ✓ 5 est valide
    setLocalEffort(numValue);  // ✓ Mettre à jour IMMÉDIATEMENT
    handleEffortChange(index, numValue);  // ← Appeler le handler du Context
  }
};
```

**Résultat :**
- ✅ `localEffort` change immédiatement (input reactif)
- ✅ Handler appelé avec (index, numValue)

### Étape 3 : Handler du Context

```javascript
// useSessionHandlers.js - handleEffortChange
const handleEffortChange = useCallback(
  (exerciseIndex, value) => {  // exerciseIndex, value = 5
    setExercises((prev) => {
      const newExercises = [...prev];  // Copie de la liste
      
      if (!newExercises[exerciseIndex]) {
        console.error(`Exercise at index ${exerciseIndex} not found`);
        return prev;
      }
      
      newExercises[exerciseIndex].effort = value;  // ✓ Modifier
      return newExercises;  // Nouvelle liste
    });
  },
  [setExercises],
);
```

**Résultat :**
- ✅ État global `exercises[index].effort = 5`
- ✅ SessionExecution se remet à jour

### Étape 4 : Propagation

```
State change dans SessionExecution
  ↓
SessionExecution remet à jour
  ├─ sessionHandlers = mêmes fonctions (useCallback)
  ├─ SessionExecutionProvider reçoit mêmes props
  │
  └─ SessionExerciseCard[] (memo)
     ├─ Exo 0 → props identiques → PAS rerender ✅
     ├─ Exo 1 → props identiques → PAS rerender ✅
     └─ Exo 2 (celui modifié) → exercise change
        └─ CurrentExerciseCard remet à jour
           └─ useEffect détecte exercise.effort change
              └─ setLocalEffort(5)
                 └─ Input affiche "5" ✅
```

---

## 🔍 Comprendre les INDEX

### Pourquoi les index partout ?

```javascript
// Dans la boucle map (SessionExecution.jsx)
{exercises.map((exercise, exerciseIndex) => (
  <SessionExerciseCard
    exercise={exercise}
    index={exerciseIndex}  // ← 0, 1, 2, 3, ...
    isActive={currentExerciseIndex === exerciseIndex}
  />
))}
```

**L'index c'est :**
- ✅ Position dans le tableau `exercises[]`
- ✅ Clé pour identifier l'exercice
- ✅ Passé à tous les handlers

### Flux de l'index

```
SessionExerciseCard reçoit index=2
  ↓
<CurrentExerciseCard index={index} />  // index=2
  ↓
<SetRow index={index} />  // Passé dans la boucle
  ↓
onSetChange((field, value) => handleSetChange(index, setIndex, field, value))
  ↓
handleSetChange(2, setIndex, field, value)  // ← Utilise l'index
  ↓
exercises[2].actualSets[setIndex][field] = value
```

---

## 📍 Les différents "handlers"

### 1. handleEffortChange (du Context)

```javascript
// D'où vient : useSessionHandlers.js
// Signature : (exerciseIndex, value) => void
// Que fait : Met à jour exercises[exerciseIndex].effort

const handleEffortChange = useCallback(
  (exerciseIndex, value) => {
    setExercises(prev => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].effort = value;
      return newExercises;
    });
  },
  [setExercises]
);
```

### 2. handleChangeEffort (local dans CurrentExerciseCard)

```javascript
// D'où vient : CurrentExerciseCard.jsx (créé localement)
// Signature : (value: string) => void
// Que fait : 
//   1. Valide (1-10)
//   2. Met à jour localEffort immédiatement (input reactif)
//   3. Appelle handleEffortChange du Context

const handleChangeEffort = (value) => {
  const numValue = value === "" ? null : parseInt(value);
  if (numValue === null || (numValue >= 1 && numValue <= 10)) {
    setLocalEffort(numValue);  // ← INPUT REACTIF
    handleEffortChange(index, numValue);  // ← Appel Context
  }
};
```

**Pourquoi deux handlers ?**
- `handleChangeEffort` = validation + réactivité locale
- `handleEffortChange` = mise à jour état global

---

## 🔄 Synchronisation avec useEffect

### Scénario : L'utilisateur change d'exercice

```
Utilisateur clique sur exercice 2
  ↓
currentExerciseIndex change
  ↓
SessionExerciseCard[2] devient isActive=true
  ↓
ComponentExerciseCard remount (nouvelle instance)
  ↓
useState initializer appelé avec exercise[2].effort
  ↓
useState créé localEffort = exercise[2].effort
  ↓
useEffect setup avec [exercise.effort]
  ↓
Component rendu avec nouvelle valeur ✅
```

**Mais si exercise.effort change SANS change d'exercice :**

```
Quelqu'un modifie exercise[2].effort en temps réel
  ↓
CurrentExerciseCard props changent (memo le voit)
  ↓
Component remet à jour
  ↓
useEffect voit exercise.effort change
  ↓
setLocalEffort(nouvelle valeur)
  ↓
Input affiche nouvelle valeur ✅
```

---

## 🚨 Pièges courants

### Piège 1 : Index décalé

```javascript
// ❌ MAUVAIS - Oublier l'index
<CurrentExerciseCard
  exercise={exercise}
  // Pas d'index !
/>

// Dans CurrentExerciseCard
handleEffortChange(undefined, value);  // ← CRASH !
```

### Piège 2 : Handler pas appelé avec bon index

```javascript
// ❌ MAUVAIS - Index local, pas l'index passé en prop
const handleChangeEffort = (value) => {
  handleEffortChange(currentExerciseIndex, value);  // ← Index global, pas local !
};

// ✅ BON
const handleChangeEffort = (value) => {
  handleEffortChange(index, value);  // ← Index reçu en prop
};
```

### Piège 3 : State local pas synchronisé

```javascript
// ❌ MAUVAIS - Pas de useEffect
const [localEffort, setLocalEffort] = useState(exercise.effort ?? null);
// Si exercise change, localEffort reste l'ancien !

// ✅ BON
useEffect(() => {
  setLocalEffort(exercise.effort ?? null);
}, [exercise.effort]);
```

---

## 📊 Chemin complet d'une modification

```
User tape "8" dans effort
  ↓
onChange={handleChangeEffort}
  ↓
handleChangeEffort("8")
  ├─ Valide ✓
  ├─ setLocalEffort(8) → input affiche "8" immédiatement
  └─ handleEffortChange(index, 8)
      ↓
      setExercises(prev => {
        newExercises[index].effort = 8
        return newExercises
      })
      ↓
      State global change
      ↓
      SessionExecution remet à jour
      ├─ sessionHandlers = mêmes références (useCallback)
      └─ SessionExecutionProvider value = mêmes handlers
          ↓
          SessionExerciseCard[] (memo) reçoit mêmes props
          ├─ Exos autres → pas rerender
          └─ Exo[index]
              ├─ exercise change (effort = 8)
              └─ CurrentExerciseCard remet à jour
                  ├─ useEffect détecte exercise.effort change
                  ├─ setLocalEffort(8)
                  └─ Input affiche "8" (était déjà affiché mais c'est confirmé)
```

---

## ✅ Checklist de compréhension

- [ ] Je comprends pourquoi index est partout
- [ ] Je sais comment handleChangeEffort vs handleEffortChange
- [ ] Je comprends le rôle de localEffort
- [ ] Je sais pourquoi il y a un useEffect
- [ ] Je comprends pourquoi c'est rapide (memo + useCallback)
- [ ] Je peux tracer une modification pas à pas
- [ ] Je sais ce qui se passe quand exercise change
- [ ] Je peux expliquer à quelqu'un d'autre comment ça marche

---

## 🎓 Résumé en termes simples

```
Input utilisateur
  ↓
Validation locale (CurrentExerciseCard)
  ↓
Mise à jour visuelle immédiate (localEffort)
  ↓
Appel du handler global (handleEffortChange)
  ↓
Mise à jour de l'état global (SessionExecution)
  ↓
Réconciliation React (memo + useCallback = performant)
  ↓
Synchronisation si nécessaire (useEffect)
```

**C'est ça votre code !** 👍


