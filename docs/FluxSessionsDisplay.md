
Flux des Sessions - Récapitulatif


1. Arrivée sur /sessions (Premier chargement)


Page.tsx (serveur)
       │
       ▼
getAllSessions()  ← Appel direct à la DB
       │
       ▼
SessionsList (client) reçoit initialSessions
       │
       ▼
useSessionsList()
       │
       ▼
useGetSessions({ initialData: initialSessions })
       │
       ▼
React Query voit initialData → PAS de fetch
       │
       ▼
Affichage des sessions ✅



2. Clic sur un filtre (ex: "planned")

handleStatusChange("planned")
       │
       ├──► setStatusFilter("planned")  → State change
       │
       └──► router.push("/sessions?status=planned")  → URL change
       │
       ▼
useGetSessions({ filters: { status: "planned", ... } })
       │
       ▼
queryKey change → ["sessions", userId, { status: "planned", ... }]
       │
       ▼
React Query : "Nouvelle clé = je fetch !"
       │
       ▼
fetch("/api/sessions?status=planned")
       │
       ▼
API Route extrait les params
       │
       ▼
getAllSessions(userId, { status: "planned" })
       │
       ▼
Filtre en DB → Retourne sessions filtrées
       │
       ▼
React Query met à jour `data`
       │
       ▼
Re-render avec nouvelles sessions ✅




3. Schéma visuel

┌─────────────────────────────────────────────────────────────┐
│                        CÔTÉ CLIENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐      ┌──────────────────┐                │
│   │   Filtres   │ ───► │  useSessionsList │                │
│   │   (state)   │      │                  │                │
│   └─────────────┘      └────────┬─────────┘                │
│                                 │                           │
│                                 ▼                           │
│                        ┌──────────────────┐                │
│                        │  useGetSessions  │                │
│                        │  (React Query)   │                │
│                        └────────┬─────────┘                │
│                                 │                           │
└─────────────────────────────────┼───────────────────────────┘
                                  │ fetch()
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                        CÔTÉ SERVEUR                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        ┌──────────────────┐                │
│                        │    API Route     │                │
│                        │ /api/sessions    │                │
│                        └────────┬─────────┘                │
│                                 │                           │
│                                 ▼                           │
│                        ┌──────────────────┐                │
│                        │  getAllSessions  │                │
│                        │      (DB)        │                │
│                        └────────┬─────────┘                │
│                                 │                           │
└─────────────────────────────────┼───────────────────────────┘
                                  │
                                  ▼
                          Sessions filtrées




4. Le concept clé : queryKey

```ts
queryKey: ["sessions", userId, { status, dateFilter, workoutFilter, page, limit }]
```
Situation	                        queryKey	                            Résultat
Premier chargement	["sessions", "123", { status: "all", ... }]	        Utilise initialData
Filtre "planned"	["sessions", "123", { status: "planned", ... }]	    Nouvelle clé → fetch
Re-clic "planned"	["sessions", "123", { status: "planned", ... }]	    Même clé → cache
Filtre "all"	    ["sessions", "123", { status: "all", ... }]         Clé originale → cache