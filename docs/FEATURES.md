# Documentation des Fonctionnalités

Ce document décrit en détail le fonctionnement de chaque feature du projet FitBuilder.

## Table des matières

- [Authentification](#authentification)
- [Programmes d'entraînement (Workouts)](#programmes-dentraînement-workouts)
- [Exercices](#exercices)
- [Calendrier & Planification](#calendrier--planification)
- [Séances d'entraînement (Sessions)](#séances-dentraînement-sessions)
- [Tableau de bord (Dashboard)](#tableau-de-bord-dashboard)
- [Profil utilisateur](#profil-utilisateur)

---

## Authentification

### Description générale

Le système d'authentification sécurisé permet aux utilisateurs de créer un compte, de se connecter et de gérer leur session. Il supporte plusieurs stratégies de connexion et gère les rôles utilisateur.

### Stratégies de connexion

#### 1. **Connexion par email/mot de passe**

**Flux** :
1. L'utilisateur entre son email et mot de passe
2. Validation des données côté client (React Hook Form + Zod)
3. Envoi au serveur pour vérification
4. Hachage du mot de passe avec bcryptjs
5. Vérification dans MongoDB
6. Création d'une session JWT via NextAuth
7. Redirection vers le dashboard

**Sécurité** :
- Les mots de passe sont hachés avec bcryptjs (non stockés en clair)
- Tokens JWT avec expiration configurable
- Middleware de protection sur les routes
- CSRF protection via NextAuth

#### 2. **Inscription (Sign Up)**

**Flux** :
1. Formulaire d'inscription avec validation
2. Vérification de l'unicité de l'email
3. Hachage du mot de passe
4. Création du document utilisateur dans MongoDB
5. Rôle par défaut : `USER`
6. Auto-connexion et redirection

**Données créées** :
- ID utilisateur unique
- Email et mot de passe hashé
- Rôle (USER/ADMIN)
- Timestamps de création

#### 3. **Authentification OAuth (Google)**

**Flux** :
1. Bouton "Se connecter avec Google"
2. Redirection vers Google OAuth Consent Screen
3. Retour avec token Google
4. Vérification ou création du compte utilisateur
5. Session établie automatiquement

**Avantages** :
- Pas besoin de créer un mot de passe
- Connexion rapide
- Sécurité gérée par Google

### Gestion des sessions

**Stratégie** :
- JWT tokens stored in secure HTTP-only cookies
- NextAuth gère l'expiration automatique
- Refresh automatique sur les requêtes
- Logout détruit la session

### Rôles utilisateur

| Rôle | Permissions |
|---|---|
| **USER** | Créer/éditer ses propres workouts, exercices, sessions |
| **ADMIN** | Accès complet + gestion globale des exercices |

### Protection des routes

Routes protégées via middleware :
- `/dashboard` - Authentification requise
- `/workouts` - Authentification requise
- `/sessions` - Authentification requise
- `/calendar` - Authentification requise
- Routes API - Vérification du token

---

## Programmes d'entraînement (Workouts)

### Description générale

Les programmes d'entraînement (workouts) sont des modèles d'exercices personnalisables. Un utilisateur crée un programme une fois, puis peut le réutiliser pour planifier ses séances d'entraînement.

### Cycle de vie d'un Workout

```
Créer → Éditer → Planifier (séance) → Exécuter → Analyser
```

### Création d'un programme

**Informations principales** :
- **Nom** : Identifiant unique du programme (ex: "Chest Day", "Full Body")
- **Description** : Contexte et objectifs du programme
- **Catégorie** : Classification (ex: Upper/Lower, Push/Pull/Legs)
- **Durée estimée** : Temps approximatif en minutes
- **Exercices** : Liste d'exercices avec configurations

### Configuration des exercices dans un programme

Pour chaque exercice ajouté au programme, on configure :

- **Ordre** : Position dans le programme
- **Séries prévues** : Nombre de séries (ex: 3)
- **Répétitions** : Nombre de répétitions
- **Poids** : Poids de départ recommandé
- **Temps de repos** : Entre les séries (en secondes)
- **Notes** : Conseils spécifiques pour cet exercice

### Édition et gestion

**Actions possibles** :
- Ajouter des exercices (depuis la bibliothèque ou créer nouveaux)
- Modifier les configurations des exercices
- Réorganiser l'ordre des exercices
- Supprimer des exercices du programme
- Dupliquer le programme entier
- Supprimer le programme (soft delete)

### Favoris

Les utilisateurs peuvent marquer un workout comme favori :
- Apparaît en haut de la liste
- Accès rapide depuis le dashboard
- Réactualisation rapide du planning

### Utilisation dans les séances

Quand une séance est créée basée sur un workout :
- Les exercices et configurations sont copiés
- L'utilisateur peut les adapter pour la séance
- Le workout reste inchangé (réutilisable)

### Validation

**Règles** :
- Nom requis et unique par utilisateur
- Au minimum 1 exercice
- Chaque exercice doit avoir des séries et reps valides
- Poids ≥ 0

---

## Exercices

### Description générale

La bibliothèque d'exercices est le cœur du système. Elle contient tous les exercices disponibles : exercices globaux (tous les utilisateurs) et exercices personnels (créés par l'utilisateur).

### Types d'exercices

#### 1. **Exercices globaux**
- Créés par les administrateurs
- Visibles par tous les utilisateurs
- Non modifiables par les utilisateurs normaux
- Exemples : Squat, Bench Press, Deadlift, etc.

#### 2. **Exercices personnels**
- Créés par chaque utilisateur
- Visibles uniquement pour cet utilisateur
- Modifiables et supprimables par leur créateur
- Exemples : "Bench Press avec dumbbells", "Squat variation"

### Création d'un exercice

**Informations requises** :
- **Nom** : Identifiant clair de l'exercice
- **Catégorie musculaire** : Groupe de muscles ciblés
  - Poitrine, Dos, Bras, Jambes, Épaules, Abdos, Cardio
- **Type d'exercice** : Classification
  - Force, Hypertrophie, Endurance, Plyométrie, Mobilité
- **Description** (optionnel) : Instructions d'exécution
- **Image/Vidéo** (optionnel) : Ressource visuelle

### Filtrage et recherche

**Filtres disponibles** :
- Par catégorie musculaire
- Par type d'exercice
- Favoris uniquement
- Exercices personnels vs globaux

**Recherche** :
- Recherche texte en temps réel
- Par nom d'exercice

### Système de favoris

Les exercices peuvent être marqués comme favoris :
- Accès rapide lors de la création de workouts
- Réduisent le temps de sélection
- Section "Favoris" séparé

### État de l'exercice

Un exercice peut être :
- **Actif** : Disponible pour sélection dans les workouts
- **Archivé** : Non supprimé mais pas disponible (soft delete)

### Notes importantes

- Un exercice ne peut être supprimé que s'il n'est utilisé dans aucun workout
- Les exercices globaux sont gérés par les administrateurs
- Chaque utilisateur a sa propre liste d'exercices personnels

---

## Calendrier & Planification

### Description générale

Le calendrier permet de visualiser et planifier les séances d'entraînement sur une période donnée. Il intègre une vue mensuelle interactive avec filtrage par statut.

### Vue du calendrier

**Type** : Calendrier mensuel interactif (React Big Calendar)

**Affichage** :
- Grille mensuelle de jours
- Événements (séances) affichés sur les dates
- Code couleur par statut
- Navigation mois précédent/suivant

### Statuts des séances

| Statut | Couleur | Signification |
|---|---|---|
| **PLANNED** | Bleu | Séance programmée, pas encore commencée |
| **IN_PROGRESS** | Jaune | Séance en cours d'exécution |
| **COMPLETED** | Vert | Séance terminée |


### Création d'une séance via calendrier

**Flux** :
1. Cliquer sur une date du calendrier
2. Ouvrir la modale de création d'événement
3. Sélectionner le programme d'entraînement
4. Confirmer la date
5. La séance est créée avec le statut "PLANNED"

**Données créées** :
- Date d'exécution prévue
- Lien vers le workout
- Copie des exercices et configurations
- Statut initial : PLANNED

### Filtrage par statut

**Options** :
- Afficher toutes les séances
- Uniquement planifiées
- Uniquement en cours
- Uniquement complétées
- Uniquement annulées

Permet une vue focalisée sur les séances importantes.

### Interactions calendrier

**Actions sur une séance** :
- **Cliquer** : Voir les détails
- **Éditer** : Modifier la date/configuration
- **Commencer** : Passer au statut "IN_PROGRESS"
- **Supprimer** : Annuler ou suppression définitive
- **Compléter** : Marquer comme terminée

### Synchronisation avec les séances

Le calendrier lit le même dataset que :
- La liste des séances
- Le dashboard (séance du jour)

Tout changement dans une séance se reflète immédiatement au calendrier.

---

## Séances d'entraînement (Sessions)

### Description générale

Une séance (session) est l'exécution concrète d'un programme d'entraînement. L'utilisateur trace chaque exercice, les séries, répétitions, poids réels et enregistre ses notes.

### Cycle de vie d'une séance

```
Créer → Commencer → Exécuter exercices → Compléter → Visualiser détails
```

### Création d'une séance

**Méthodes** :
1. Via le calendrier (date + workout)
2. Via la liste des séances (créer à partir d'un workout)
3. Via le dashboard (carte "Prochaine séance")

**Données initiales** :
- Copie des exercices du workout
- Configurations (séries, reps, poids)
- Pas de données d'exécution encore
- Statut : PLANNED

### Structure d'une séance

```
Session
├── ID unique
├── Utilisateur
├── Workout lié
├── Date prévue
├── Statut (PLANNED, IN_PROGRESS, COMPLETED)
├── Exercices[]
│   ├── Exercice ID
│   ├── Configuration (séries, reps, poids)
│   ├── Statut (NOT_STARTED, IN_PROGRESS, COMPLETED)
│   ├── Sets réels[]
│   │   ├── Numéro
│   │   ├── Reps réalisées
│   │   ├── Poids réalisé
│   │   └── Notes
│   ├── Notes exercice
│   └── Effort (1-10)
├── Durée totale
├── Notes globales
└── Effort global
```

### Exécution d'une séance

#### Phase 1 : Démarrage

**Action** : Cliquer "Commencer la séance"

**Changements** :
- Statut passe à "IN_PROGRESS"
- Sauvegarde automatique de l'heure de début
- Interface d'exécution affichée
- Minuteur de séance démarre

#### Phase 2 : Exécution des exercices

**Pour chaque exercice** :

1. **Sélectionner l'exercice**
   - L'interface met en avant l'exercice courant
   - Affichage de la configuration (séries, reps, poids)

2. **Enregistrer chaque série**
   - Input : Reps réalisées
   - Input : Poids réalisé
   - Temps de repos avant la prochaine
   - Passage automatique à la série suivante

3. **Minuteur de repos**
   - Compte à rebours automatique après chaque série
   - Temps configurable par exercice
   - Son de notification à la fin
   - Skip manuel possible

4. **Notes et effort par exercice**
   - Notes : Ressenti, difficultés, variantes
   - Effort : Échelle 1-10 (ressenti musculaire)
   - Sauvegarde automatique

5. **Statuts des exercices**
   - NOT_STARTED : Pas encore commencé
   - IN_PROGRESS : Séries en cours
   - COMPLETED : Toutes les séries faites

#### Phase 3 : Finalisation

**Actions finales** :

1. **Notes globales** (optionnel)
   - Observations générales sur la séance
   - Énergie, conditions, environnement

2. **Effort global** (optionnel)
   - Échelle 1-10
   - Représentation visuelle (barre de progression)

3. **Complétion**
   - Cliquer "Terminer la séance"
   - Horodatage de fin
   - Calcul de la durée
   - Statut passe à "COMPLETED"

### Fonctionnalités avancées

#### Sauvegarde automatique

- Chaque modification est sauvegardée immédiatement
- Backup local en cas de déconnexion
- Synchronisation au reconnexion
- Aucune perte de données

#### Minuteur de repos

- Configurable par exercice (15s à 10min)
- Notification sonore/visuelle
- Affichage du temps restant
- Pause/reprise manuelle

#### Historique et statistiques

**Calculs effectués** :
- Volume total = Σ(reps × poids) pour tous les exercices
- Nombre de séries complétées
- Nombre de répétitions totales
- Durée de la séance
- Exercices complétés vs prévus

**Affichage** :
- Cartes statistiques à la fin de séance
- Graphiques dans la page de détail
- Tendances sur plusieurs séances

#### Ajustements en temps réel

L'utilisateur peut :
- Modifier le poids d'une série passée
- Ajouter/retirer une série
- Changer une répétition
- Ajouter des notes
- Modifier l'effort exercice

Toutes les modifications se reflètent dans les statistiques.

#### Annulation et reprise

**Annuler une séance** :
- Modale de confirmation
- Retour au statut "PLANNED"
- Conservation des données (brouillon)

**Reprendre une séance** :
- Si interrompue (crash, fermeture)
- Restauration de l'état exact
- Continue où elle s'était arrêtée

### Visualisation des séances complétées

**Page de détail** (readonly après complétion) :
- Informations de la séance
- Badges de statut
- Statistiques globales
- Liste détaillée des exercices avec :
  - Configuration initiale
  - Données réelles complètes
  - Notes et effort
  - Comparaison avant/après
- Notes globales et effort
- Bouton de suppression

### État persistant

Le store Zustand (sessionStore) centralise :
- Données actuelles de la séance
- Sélecteurs pour optimiser les re-rendus
- Actions : update, complete, reopen, etc.
- Cleanup automatique après complétion

---

## Tableau de bord (Dashboard)

### Description générale

Le tableau de bord affiche une vue d'ensemble de l'activité actuelle et à venir de l'utilisateur. C'est la page d'accueil après connexion.

### Sections du dashboard

#### 1. **Bienvenue personnalisée**
- "Bonjour [Prénom]"
- Heure et date actuelles
- Motivation du jour

#### 2. **Prochaine séance programmée**

**Affichage** :
- Carte avec le workout prévu pour bientôt
- Si une séance est en cours → affichage prioritaire
- Si pas de séance aujourd'hui → prochaine séance du calendrier

**Informations** :
- Nom du workout
- Date/heure
- Nombre d'exercices
- Durée estimée

**Actions** :
- Bouton "Commencer" (démarrer la séance)
- Bouton "Détails" (voir les exercices)

#### 3. **Séances du jour**

**Affichage** :
- Liste des séances programmées pour aujourd'hui
- Statut de chaque séance
- Actions rapides (commencer, détails, annuler)

**Si vide** : Message encourageant

#### 4. **Exercices favoris**

**Affichage** :
- Grille des 4-6 exercices les plus utilisés
- Image/icône de l'exercice
- Nombre d'utilisations
- Groupe musculaire

**Actions** :
- Cliquer pour ajouter rapidement à un workout
- Menu options (voir détails, retirer des favoris)

#### 5. **Statistiques du jour**

**Cartes** :
| Statut | Affichage |
|---|---|
| **Séances complétées** | Nombre + comparaison jour précédent |
| **Volume d'entraînement** | Total kg soulevés aujourd'hui |
| **Durée totale** | Cumul des séances complétées |
| **Séances restantes** | Prévues pour aujourd'hui |

#### 6. **Navigation rapide**

Boutons d'accès rapide :
- Voir tous les workouts
- Voir le calendrier
- Voir l'historique des séances
- Créer un nouveau workout

### État et rafraîchissement

- Données rechargées au montage du composant
- Rafraîchissement possible manual (bouton)
- Mise à jour en temps réel si séance en cours
- Revalidation automatique après complétion de séance

### Responsive design

- Layout mobile : colonne unique
- Layout tablet/desktop : grille adaptée
- Cartes redimensionnables
- Priorités d'affichage adaptées

---

## Profil utilisateur

### Description générale

Page permettant à l'utilisateur de visualiser et gérer ses informations de profil.

### Informations affichées

**Section personnelle** :
- Nom complet
- Email
- Photo de profil (optionnel)
- Date de création du compte

**Statistiques générales** :
- Nombre de workouts créés
- Nombre d'exercices personnels
- Nombre de séances complétées
- Volume total depuis l'inscription

**Préférences** :
- Unité de poids (kg/lbs)
- Fuseau horaire
- Langue

### Actions possibles

- **Éditer le profil** :
  - Modifier nom, email
  - Changer le mot de passe
  - Mettre à jour la photo

- **Paramètres** :
  - Préférences de notifications
  - Paramètres de confidentialité
  - Gestion des appareils connectés

- **Déconnexion** :
  - Logout sécurisé
  - Destruction de la session
  - Redirection vers la page d'accueil

### Sécurité

- Authentification requise
- Modification du mot de passe : confirmation de l'ancien requis
- Déconnexion de tous les appareils possible

---

## Flux d'utilisation typique

### Nouvel utilisateur

```
1. Page d'accueil → Créer un compte
2. Remplir le formulaire d'inscription
3. Redirection vers dashboard
4. Créer un premier workout (ex: "Push Day")
5. Ajouter des exercices au workout
6. Planifier une séance (via calendrier)
7. Exécuter la séance
8. Visualiser les statistiques
```

### Utilisateur régulier (quotidien)

```
1. Connexion via email/Google
2. Dashboard affiche les séances du jour
3. Cliquer "Commencer" sur la séance du jour
4. Exécuter chaque exercice
5. Enregistrer les données (reps, poids, notes)
6. Terminer la séance
7. Voir le résumé statistique
8. Accès au calendrier pour planner la prochaine séance
```

### Optimisation d'un programme

```
1. Aller à la liste des workouts
2. Éditer un workout existant
3. Ajouter/retirer/modifier exercices
4. Planifier une séance avec la nouvelle config
5. Exécuter la nouvelle version
6. Comparer avec les précédentes séances
```

---

## Performance et optimisations

### Client-side

- **Memoization** : Composants optimisés avec useMemo/useCallback
- **Code splitting** : Routes chargées à la demande
- **Image optimization** : Images Next.js optimisées
- **Virtualization** : Listes longues virtualisées si nécessaire

### Serveur-side

- **Caching** : Données en cache avec React Query
- **SSR** : Pages serveur rendues quand approprié
- **Pagination** : Listes paginées pour gros volumes
- **Indexation DB** : Indexes MongoDB sur champs fréquents

### État

- **Zustand** : Store léger et performant
- **Sélecteurs** : Minimisent les re-rendus
- **React Query** : Gestion intelligente du cache
- **Debounce** : Réduction des appels API

---

Cette documentation couvre le fonctionnement général de chaque feature. Pour plus de détails techniques, consultez le code source et les commentaires inline.

