# StatsService — Documentation détaillée

**Fichier :** `src/services/StatsService.ts`
**Rôle :** Calcule toutes les statistiques d'un utilisateur à partir de ses sessions et workouts. Appelé uniquement depuis `src/app/api/stats/route.ts`.

---

## Vue d'ensemble du flux

```
GET /api/stats
    │
    └── StatsService.getStats(userId)
            │
            ├── 1. StatsRepository.findUserStats()  → sessions[], workouts[], exercisesCount
            ├── 2. Filtrage / tri des sessions
            ├── 3. computeStreak()       → nombre de jours consécutifs
            ├── 4. computeTotalDuration() → "HH:MM:SS" total
            ├── 5. computeVolume()        → séries, reps, poids
            ├── 6. monthStats             → stats du mois en cours
            └── 7. Retour de StatsData
```

---

## Type `StatsData` — Ce que la route retourne au client

```typescript
export type StatsData = {
    nextSessions: object[];       // 3 prochaines séances planifiées (après aujourd'hui)
    todaySessions: object[];      // Séances planifiées pour aujourd'hui
    counts: {
        completed: number;        // Nombre total de séances terminées (tout temps)
        inProgress: number;       // Nombre de séances en cours actuellement
        planned: number;          // Nombre total de séances planifiées
        total: number;            // Toutes les séances confondues
        exercises: number;        // Nombre d'exercices dans la bibliothèque perso
        workouts: number;         // Nombre de programmes créés
    };
    favoriteWorkout: object | null; // Programme le plus utilisé (timesUsed le plus élevé)
    totalDuration: string;          // Durée totale cumulée format "HH:MM:SS"
    totalReps: number;              // Nombre total de répétitions effectuées
    totalWeight: number;            // Poids total soulevé (somme brute des séries)
    streak: number;                 // Jours consécutifs avec au moins 1 séance complétée
    monthStats: {
        total: number;              // Séances du mois (tous statuts)
        completed: number;          // Séances terminées ce mois
        planned: number;            // Séances planifiées ce mois
        completionRate: number;     // % de complétion (0-100)
    };
    totalSets: number;              // Nombre total de séries complétées
};
```

---

## Méthodes privées (utilitaires)

### `requireAuth(userId: string)`

```typescript
private requireAuth(userId: string) {
    if (!userId) throw new UnauthorizedError();
}
```

**Rôle :** Vérifie que `userId` n'est pas vide. Si vide, lève une erreur 401.
**Appelée :** Au début de `getStats()` avant toute opération.

---

### `dayKeyLocal(date: Date): string`

```typescript
private dayKeyLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0"); // ⚠️ getMonth() commence à 0
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;  // ex: "2026-03-01"
}
```

**Rôle :** Convertit une `Date` en clé unique de type `"YYYY-MM-DD"` qui ignore l'heure.
**Pourquoi :** Permet de comparer des jours sans être affecté par les fuseaux horaires ou les heures.
**Exemple :**
```
new Date("2026-03-01T23:45:00") → "2026-03-01"
new Date("2026-03-01T00:01:00") → "2026-03-01"  ← même clé, même jour
```
**Utilisée dans :** `computeStreak()` pour construire un Set de jours uniques.

---

### `atLocalNoon(date: Date): Date`

```typescript
private atLocalNoon(date: Date): Date {
    const d = new Date(date);   // copie — ne modifie pas la date originale
    d.setHours(12, 0, 0, 0);   // force l'heure à 12:00:00.000
    return d;
}
```

**Rôle :** Recopie une date en forçant l'heure à midi (12:00).
**Pourquoi :** Protection contre les bugs de changement d'heure (DST/heure d'été).
Exemple de bug sans ça : le 27 mars à 01:00 (passage heure d'été), `setDate(date - 1)` pourrait sauter un jour si l'heure est à 00:00.
En fixant à 12h, on est toujours au milieu du jour — aucun risque de glissement.
**Utilisée dans :** `computeStreak()` uniquement.

---

### `computeStreak(completedSessions: WorkoutSessionDB[]): number`

**Rôle :** Calcule le nombre de jours consécutifs où l'utilisateur a complété au moins une séance.

#### Étape 1 — Construire un Set de jours avec au moins 1 séance

```typescript
const completedDaysSet = new Set<string>();
// Set = collection sans doublons, ex: { "2026-02-28", "2026-03-01" }

for (const session of completedSessions) {
    if (!session.completedDate) continue;            // ignore si pas de date
    const sessionDate = new Date(session.completedDate);
    if (Number.isNaN(sessionDate.getTime())) continue; // ignore si date invalide
    if (this.atLocalNoon(sessionDate) > todayNoon) continue; // ignore les dates futures
    completedDaysSet.add(this.dayKeyLocal(sessionDate)); // ajoute "YYYY-MM-DD"
}
```

Si l'utilisateur a fait 3 séances le même jour, le Set n'aura qu'une seule entrée pour ce jour.

#### Étape 2 — Trouver le point de départ du streak

```
Aujourd'hui (curseur)
    │
    ├── A-t-il une séance aujourd'hui ?
    │       OUI → partir d'aujourd'hui pour compter
    │       NON → reculer d'un jour (hier)
    │               A-t-il une séance hier ?
    │                   OUI → partir d'hier pour compter
    │                   NON → streak = 0, on arrête
```

```typescript
let cursorDate = new Date(todayNoon);

if (!completedDaysSet.has(this.dayKeyLocal(cursorDate))) {
    cursorDate.setDate(cursorDate.getDate() - 1); // reculer d'un jour
    if (!completedDaysSet.has(this.dayKeyLocal(cursorDate))) return 0;
}
```

> La règle "hier compte" permet de ne pas casser le streak si l'utilisateur n'a pas encore fait sa séance aujourd'hui.

#### Étape 3 — Compter en remontant dans le temps

```typescript
let streak = 0;
while (completedDaysSet.has(this.dayKeyLocal(cursorDate))) {
    streak++;                                          // +1 jour consécutif
    cursorDate.setDate(cursorDate.getDate() - 1);      // reculer d'un jour
}
return streak;
```

**Exemple concret :**
```
Jours avec séance : 24/02, 25/02, 26/02, 27/02, 01/03 (pas le 28/02)
Aujourd'hui : 01/03

→ 01/03 présent → curseur = 01/03
→ 01/03 ✓ streak=1, recule → 28/02
→ 28/02 ✗ → STOP
→ streak = 1
```

**Cas limites :**
- Aucune séance complétée → `completedDaysSet` vide → retourne `0`
- Séance dans le futur → ignorée (filtre `> todayNoon`)
- Date invalide en base (`NaN`) → ignorée

---

### `computeTotalDuration(completedSessions: WorkoutSessionDB[]): string`

**Rôle :** Additionne toutes les durées de séances et retourne le total formaté.

```typescript
const totalSeconds = completedSessions.reduce((acc, s) => {
    const [h, m, sec] = (s.duration ?? "00:00:00").split(":").map(Number);
    // split(":") → ["01", "30", "45"]
    // .map(Number) → [1, 30, 45]
    return acc + (h || 0) * 3600 + (m || 0) * 60 + (sec || 0);
    // Convertit tout en secondes et additionne
}, 0);
```

**Explication du `reduce` :**
- `acc` = accumulateur (total de secondes, commence à `0`)
- Pour chaque session, on convertit `"01:30:45"` en secondes : `1×3600 + 30×60 + 45 = 5445 sec`
- On additionne au total

```typescript
// Conversion secondes → HH:MM:SS
const h = Math.floor(totalSeconds / 3600);
const m = Math.floor((totalSeconds % 3600) / 60);
const s = totalSeconds % 60;
return `${String(h).padStart(2, "0")}:...`; // padStart ajoute un "0" si < 10
```

**Exemple :**
```
Session 1 : "01:15:00" → 4500 sec
Session 2 : "00:45:30" → 2730 sec
Total     : 7230 sec → "02:00:30"
```

**Cas limite :** Si `s.duration` est `null` ou `undefined`, le `?? "00:00:00"` remplace par zéro.

---

### `computeVolume(completedSessions: WorkoutSessionDB[])`

**Rôle :** Parcourt toutes les séances → tous les exercices → toutes les séries pour calculer le volume total.

```typescript
for (const session of completedSessions) {           // niveau 1 : séances
    for (const exercise of session.exercises ?? []) { // niveau 2 : exercices
        for (const set of exercise.actualSets ?? []) { // niveau 3 : séries
            if (set.completed) totalSets++;    // compter uniquement les séries validées
            totalReps += set.reps ?? 0;        // ajouter les reps (0 si null)
            totalWeight += set.weight ?? 0;    // ajouter le poids (0 si null)
        }
    }
}
```

**Structure imbriquée :**
```
Session
  └── Exercise[]
        └── actualSets[]
              ├── completed: boolean
              ├── reps: number | null
              └── weight: number | null
```

> ⚠️ `totalReps` et `totalWeight` comptent **toutes** les séries (complétées ou non). Seul `totalSets` filtre sur `set.completed === true`.

**Retourne :** `{ totalSets, totalReps, totalWeight }`

---

### `transformSession(s: WorkoutSessionDB)`

```typescript
private transformSession(s: WorkoutSessionDB) {
    return {
        ...s,                              // copie tous les champs
        id: s._id.toString(),              // ObjectId → string
        userId: s.userId?.toString(),      // ObjectId → string (? = peut être undefined)
        workoutId: s.workoutId?.toString(),// ObjectId → string
    };
}
```

**Rôle :** Convertit un document MongoDB (avec `_id: ObjectId`) en objet utilisable côté client (avec `id: string`).
Le `_id` original reste dans l'objet (via `...s`) mais `id` est ajouté en plus.

---

### `transformWorkout(w: WorkoutDB)`

```typescript
private transformWorkout(w: WorkoutDB) {
    return { ...w, id: w._id.toString() };
}
```

**Rôle :** Même principe que `transformSession` mais pour les workouts.

---

## Méthode principale `getStats(userId)`

### Variables locales importantes

| Variable | Type | Description |
|---|---|---|
| `sessions` | `WorkoutSessionDB[]` | Toutes les sessions de l'utilisateur (tous statuts) |
| `workouts` | `WorkoutDB[]` | Tous les programmes de l'utilisateur |
| `exercisesCount` | `number` | Nombre d'exercices dans la bibliothèque perso |
| `now` | `Date` | Date/heure actuelle au moment de l'appel |
| `startToday` | `Date` | Aujourd'hui à 00:00:00.000 |
| `endToday` | `Date` | Aujourd'hui à 23:59:59.999 |
| `completedSessions` | sous-tableau | Sessions avec `status === "completed"` |
| `plannedSessions` | sous-tableau | Sessions avec `status === "planned"` — ⚠️ `scheduledDate` converti en `Date` |
| `todaySessions` | sous-tableau | `plannedSessions` dont `scheduledDate` est dans [startToday, endToday] |
| `nextSessions` | sous-tableau | `plannedSessions` futures, triées, limitées à 3 |

### `plannedSessions` — la conversion qui cause le bug TypeScript

```typescript
const plannedSessions = sessions
    .filter((s) => s.status === "planned")
    .map((s) => ({ ...s, scheduledDate: new Date(s.scheduledDate) }));
//                       ^^^^^^^^^^^^ string → Date (pour pouvoir comparer avec >= et <=)
```

Cette conversion est **nécessaire** pour filtrer par plage de dates. Mais elle change le type de l'objet (`scheduledDate` passe de `string` à `Date`), ce qui cause un conflit avec `WorkoutSessionDB` plus tard.

C'est pourquoi le cast `as unknown as WorkoutSessionDB` est utilisé lors du `transformSession`.

### `sessionsThisMonth` — logique de sélection

```typescript
const sessionsThisMonth = sessions.filter((s) => {
    const date = new Date(s.completedDate ?? s.scheduledDate);
    //                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //  Si la session est complétée → utilise completedDate
    //  Si elle est planifiée       → utilise scheduledDate
    return date >= startOfMonth && date <= endOfMonth;
});
```

Inclut **toutes** les sessions du mois (complétées, planifiées, en cours) basé sur leur date la plus pertinente.

### `completionRate` — formule

```typescript
// Dénominateur : séances complétées + planifiées ce mois (exclut "in-progress")
const totalPlannedOrCompleted = sessionsThisMonth.filter(
    (s) => s.status === "completed" || s.status === "planned"
).length;

// Taux = (complétées / (complétées + planifiées)) × 100, arrondi
const completionRate = totalPlannedOrCompleted > 0
    ? Math.round((nombreComplétéesCeMois / totalPlannedOrCompleted) * 100)
    : 0; // évite la division par zéro
```

---

## Guide de débogage

### Le streak est à 0 alors qu'il devrait être > 0

1. Vérifier que `session.completedDate` est bien renseigné en base (pas `null`)
2. Vérifier que le format de la date est parsable par `new Date()` (ex: ISO 8601)
3. Vérifier le fuseau horaire — `dayKeyLocal` utilise l'heure **locale** du serveur Vercel (UTC)

### `totalDuration` retourne `"00:00:00"`

- Vérifier que `session.duration` est bien renseigné en base après complétion
- Format attendu : `"HH:MM:SS"` — tout autre format donnera `0`

### `totalWeight` ou `totalReps` semblent faux

- Ces champs additionnent **toutes** les séries, complétées ou non
- Si une série a `weight: null`, elle vaut `0` (ne soustrait pas, n'ajoute rien)

### `nextSessions` est vide alors qu'il y a des sessions planifiées

- Ces sessions doivent avoir `scheduledDate > endToday` (strictement après aujourd'hui 23:59:59)
- Les sessions d'aujourd'hui vont dans `todaySessions`, pas dans `nextSessions`

### `monthStats.completionRate` est inattendu

- Les sessions `in-progress` sont **exclues** du dénominateur
- Une session planifiée qui n'a pas encore été faite **compte** dans le dénominateur (abaisse le taux)
