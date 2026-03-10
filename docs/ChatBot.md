# FitBot — Documentation du Chatbot IA

## Vue d'ensemble

FitBot est un assistant IA intégré à FitBuilder. Il répond aux questions sur l'entraînement et sur l'application. Il est accessible via un bouton flottant (FAB) présent sur toutes les pages authentifiées.

Le modèle utilisé est **claude-haiku-4-5** d'Anthropic : rapide et économique, adapté à un usage conversationnel.

---

## Structure des fichiers

```
src/Features/Chat/
  components/
    ChatFAB.tsx       — Bouton rond fixe en bas à droite + badge non lus
    ChatInput.tsx     — Zone de saisie + bouton envoi
    ChatMessage.tsx   — Une bulle de message (user ou assistant)
    ChatPanel.tsx     — Panel principal : affiche les messages, gère l'envoi et le stream
  store/
    chatStore.ts      — État global Zustand (messages, isOpen, isLoading, unreadCount)
  utils/
    systemPrompt.ts   — Instructions données à Claude pour jouer le rôle de FitBot
  index.ts            — Barrel export

src/app/api/chat/
  route.ts            — Route API POST : appelle l'API Anthropic et retourne un stream SSE
```

---

## Schéma du flux complet

```
Utilisateur tape un message
        ↓
ChatInput (Entrée ou bouton Send)
        ↓
ChatPanel.handleSend()
  ├── addMessage({ role: "user" })          → bulle bleue affichée immédiatement
  ├── addMessage({ role: "assistant", "" }) → placeholder vide (indicateur "...")
  └── fetch POST /api/chat
              ↓
        route.ts (API)
          ├── requireAuth()                 → 401 si non connecté
          ├── client.messages.stream(...)   → ouvre un stream vers Anthropic
          └── envoie les chunks SSE au navigateur ("data: { text: '...' }\n\n")
              ↓
        ChatPanel lit le stream chunk par chunk
          └── updateLastAssistantMessage()  → met à jour la bulle en temps réel
              ↓
        finally : setIsLoading(false)
          └── si panel fermé → incrementUnread() → badge rouge +1
```

---

## Les composants en détail

### ChatFAB.tsx

Bouton rond fixe, toujours visible sur les pages authentifiées.

- **Position** : `bottom-[88px]` sur mobile (au-dessus de la bottom nav), `bottom-6` sur desktop
- **Z-index** : `z-[70]` — au-dessus de la bottom nav (`z-50`) et des modales (`z-[60]`)
- **Badge** : cercle rouge affiché si `unreadCount > 0`, affiche "9+" au-delà de 9
- **Au clic** : ouvre/ferme le panel via `setIsOpen()` + remet `unreadCount` à 0 à l'ouverture

```
[bouton rond]
    └── ouvre/ferme ChatPanel
    └── badge rouge si messages non lus
```

### ChatPanel.tsx

Le panel blanc qui apparaît quand le chat est ouvert. C'est lui qui contient toute la logique d'envoi et de lecture du stream.

- Retourne `null` si `isOpen === false` (pas de rendu inutile)
- **Header** : nom "FitBot", bouton corbeille (vide l'historique), bouton fermeture
- **Zone messages** : scrollable, avec scroll automatique vers le bas à chaque nouveau message
- **Indicateur de frappe** : trois points animés affichés pendant que FitBot génère sa réponse

**Scroll automatique** — `useEffect` sur `[messages, isLoading, isOpen]` :
```ts
el.scrollTop = el.scrollHeight
```
`isOpen` est dans les dépendances pour que le scroll se déclenche aussi à la réouverture du panel (sinon on retombe en haut de la conversation).

### ChatMessage.tsx

Affiche une seule bulle de message.

| Rôle | Alignement | Couleur | Avatar |
|---|---|---|---|
| `user` | droite | bleu (`bg-primary-500`) | aucun |
| `assistant` | gauche | gris (`bg-gray-100`) | "AI" violet |

### ChatInput.tsx

Zone de saisie en bas du panel.

- **Entrée** → envoie le message
- **Shift+Entrée** → saut de ligne
- Se désactive pendant que FitBot répond (`disabled={isLoading}`)
- Utilise une `ref` directe sur le textarea (pas de state React) pour vider le champ après envoi sans provoquer de re-render

---

## Le store Zustand (`chatStore.ts`)

### État

| Champ | Type | Rôle |
|---|---|---|
| `messages` | `ChatMessage[]` | Historique complet de la conversation |
| `isOpen` | `boolean` | Panel ouvert ou fermé |
| `isLoading` | `boolean` | Réponse de FitBot en cours |
| `unreadCount` | `number` | Nombre de réponses non lues (badge) |

### Actions

| Action | Rôle |
|---|---|
| `addMessage` | Ajoute un message avec id auto et timestamp |
| `updateLastAssistantMessage` | Remplace le contenu du dernier message assistant (streaming) |
| `setIsOpen` | Ouvre/ferme le panel. À l'ouverture : remet `unreadCount` à 0 |
| `setIsLoading` | Active/désactive l'état de chargement |
| `clearMessages` | Vide tout l'historique |
| `incrementUnread` | Ajoute 1 au badge (appelé en fin de stream si panel fermé) |
| `resetUnread` | Remet le badge à 0 |

### Persistance

Seuls les `messages` sont persistés dans `localStorage` sous la clé `chat_history`.
`isOpen`, `isLoading` et `unreadCount` sont des états temporaires non persistés : ils repartent à zéro à chaque rechargement de page.

### Piège Zustand à connaître

`set({ unreadCount: undefined })` écrit littéralement `undefined` dans le store — la valeur n'est pas ignorée.
C'est pourquoi `setIsOpen(false)` n'inclut **pas** `unreadCount` :

```ts
// ✅ Correct — ne touche pas à unreadCount
set(v ? { isOpen: true, unreadCount: 0 } : { isOpen: false })

// ❌ Incorrect — écrase unreadCount avec undefined → badge cassé
set({ isOpen: false, unreadCount: undefined })
```

---

## L'API (`route.ts`)

Route `POST /api/chat`. Accessible uniquement aux utilisateurs connectés.

### Ce qu'elle reçoit

```json
{
  "messages": [
    { "role": "user", "content": "Comment structurer une séance dos ?" },
    { "role": "assistant", "content": "Pour une séance dos..." },
    { "role": "user", "content": "Et pour les biceps ?" }
  ]
}
```

L'historique complet est envoyé à chaque requête — c'est ce qui donne à Claude le contexte de la conversation.

### Ce qu'elle retourne

Un flux SSE (`text/event-stream`). Chaque fragment de réponse est envoyé au format :

```
data: {"text": "Pour les biceps, "}\n\n
data: {"text": "commence par "}\n\n
data: {"text": "des curls."}\n\n
data: [DONE]\n\n
```

### Pourquoi SSE et pas une réponse JSON classique ?

Avec une réponse JSON classique, l'utilisateur attend que Claude ait fini de générer toute sa réponse avant de voir quoi que ce soit (parfois plusieurs secondes). Avec SSE, chaque mot apparaît dès qu'il est généré — la réponse s'affiche progressivement, comme une conversation réelle.

---

## Le prompt système (`systemPrompt.ts`)

Texte envoyé à Claude avant chaque conversation via le paramètre `system`. L'utilisateur ne le voit jamais.

Il définit :
- Le **rôle** de FitBot (coach fitness intégré à FitBuilder)
- Les **fonctionnalités** de l'app qu'il peut décrire
- Les **types de conseils** qu'il peut donner
- Les **règles** : répondre en français, rester concis, pas de conseils médicaux, **pas de markdown** (les réponses sont affichées en texte brut, les `#` et `**` apparaîtraient tels quels)

---

## Badge non-lus — logique complète

Le badge sert à signaler que FitBot a répondu pendant que le panel était fermé.

**Scénario typique :**
1. L'utilisateur envoie un message (panel ouvert)
2. Il ferme le panel pendant que FitBot répond
3. La réponse se termine → `finally` dans `handleSend` → `isOpen` est `false` → `incrementUnread()` → badge `1`
4. L'utilisateur rouvre le panel → `setIsOpen(true)` → `unreadCount` remis à `0` → badge disparaît

**Pourquoi le badge n'est pas incrémenté dans `addMessage` ?**
Le placeholder assistant vide est ajouté avant que la réponse arrive. Si on incrémentait à ce moment-là, on compterait un non-lu avant même d'avoir reçu un seul mot de FitBot. Le bon moment pour incrémenter est la **fin du stream**.

---

## Z-index du chat

| Élément | Z-index | Raison |
|---|---|---|
| Bottom nav | `z-50` | Navigation fixe |
| Modales | `z-[60]` | Au-dessus de la nav |
| ChatFAB + ChatPanel | `z-[70]` | Toujours accessible, même quand une modale est ouverte |

---

## Le streaming expliqué simplement

### Le problème de base

Quand tu appelles Claude, il génère sa réponse **mot par mot** pendant 2-3 secondes. Sans streaming, tu attends que tout soit prêt, puis tu reçois tout d'un coup. Avec le streaming, chaque mot arrive dès qu'il est généré.

### Côté serveur (`route.ts`) — envoyer les morceaux

```
Claude génère : "Pour"  →  "les"  →  "biceps"  →  "..."
                  ↓           ↓          ↓
              data: {"text":"Pour"}\n\n
                         data: {"text":" les"}\n\n
                                    data: {"text":" biceps"}\n\n
                                               data: [DONE]\n\n
```

Le serveur envoie chaque mot dans une ligne qui commence par `data: `. C'est le format **SSE** — une convention du navigateur pour les flux temps réel.

### Côté client (`ChatPanel.tsx`) — recevoir et assembler

```ts
let accumulated = ""

// À chaque morceau reçu :
accumulated += parsed.text               // "Pour" → "Pour les" → "Pour les biceps"
updateLastAssistantMessage(accumulated)  // met à jour la bulle dans le store
```

Le texte s'accumule dans une variable locale, et à chaque nouveau fragment on écrase la bulle avec le texte complet jusqu'ici. C'est pour ça que la réponse apparaît progressivement.

### La vraie complexité : le découpage réseau

Le navigateur ne reçoit pas forcément un fragment SSE par paquet réseau. Il peut recevoir **plusieurs lignes collées** ou **une ligne coupée en deux** :

```
// Paquet 1 reçu d'un coup :
"data: {text:'Pour'}\n\ndata: {text:' les'}\n\n"

// Ou pire, coupé au milieu :
"data: {text:'bice"   puis   "ps'}\n\n"
```

C'est pourquoi le code fait :

```ts
const lines = chunk.split("\n")                     // découpe en lignes
for (const line of lines) {
  if (!line.startsWith("data: ")) continue          // ignore les lignes vides ou incomplètes
  // parse le JSON de la ligne
}
```

Et le `try/catch` autour du `JSON.parse` gère le cas où une ligne arrive incomplète.

### Résumé en une image

```
SERVEUR                          CLIENT
  │                                │
  ├─ "Pour"      ──────────────►  accumulated = "Pour"
  │                                bulle = "Pour"
  ├─ " les"      ──────────────►  accumulated = "Pour les"
  │                                bulle = "Pour les"
  ├─ " biceps."  ──────────────►  accumulated = "Pour les biceps."
  │                                bulle = "Pour les biceps."
  └─ [DONE]      ──────────────►  setIsLoading(false)
                                   si panel fermé → badge +1
```

La complexité vient du fait que le réseau peut livrer ces morceaux dans n'importe quel ordre de paquets — le code doit gérer ça proprement.

---

## Variables d'environnement requises

```
ANTHROPIC_API_KEY   # Clé API Anthropic — obtenir sur console.anthropic.com
```

À ajouter dans `.env.local` pour le développement.
