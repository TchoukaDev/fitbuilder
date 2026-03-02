# MobileCalendar

Composant de calendrier custom conçu pour mobile, qui remplace React Big Calendar (RBC) sur les écrans `< 768px`. Le basculement est géré dans `CalendarComponent.tsx` via le state `isMobile` du hook `useCalendarStates`.

## Pourquoi ne pas utiliser React Big Calendar sur mobile ?

RBC est pensé pour desktop :
- La vue `month` est illisible sur petit écran (cellules trop petites, events tronqués)
- La vue `agenda` (fallback mobile de RBC) est une liste chronologique brute, sans structure visuelle
- Pas de contrôle sur le layout sans surcharger massivement le CSS interne

## Architecture

```
CalendarComponent.tsx
  ├── isMobile === false  →  <Calendar /> (React Big Calendar, inchangé)
  └── isMobile === true   →  <MobileCalendar />
```

Tous les modals, handlers et le fetching des events sont **identiques** des deux côtés. `MobileCalendar` ne gère aucune logique métier — il reçoit uniquement des callbacks.

## Props

```ts
interface MobileCalendarProps {
  events: CalendarEvent[];           // Events déjà filtrés par StatusFilter
  currentDate: Date;                 // Mois affiché (contrôlé par CalendarComponent)
  onNavigate: (date: Date) => void;  // handleDateChange — met à jour currentDate
  onSelectEvent: (event: CalendarEvent) => void; // handleSelectEvent → ouvre EventDetailsModal
  onSelectSlot: (slotInfo: { start: Date }) => void; // handleSelectSlot → ouvre NewEventModal
}
```

## State interne

```ts
const [selectedDate, setSelectedDate] = useState<Date>(today);
```

Le seul state local est le jour actuellement sélectionné dans la grille. Initialisé à aujourd'hui.

## Structure visuelle

```
┌─────────────────────────────────┐
│  ‹        mars 2026           › │  ← navigation prev/next mois
├────┬────┬────┬────┬────┬────┬───┤
│ L  │ M  │ M  │ J  │ V  │ S  │ D │  ← en-têtes fixes
├────┼────┼────┼────┼────┼────┼───┤
│    │    │    │    │    │  1 │ 2 │  ← cases vides (offset début de mois)
│    │    │    │    │    │    │ • │
├────┼────┼────┼────┼────┼────┼───┤
│  3 │  4 │  5 │  6 │  7 │  8 │ 9 │
│ •• │    │ •  │    │    │    │   │
└────┴────┴────┴────┴────┴────┴───┘

──── mercredi 5 mars ─── [+ Ajouter]
│ ●  Push Day          09:00 — 10:00 │  ← tap → EventDetailsModal
└────────────────────────────────────┘
```

## Fonctionnement détaillé

### 1. Génération de la grille (`cells`)

```ts
const startOffset = (firstDay.getDay() + 6) % 7; // Convertit dimanche=0 en lundi=0
```

`Date.getDay()` retourne `0` pour dimanche. La formule `(x + 6) % 7` rebase sur lundi = 0. On remplit les cases précédant le 1er du mois avec `null`.

La grille est complétée à la fin pour que le nombre total de cellules soit multiple de 7 (grid CSS 7 colonnes).

### 2. Index des events par jour (`eventsByDay`)

```ts
const map: Record<string, CalendarEvent[]> = {};
// clé : "année-mois-jour" (ex: "2026-2-5" pour le 5 mars 2026)
```

Construit via `useMemo` dépendant de `events`. Permet un accès O(1) par jour plutôt qu'un `.filter()` à chaque render de cellule.

`toDateKey` utilise les valeurs brutes de `getMonth()` (0-indexé) et `getDate()`, sans formatage — cohérent tant que les deux dates comparées viennent du même fuseau horaire.

### 3. Dots colorés

Chaque cellule affiche jusqu'à **3 dots** (max, pour ne pas déborder). La couleur vient de `ev.color`, qui est définie dans `getColorByStatus` :

| Statut | Couleur |
|---|---|
| `planned` | `#5c31e0` (violet, primary-400) |
| `in-progress` | `#ffaa66` (orange, accent-400) |
| `completed` | vert (green-400) |

Quand le jour est sélectionné (`isSelected`), les dots passent en blanc pour rester lisibles sur fond `primary-500`.

### 4. Liste du jour sélectionné

Les events du jour sélectionné sont triés par `start.getTime()` (ordre chronologique) et affichés sous la grille. Chaque item est un `<button>` qui appelle `onSelectEvent(ev)` → ouvre `EventDetailsModal` avec les données de la séance.

### 5. Ajout d'une séance

Le bouton "Ajouter" appelle `onSelectSlot({ start: selectedDate })`, ce qui déclenche `handleSelectSlot` dans `useCalendarHandlers` :

```ts
const handleSelectSlot = (slotInfo: { start: Date }) => {
  openModal("newEvent", { userId, selectedDate: slotInfo.start });
};
```

La modale `NewEventModal` reçoit la date présélectionnée.

## Ce qui n'a pas été modifié

- `CalendarEvent` type — identique
- `useCalendarHandlers` — identique
- `useCalendarStates` — identique (fournit déjà `isMobile`)
- `useMemoCalendar` — identique (fournit `filteredEvents`)
- Tous les modals (newEvent, editEvent, eventDetails, deleteConfirm, cancelInProgressSession)
- Le filtre `StatusFilter` — reste visible sur mobile au-dessus du calendrier

## Limites connues

- **Fuseau horaire** : `toDateKey` compare les dates en heure locale. Si des events sont stockés en UTC et que l'heure locale décale le jour (ex: event à 23h UTC = lendemain à 01h en UTC+2), ils peuvent apparaître sur le mauvais jour. Même comportement que RBC dans ce projet.
- **Events sur plusieurs jours** : non supporté (les events du calendrier fitness durent quelques heures max, cas non applicable ici).
- **Plus de 3 events le même jour** : seuls 3 dots sont affichés dans la grille. La liste complète reste visible dans la section du bas.
