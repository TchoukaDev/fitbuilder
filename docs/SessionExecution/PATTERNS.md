# 🎯 Patterns React - Guide Visuel

Ce fichier explique les 3 patterns principaux utilisés dans SessionExecution avec des exemples visuels.

---

## Pattern 1️⃣ : React.memo - Optimiser les re-renders

### Le problème

```jsx
// ❌ SANS memo - Tous les exercices se rerendent
function ExerciseCard({ exercise, index }) {
  console.log("Rendu de l'exercice", index);
  return <div>{exercise.name}</div>;
}

// Parent
function ExercisesList() {
  const [timer, setTimer] = useState(0);
  
  return (
    <>
      <p>Timer: {timer}</p>
      {exercises.map((ex, i) => (
        <ExerciseCard key={i} exercise={ex} index={i} />
      ))}
    </>
  );
}

// Quand timer change:
// Console:
// "Rendu de l'exercice 0"
// "Rendu de l'exercice 1"
// "Rendu de l'exercice 2" ❌ TOUS se rerendent !
```

### La solution

```jsx
// ✅ AVEC memo - Seulement si props changent
const ExerciseCard = memo(function ExerciseCard({ exercise, index }) {
  console.log("Rendu de l'exercice", index);
  return <div>{exercise.name}</div>;
});

// Quand timer change:
// Console: (rien) ✅ Pas de rerender !

// Quand exercise[0] change:
// Console: "Rendu de l'exercice 0" ✅ Seulement celui-ci
```

### Quand l'utiliser

```
✅ BON:
  - Composant dans une liste (map)
  - Props changent rarement
  - Composant "lourd" (beaucoup de calculs)

❌ MAUVAIS:
  - Props changent tout le temps
  - Composant "léger" (simple div)
  - Pas dans une liste
```

### Anatomie de memo

```jsx
// Syntaxe simple
const MyComponent = memo(function MyComponent(props) {
  return <div>{props.data}</div>;
});

// Avec custom comparison (rarement nécessaire)
const MyComponent = memo(
  function MyComponent(props) {
    return <div>{props.data}</div>;
  },
  (prevProps, nextProps) => {
    // return true si props sont "égales" (pas de rerender)
    // return false si props sont différentes (rerender)
    return prevProps.data === nextProps.data;
  }
);
```

---

## Pattern 2️⃣ : useCallback - Stabiliser les fonctions

### Le problème

```jsx
// ❌ SANS useCallback - Nouvelle fonction à chaque render
function Parent() {
  const [count, setCount] = useState(0);
  
  // Cette fonction est créée de ZÉRO à chaque render
  const handleClick = () => {
    console.log("clicked");
  };
  
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      
      {/* handleClick est UNE NOUVELLE FONCTION à chaque render ! */}
      <Child onAction={handleClick} />
    </>
  );
}

const Child = memo(function Child({ onAction }) {
  console.log("Child rerender");
  return <button onClick={onAction}>Action</button>;
});

// Quand count change:
// handleClick === handleClick ? false ❌ Différent !
// Child rerender même avec memo ❌
```

### La solution

```jsx
// ✅ AVEC useCallback - MÊME fonction entre les renders
function Parent() {
  const [count, setCount] = useState(0);
  
  // Cette fonction est "gelée" entre les renders
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // [] = dépendances
  
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      
      {/* handleClick est LA MÊME FONCTION */}
      <Child onAction={handleClick} />
    </>
  );
}

// Quand count change:
// handleClick === handleClick ? true ✅ Identique !
// Child NE se rerender PAS ✅ memo fonctionne !
```

### Comprendre les dépendances

```jsx
// ❌ MAUVAIS - Les dépendances manquent
const handleClick = useCallback(() => {
  setName(name); // 🚨 ERREUR: name n'est pas dans les deps
}, []); // ← Oubli de [name]

// La fonction gardera toujours l'ancien "name"
// C'est un bug !

// ✅ BON - Toutes les dépendances
const handleClick = useCallback(() => {
  setName(name);
}, [name]); // ← Dépendance correcte

// Si name change, la fonction se recrée
// Mais si name est stable, fonction reste stable

// ✅ OPTIMAL - Pas de dépendances externes
const handleClick = useCallback(() => {
  setName("Alice"); // Valeur hardcodée, pas de dépendance
}, []); // ← Zéro dépendance = toujours stable
```

### Quand l'utiliser

```
✅ BON:
  - Fonction passée à un composant avec memo
  - Fonction dans les dépendances d'un autre hook (useEffect, useMemo)
  - Handler utilisé partout

❌ MAUVAIS:
  - Fonction locale jamais passée
  - Event handler simple (onClick local)
  - Fonction qui change souvent de toute façon
```

---

## Pattern 3️⃣ : Context API - Éviter le prop drilling

### Le problème

```jsx
// ❌ SANS Context - Prop drilling de l'enfer
function App() {
  const handleClick = () => { ... };
  const handleChange = () => { ... };
  
  return <Level1 onClick={handleClick} onChange={handleChange} />;
}

function Level1({ onClick, onChange }) {
  return <Level2 onClick={onClick} onChange={onChange} />;
}

function Level2({ onClick, onChange }) {
  return <Level3 onClick={onClick} onChange={onChange} />;
}

function Level3({ onClick, onChange }) {
  return <Level4 onClick={onClick} onChange={onChange} />;
}

function Level4({ onClick, onChange }) {
  return (
    <>
      <button onClick={onClick}>Click</button>
      <input onChange={onChange} />
    </>
  );
}

// Level2 et Level3 ne utilisent PAS les props
// Mais doivent les passer quand même ❌
```

### La solution

```jsx
// ✅ AVEC Context
const MyContext = createContext();

function App() {
  const handleClick = () => { ... };
  const handleChange = () => { ... };
  
  const value = { onClick: handleClick, onChange: handleChange };
  
  return (
    <MyContext.Provider value={value}>
      <Level1 />
    </MyContext.Provider>
  );
}

// Level1, Level2, Level3 n'ont plus besoin des props !
function Level1() {
  return <Level2 />;
}

function Level2() {
  return <Level3 />;
}

function Level3() {
  return <Level4 />;
}

// Level4 accède directement au Context
function Level4() {
  const { onCl click, onChange } = useContext(MyContext);
  
  return (
    <>
      <button onClick={onClick}>Click</button>
      <input onChange={onChange} />
    </>
  );
}
```

### Comment créer un Context

```jsx
// 1. Créer le Context
const MyContext = createContext(null);

// 2. Créer le Provider
function MyProvider({ children, value }) {
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// 3. Créer un hook pour l'utiliser
function useMyContext() {
  const context = useContext(MyContext);
  
  if (!context) {
    throw new Error("useMyContext doit être dans MyProvider");
  }
  
  return context;
}

// 4. Utiliser
function App() {
  const handlers = { handleClick, handleChange };
  
  return (
    <MyProvider value={handlers}>
      <MyApp />
    </MyProvider>
  );
}

function MyComponent() {
  const { handleClick, handleChange } = useMyContext();
  
  return (
    <>
      <button onClick={handleClick}>Click</button>
      <input onChange={handleChange} />
    </>
  );
}
```

### Quand l'utiliser

```
✅ BON:
  - Partager des données à plusieurs niveaux
  - Éviter le prop drilling
  - Theme, user, handlers

❌ MAUVAIS:
  - Props pour un niveau (1 ou 2)
  - État qui change très souvent
  - Complexité n'en vaut pas la peine
```

---

## 🔗 Combiner les patterns

```jsx
// ✅ OPTIMAL : memo + useCallback + Context

// 1. Créer les handlers avec useCallback
const handlers = {
  handleClick: useCallback(() => { ... }, []),
  handleChange: useCallback(() => { ... }, []),
};

// 2. Fournir via Context
<MyProvider value={handlers}>
  <Level4 />
</MyProvider>

// 3. Utiliser dans composant memo
const Level4 = memo(function Level4() {
  const { handleClick, handleChange } = useMyContext();
  
  return (
    <>
      <button onClick={handleClick}>Click</button>
      <input onChange={handleChange} />
    </>
  );
});

// Résultat:
// ✅ Pas de prop drilling
// ✅ Fonctions stables (useCallback)
// ✅ Re-renders optimisés (memo)
```

---

## 📊 Performance : Avant vs Après

### Avant (Sans patterns)

```
Modification d'un exercice
  ↓
SessionExecution remet à jour
  ↓
Tous les 10 SessionExerciseCard se rerendus
  ├─ Exercise 0: rerender inutile 😞
  ├─ Exercise 1: rerender inutile 😞
  ├─ Exercise 2: rerender inutile 😞
  ├─ ... 10 rerendus pour une modif 😞
  ↓
Lag visible 😞
```

### Après (Avec patterns)

```
Modification d'un exercice
  ↓
SessionExecution remet à jour
  ├─ Handlers stables (useCallback) ✅
  ├─ Context fourni (SessionExecutionProvider) ✅
  ↓
  SessionExerciseCard[] (memo)
  ├─ Exercise 0: props identiques → PAS rerender ✅
  ├─ Exercise 1: props identiques → PAS rerender ✅
  ├─ Exercise 2: props identiques → PAS rerender ✅
  ├─ ... 0 rerendus inutiles ✅
  ↓
Smooth 60fps 🚀
```

---

## 🎓 Résumé - Quand utiliser quoi

| Pattern | Quand | Pourquoi |
|---------|-------|---------|
| **memo** | Composant dans liste + props stables | Éviter re-renders inutiles |
| **useCallback** | Fonction passée à composant memo | Stabiliser la référence |
| **Context** | Éviter prop drilling | Plus lisible + facile à maintenir |

---

## 💡 Règles d'or

```
1. N'utilise memo QUE si nécessaire
   → Overhead sinon

2. useCallback SEULEMENT pour memo
   → Sans memo, inutile

3. Context pour VRAIMENT éviter prop drilling
   → Pas pour 1-2 niveaux

4. Mesure la performance
   → DevTools React Profiler
   → Don't optimize prematurely
```

---

## 🧪 Tester tes patterns

```jsx
// Ajoute des console.logs pour voir les re-renders
const MyComponent = memo(function MyComponent({ data }) {
  console.log("🔄 MyComponent rendu"); // ← Vois quand ça rerender
  return <div>{data}</div>;
});

// Ouvre DevTools:
// 1. Onglet React Profiler
// 2. Record une interaction
// 3. Vois quoi se rerender et pourquoi
```


