# Règles Mobile-First — FitBuilder

Ce document définit les conventions à respecter pour tout nouveau composant ou modification dans ce projet. L'approche est **mobile-first** : on conçoit d'abord pour mobile, puis on enrichit pour desktop via des breakpoints.

---

## 1. Breakpoints Tailwind

| Préfixe | Largeur | Usage |
|---|---|---|
| *(aucun)* | 0px+ | Mobile — styles de base |
| `sm:` | 640px+ | Petites tablettes |
| `md:` | 768px+ | Tablettes |
| `lg:` | 1024px+ | Desktop |

**Règle :** ne jamais écrire `md:hidden` pour cacher quelque chose sur desktop si on peut écrire `hidden md:block` pour l'afficher. Penser mobile en premier.

```tsx
// ❌ Desktop-first
<div className="flex-row md:flex-col">

// ✅ Mobile-first
<div className="flex-col md:flex-row">
```

---

## 2. Touch Targets

Tout élément interactif (bouton, lien, checkbox, icône cliquable) doit avoir une zone de tap d'au moins **44×44px** (recommandation WCAG).

```tsx
// ❌ Trop petit (24px)
<button><X size={24} /></button>

// ✅ Zone de tap suffisante
<button className="p-2 rounded-full"><X size={24} /></button>
// 24px icône + 8px padding chaque côté = 40px (acceptable)
// Pour 44px : p-3 → 24 + 12*2 = 48px ✅
```

**Checkboxes :** minimum `w-5 h-5` sur mobile (`w-3 h-3` est inutilisable au doigt).

---

## 3. Navigation

La bottom navigation fixe (`z-50`, hauteur `h-16` = 64px) est présente sur tous les écrans authentifiés sur mobile. En tenir compte partout :

- `<main>` : `pb-20 lg:pb-0` (déjà dans `globals.css`)
- Éléments `sticky bottom-0` : deviennent `sticky bottom-16 lg:bottom-0`
- Modals : `z-[60]` minimum pour passer au-dessus de la nav (`z-50`)
- Footer : `pb-24 lg:pb-10`

---

## 4. Padding et Espacement

Réduire les paddings sur mobile, les augmenter sur desktop :

```tsx
// ✅ Pattern standard
<div className="p-4 lg:p-6">
<div className="space-y-4 lg:space-y-8">
<div className="gap-4 lg:gap-6">
```

Ne pas ajouter un `p-6` à l'intérieur d'un composant qui a déjà `p-6` en container (double-padding). `ModalLayout` fournit déjà `p-6` — les enfants ne doivent pas rajouter leur propre padding de bloc.

---

## 5. Typographie

Les grands titres doivent être réduits sur mobile :

```tsx
// ✅
<h1 className="text-xl lg:text-3xl">
<h2 className="text-lg lg:text-2xl">
```

Les `h1` de pages internes sont centrés sur mobile, alignés à gauche sur desktop (via `globals.css`) :
```css
h1 { @apply text-center lg:text-left; }
```

---

## 6. Formulaires et Inputs

### Clavier mobile
Toujours spécifier `inputMode` sur les inputs numériques pour ouvrir le bon clavier :

| Champ | `inputMode` |
|---|---|
| Poids (décimaux) | `"decimal"` |
| Répétitions, RPE, durée (entiers) | `"numeric"` |
| Email | `"email"` |

### Virgule vs point décimal
Les locales françaises utilisent la virgule comme séparateur décimal. Normaliser avant tout `parseFloat` :

```ts
// ✅
const num = parseFloat(value.replace(",", "."));
```

### Largeur des inputs
La classe `.input` est `w-full` — les inputs remplissent leur conteneur. Ne pas utiliser de largeurs fixes sauf override explicite et justifié (ex: `w-24` pour un champ RPE).

---

## 7. Listes et Filtres Scrollables

Quand une liste d'onglets ou de filtres risque de déborder sur mobile, utiliser `overflow-x-auto` avec `shrink-0` sur les enfants :

```tsx
// ✅
<div className="flex gap-2 overflow-x-auto px-1">
  <button className="shrink-0 py-3 px-4">Filtre A</button>
  <button className="shrink-0 py-3 px-4">Filtre B</button>
</div>
```

Ne jamais utiliser `flex-wrap` pour les onglets de navigation — les éléments doivent rester sur une ligne scrollable, pas se casser en plusieurs lignes.

---

## 8. Boutons

### Variants disponibles

```tsx
<Button>                    // default — primary
<Button variant="close">   // accent (rouge/orange) — actions destructives
<Button variant="edit">    // primary clair — modifications
<Button variant="outline">  // transparent bordé — actions secondaires
```

### Largeur
- `full` : pleine largeur (CTA principal sur mobile)
- `width="w-auto"` : taille au contenu
- `width="w-12"` : icône seule
- Par défaut : `min-w-[150px]`

### Deux boutons côte à côte sur mobile
`min-w-[150px]` × 2 + gap = ~312px > espace disponible dans une modal (~295px). Utiliser une grille :

```tsx
// ✅ Dans une modal
<div className="grid grid-cols-2 gap-3">
  <Button full>Action A</Button>
  <Button full variant="close">Action B</Button>
</div>
```

### `.modalFooter`
La classe `.modalFooter` est `flex-col sm:flex-row` — les boutons s'empilent sur mobile et passent en ligne sur sm+. Ne pas surcharger avec `flex-row` sur mobile.

---

## 9. Modals

- Fond : `fixed inset-0 z-[60] p-4` — le `p-4` assure un espace visuel sur tous les bords
- Container : `max-w-md w-full` — limité à 448px, centré
- Hauteur : `max-h-full overflow-y-auto` — scroll interne si le contenu dépasse
- Bouton fermeture : `absolute right-2 top-2 p-2` — zone de tap ~40px

**Ordre des z-index :**
| Élément | z-index |
|---|---|
| Bottom nav | `z-50` |
| Modals overlay | `z-[60]` |

---

## 10. Layouts Spécifiques

### Deux layouts mobile/desktop
Pour des composants qui diffèrent radicalement entre mobile et desktop, utiliser deux sections distinctes plutôt que des variantes conditionnelles complexes :

```tsx
{/* Mobile */}
<div className="md:hidden space-y-2">
  <PrimaryButton full />
  <div className="flex gap-2 justify-around">
    <IconButton /><IconButton /><IconButton />
  </div>
</div>

{/* Desktop */}
<div className="hidden md:flex gap-2 items-center">
  <PrimaryButton /><SecondaryButton /><IconButton />
</div>
```

### Calendrier
- Desktop : React Big Calendar (vue mois/semaine/jour/agenda)
- Mobile (`isMobile === true`, détecté via `window.innerWidth < 768`) : `MobileCalendar` custom (grille mensuelle + liste du jour)
- Le basculement est dans `CalendarComponent.tsx`
- Voir `src/Features/Calendar/components/MobileCalendar.md` pour le détail

---

## 11. Images et Icônes

- Logos et images : préférer des tailles plus grandes sur mobile pour la lisibilité tactile
- Icônes dans des boutons icon-only : minimum `size={20}`, entourer d'un `p-2` pour le touch target

---

## Checklist avant de merger un composant

- [ ] Touch targets ≥ 44px sur tous les éléments interactifs
- [ ] Pas de débordement horizontal (tester à 375px)
- [ ] `inputMode` défini sur tous les inputs numériques
- [ ] `parseFloat` précédé d'un `.replace(",", ".")`
- [ ] Padding réduit sur mobile (`p-4 lg:p-6`)
- [ ] Pas de double padding dans les modals
- [ ] Éléments `sticky bottom-0` déplacés à `bottom-16 lg:bottom-0`
- [ ] Nouveaux overlays en `z-[60]` minimum
