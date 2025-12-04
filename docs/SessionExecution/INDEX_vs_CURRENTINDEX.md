# 🎯 currentExerciseIndex vs index - Explication complète

**C'est LA confusion la plus courante. Ce document la clarifies une fois pour toutes.**

---

## 📍 Définitions simples

### `index` (local)
- **C'est :** La position d'un exercice dans la liste
- **Qui l'utilise :** Chaque `SessionExerciseCard` individuellement
- **Valeur :** 0, 1, 2, 3, 4... (une pour chaque exercice)
- **Change :** Jamais (c'est la position, elle ne change pas)
- **Exemple :** "Je suis l'exercice numéro 2 dans la liste"

### `currentExerciseIndex` (global)
- **C'est :** L'exercice actuellement en cours
- **Qui l'utilise :** `SessionExecution` pour diriger le workflow
- **Valeur :** 0, 1, 2, 3, 4... (un seul à la fois)
- **Change :** Quand l'utilisateur termine un exercice ou en réouvre un
- **Exemple :** "Actuellement, on travaille sur l'exercice numéro 1"

---

## 🏗️ Architecture

```
SessionExecution (composant root)
│
├─ State: currentExerciseIndex = 1
│  └─ "On travaille sur l'exercice numéro 1"
│
└─ Map sur exercises:
   ├─ SessionExerciseCard #0 (index=0)
   │  └─ isActive = (currentExerciseIndex === 0) = false
   │
   ├─ SessionExerciseCard #1 (index=1)  ← CELUI-CI EST ACTIF
   │  └─ isActive = (currentExerciseIndex === 1) = true
   │
   └─ SessionExerciseCard #2 (index=2)
      └─ isActive = (currentExerciseIndex === 2) = false
```

---

## 📊 Visualisation

### État initial

```
Exercices :      Ex1  Ex2  Ex3  Ex4  Ex5
Index :          0    1    2    3    4
currentExerciseIndex = 0

Statut :         🔴   ⚪   ⚪   ⚪   ⚪
                 (actif)
```

### L'utilisateur termine Ex1

```
Exercices :      Ex1  Ex2  Ex3  Ex4  Ex5
Index :          0    1    2    3    4
currentExerciseIndex = 1  ← Change !

Statut :         ✅   🔴   ⚪   ⚪   ⚪
                 (fini) (actif)
```

### L'utilisateur réouvre Ex1

```
Exercices :      Ex1  Ex2  Ex3  Ex4  Ex5
Index :          0    1    2    3    4
currentExerciseIndex = 0  ← Change à nouveau !

Statut :         🔴   ⚪   ⚪   ⚪   ⚪
                 (actif à nouveau)
```

---

## 🔄 Flux de données

### Comment `index` circule

```
SessionExecution
  └─ map(exercises, index) {
       ├─ <SessionExerciseCard index={index} />
       │   └─ map(sets, setIndex) {
       │       ├─ <SetRow
       │       │   onSetChange={(field, value) =>
       │       │     handleSetChange(index, setIndex, field, value)
       │       │   }
       │       │ />
       │       └─ handleSetChange(exerciseIndex=2, setIndex=1, "reps", 8)
       │
       └─ currentExerciseCard reçoit index
           └─ handleEffortChange(index, 7)
  }
```

### Comment `currentExerciseIndex` circule

```
SessionExecution
  ├─ State: currentExerciseIndex = 1
  │
  ├─ Passe à SessionHeader
  │  └─ Affiche "Exercice 1/5"
  │
  ├─ map(exercises, index) {
  │    ├─ isActive = (currentExerciseIndex === index)
  │    ├─ <SessionExerciseCard isActive={isActive} />
  │    │   └─ className={isActive ? "highlight" : ""}
  │    │
  │    └─ Quand l'utilisateur termine
  │        └─ handleExerciseComplete(index)
  │            └─ setCurrentExerciseIndex(index + 1)
  │                └─ currentExerciseIndex = 2
  │
  └─ RE-RENDER: maintenant currentExerciseIndex = 2
```

---

## 🎯 Les 4 cas d'usage

### Cas 1 : Vérifier si un exercice est actif

```javascript
// SessionExerciseCard
const SessionExerciseCard = memo(function SessionExerciseCard({
  exercise,
  index,
  isActive,  // ← Déjà passé en prop (isActive = currentExerciseIndex === index)
}) {
  return (
    <div className={isActive ? "border-primary-500" : "border-gray-300"}>
      {exercise.name}
    </div>
  );
});

// ✅ BON : Utiliser la prop isActive
// ❌ MAUVAIS : Recalculer isActive localement
```

### Cas 2 : Modifier l'exercice courant (terminer)

```javascript
// useSessionHandlers.js
const handleExerciseComplete = useCallback(
  (exerciseIndex) => {  // ← exerciseIndex, pas currentExerciseIndex
    // Valider l'exercice à l'index exerciseIndex
    // Puis passer au suivant
    
    if (exerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);  // ← Mettre à jour currentExerciseIndex
    }
  },
  [exercises.length, setCurrentExerciseIndex],
);

// ✅ BON : Passer l'exercice à compléter en paramètre
// ❌ MAUVAIS : Utiliser currentExerciseIndex directement
```

### Cas 3 : Réouvrir un exercice

```javascript
// useSessionHandlers.js
const handleReopenExercise = useCallback(
  (exerciseIndex) => {  // ← L'index de l'exercice à réouvrir
    setExercises(prev => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].completed = false;  // ← Utiliser l'index
      return newExercises;
    });
    setCurrentExerciseIndex(exerciseIndex);  // ← Retourner à cet exercice
  },
  [setExercises, setCurrentExerciseIndex],
);

// ✅ BON : Passer l'exercice à rouvrir
```

### Cas 4 : Dans une boucle map

```javascript
// SessionExecution.jsx
{exercises.map((exercise, index) => (  // ← index = position
  <SessionExerciseCard
    key={index}
    exercise={exercise}
    index={index}  // ← Chaque exercice connaît sa position
    isActive={currentExerciseIndex === index}  // ← Comparaison
    onComplete={() => handleExerciseComplete(index)}  // ← Passer l'index
  />
))}

// ✅ BON : index = position dans la boucle
// ❌ MAUVAIS : Utiliser currentExerciseIndex directement
```

---

## ⚠️ Erreurs courantes

### Erreur 1 : Confondre dans handleExerciseComplete

```javascript
// ❌ MAUVAIS
const handleExerciseComplete = useCallback(
  () => {  // ← Pas de paramètre !
    // Quel exercice compléter ? On ne sait pas !
    setCurrentExerciseIndex(currentExerciseIndex + 1);
  },
  [currentExerciseIndex, setCurrentExerciseIndex],
);

// ✅ BON
const handleExerciseComplete = useCallback(
  (exerciseIndex) => {  // ← Prendre en paramètre
    // exerciseIndex nous dit précisément quel exercice
    setCurrentExerciseIndex(exerciseIndex + 1);
  },
  [setCurrentExerciseIndex],
);
```

**Pourquoi :** Quand l'utilisateur clique sur "Exercice terminé", il clique sur un exercice SPÉCIFIQUE. Il faut passer son index !

---

### Erreur 2 : Ne pas passer index aux handlers

```javascript
// ❌ MAUVAIS
<CurrentExerciseCard
  exercise={exercise}
  // Pas d'index !
  onEffortChange={(value) => handleEffortChange(value)}  // ← Manque l'index
/>

// ✅ BON
<CurrentExerciseCard
  exercise={exercise}
  index={index}  // ← Passer l'index
  onEffortChange={(value) => handleEffortChange(index, value)}  // ← Utiliser
/>
```

**Pourquoi :** Sans l'index, le handler ne sait pas quel exercice modifier !

---

### Erreur 3 : Oublier la comparaison

```javascript
// ❌ MAUVAIS - currentExerciseIndex dans SessionExerciseCard ?
const SessionExerciseCard = memo(function SessionExerciseCard({
  exercise,
  index,
  // currentExerciseIndex n'est PAS en prop
}) {
  // Comment je sais si je suis actif ?
  const isActive = ???;
});

// ✅ BON - isActive en prop
const SessionExerciseCard = memo(function SessionExerciseCard({
  exercise,
  index,
  isActive,  // ← Déjà calculé par le parent
}) {
  // Je sais simplement si je suis actif
  return <div className={isActive ? "highlight" : ""} />;
});
```

**Pourquoi :** La comparaison doit se faire au niveau du parent qui a les deux valeurs.

---

## 🧭 Mental model - La route

Imaginez une route avec 5 villes :

```
┌──────┬──────┬──────┬──────┬──────┐
│ NY   │ PHI  │ DC   │ ATL  │ MIA  │
└──────┴──────┴──────┴──────┴──────┘
  0      1      2      3      4    ← index (adresse fixe)
                ↑
         currentExerciseIndex = 2
         (Nous sommes à DC)
```

**index** = L'adresse de la ville (ne change jamais)
**currentExerciseIndex** = Où nous sommes maintenant (change pendant le voyage)

Quand on arrive à ATL :
```
currentExerciseIndex = 3
```

Mais DC a toujours l'adresse 2. Son `index` ne change pas.

---

## 📋 Checklist de compréhension

- [ ] Je sais que `index` = position dans la liste
- [ ] Je sais que `currentExerciseIndex` = exercice actuellement en cours
- [ ] Je comprends que `isActive = currentExerciseIndex === index`
- [ ] Je sais passer `index` à tous les handlers
- [ ] Je sais quand utiliser l'un ou l'autre
- [ ] Je comprends pourquoi c'est important de les différencier
- [ ] Je peux corriger une confusion si je la vois
- [ ] Je peux expliquer à quelqu'un d'autre

---

## 🎓 Résumé ultra-simple

| Concept | Question | Réponse |
|---------|----------|--------|
| **index** | "Quelle est ma position ?" | "Je suis l'exercice #2" |
| **currentExerciseIndex** | "Où sommes-nous maintenant ?" | "On travaille sur l'exercice #1" |
| **isActive** | "Suis-je en cours ?" | "Oui si mon index === currentExerciseIndex" |

---

## 💡 Trick pour ne jamais confondre

Quand vous voyez du code, posez-vous ces questions :

1. **C'est une boucle map ?** → C'est `index`
2. **C'est pour savoir si c'est l'exercice courant ?** → C'est `currentExerciseIndex`
3. **C'est un handler qui modifie un exercice spécifique ?** → C'est `index`
4. **C'est pour aller au prochain exercice ?** → C'est `currentExerciseIndex + 1`

Avec ça, vous ne vous tromperez jamais ! 🎯


