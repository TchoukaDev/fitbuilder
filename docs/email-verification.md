# Email Verification Workflow

Documentation complète du système de vérification d'email pour FitBuilder.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Workflow complet](#workflow-complet)
- [Étapes détaillées](#étapes-détaillées)
- [Fichiers et fonctions](#fichiers-et-fonctions)
- [Variables d'environnement](#variables-denvironnement)
- [Collection MongoDB](#collection-mongodb)
- [Points de sécurité](#points-de-sécurité)
- [Debugging](#debugging)

---

## Vue d'ensemble

Le système vérifie que l'email d'un utilisateur est valide avant de lui permettre de se connecter.

**Flux général :**

```
Inscription → Token généré → Email envoyé → Lien cliqué → Email vérifié → Connexion OK
```

**Caractéristiques :**

- Token sécurisé (32 bytes aléatoires + SHA-256)
- Stockage dans collection séparée
- Expiration automatique 24h
- Vérification bloquante à la connexion
- Google OAuth contourné (Google vérifie déjà)

---

## Workflow complet

```
┌─────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR S'INSCRIT                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/auth/signup                                           │
│  Fichier: src/app/api/auth/signup/route.js                      │
│  ✓ Valide les données (Zod schema)                              │
│  ✓ Vérifie unicité email/username                               │
│  ✓ Hash le mot de passe                                         │
│  ✓ Crée l'utilisateur avec emailVerified: false                 │
│  ✓ Génère un token → createVerificationToken()                  │
│  ✓ Envoie email → sendVerificationEmail()                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  sendVerificationEmail()                                         │
│  Fichier: src/libs/emailService.js                              │
│  ✓ Construit URL: /verify-email?token={token}                  │
│  ✓ Crée email HTML personnalisé                                │
│  ✓ Envoie via Resend API                                       │
│  ✓ Inclut version texte brut                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  UTILISATEUR REÇOIT EMAIL                                       │
│  ✓ Clique sur le lien: /verify-email?token=xxx                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  GET /verify-email (Page)                                       │
│  Fichier: src/app/verify-email/page.jsx                         │
│  ✓ Récupère token depuis query params                           │
│  ✓ Redirige si déjà connecté                                   │
│  ✓ Passe token au composant client                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  VerifyEmailClient (Composant)                                  │
│  Fichier: src/app/verify-email/VerifyEmailClient.jsx            │
│  ✓ Affiche spinner "Vérification en cours..."                   │
│  ✓ Appelle GET /api/auth/verify-email?token=xxx               │
│  ✓ Affiche résultat (succès/erreur/expiré)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  GET /api/auth/verify-email                                     │
│  Fichier: src/app/api/auth/verify-email/route.js               │
│  ✓ Récupère token depuis query params                           │
│  ✓ Vérifie token → verifyToken()                               │
│  ✓ Récupère userId et email du token                           │
│  ✓ Cherche utilisateur dans DB                                 │
│  ✓ Met à jour: emailVerified: true, emailVerifiedAt: new Date()│
│  ✓ Supprime le token utilisé → deleteToken()                   │
│  ✓ Retourne succès/erreur/expiré                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  UTILISATEUR PEUT SE CONNECTER                                  │
│  ✓ Page affiche "Email vérifié !"                              │
│  ✓ Redirection vers /                                          │
│  ✓ Connexion réussie ✓                                          │
└─────────────────────────────────────────────────────────────────┘

SCÉNARIO ALTERNATIF: Token expiré ou invalide
┌─────────────────────────────────────────────────────────────────┐
│  GET /resend-verification (Page)                                │
│  Fichier: src/app/resend-verification/page.jsx                 │
│  ✓ Formulaire pour entrer son email                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/auth/resend-verification                             │
│  Fichier: src/app/api/auth/resend-verification/route.js        │
│  ✓ Cherche utilisateur par email                               │
│  ✓ Vérifie qu'il existe et n'est pas déjà vérifié             │
│  ✓ Génère nouveau token → createVerificationToken()            │
│    (supprime l'ancien automatiquement)                          │
│  ✓ Envoie nouvel email → sendResendVerificationEmail()        │
│  ✓ Retourne succès                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ (retour au début du workflow)
            Utilisateur reçoit nouvel email
```

---

## Étapes détaillées

### 1. Inscription (Sign Up)

**Fichier:** `src/app/api/auth/signup/route.js`

```javascript
// Étapes:
1. Validation Zod du formulaire (email, username, password, confirmPassword)
2. Vérification unicité email (LOWER CASE)
3. Vérification unicité username
4. Hash du mot de passe avec bcryptjs (10 rounds)
5. Création utilisateur dans DB:
   - emailVerified: false ← Important !
   - emailVerifiedAt: null
   - [autres champs: username, email, password, exercises, workouts, sessions, createdAt, updatedAt]
6. Appel createVerificationToken(userId, email)
7. Appel sendVerificationEmail(email, username, token)
8. Gestion erreur email (utilisateur créé quand même)
9. Retour réponse avec message "Email de vérification envoyé"
```

**Code clé:**

```javascript
const result = await usersCollection.insertOne({
  emailVerified: false, // ← Le plus important
  emailVerifiedAt: null,
  // ... autres champs
});

const verificationToken = await createVerificationToken(userId, email);
await sendVerificationEmail(email, username, verificationToken);
```

---

### 2. Génération du Token

**Fichier:** `src/libs/emailVerification.js`

**Fonction:** `createVerificationToken(userId, email)`

```javascript
// Processus:
1. Appel generateVerificationToken() → crypto.randomBytes(32).toString('hex')
   Résultat: 64 caractères hex (256 bits d'entropie)
2. Hash le token: hashToken(plainToken)
   Utilise SHA-256 (crypto.createHash('sha256'))
3. Calcule expiration: new Date(Date.now() + 24h)
4. Supprime les anciens tokens pour cet utilisateur
5. Insère dans collection 'emailVerificationTokens':
   {
     userId: ObjectId,
     email: string,
     token: string (HASHÉ, pas en clair),
     expiresAt: Date,
     createdAt: Date
   }
6. Retourne le token EN CLAIR (pour l'email)
```

**Sécurité:** Le token stocké en DB est hashé. Même si quelqu'un accède à la DB, il ne peut pas utiliser les tokens.

---

### 3. Envoi d'Email

**Fichier:** `src/libs/emailService.js`

**Fonction:** `sendVerificationEmail(email, username, token)`

```javascript
// Processus:
1. Construit URL: ${NEXT_PUBLIC_APP_URL}/verify-email?token=${token}
2. Crée payload Resend:
   - from: RESEND_FROM_EMAIL
   - to: email
   - subject: "Vérifiez votre adresse email - FitBuilder"
   - html: [template HTML responsif avec couleurs design system]
   - text: [version texte brut]
3. Appel resend.emails.send(payload)
4. Gestion erreur Resend (throw si erreur)
5. Retour {success: true, messageId: xxx}
```

**Alternative:** `sendResendVerificationEmail(email, username, token)`

- Même processus mais avec subject/design différent
- Indique que c'est un renvoi (pas la première fois)

---

### 4. Vérification du Token

**Fichier:** `src/app/api/auth/verify-email/route.js`

**Route:** `GET /api/auth/verify-email?token=xxx`

```javascript
// Processus:
1. Récupère token depuis query params
2. Appel verifyToken(token):
   a. Hash le token reçu: hashToken(plainToken)
   b. Cherche dans DB:
      {
        token: hashedToken,
        expiresAt: { $gt: new Date() }  // non expiré
      }
   c. Retourne {userId, email} ou null
3. Gestion résultats:
   - Token null → error "Token invalide ou expiré" + expired: true
   - Utilisateur introuvable → error "Utilisateur introuvable"
   - Email déjà vérifié → success + alreadyVerified: true
   - Sinon → mise à jour:
     {
       emailVerified: true,
       emailVerifiedAt: new Date(),
       updatedAt: new Date()
     }
4. Appel deleteToken(token) → supprime le token de la DB
   Sécurité: évite la réutilisation
5. Retour success: true
```

---

### 5. Vérification à la Connexion

**Fichier:** `src/libs/auth.js`

**Provider:** `CredentialsProvider`

```javascript
// Vérification après vérification du mot de passe:
if (!user.emailVerified && user.password) {
  throw new Error(
    "Veuillez vérifier votre adresse email avant de vous connecter..."
  );
}

// Logique:
- Si emailVerified: false ET user.password existe → BLOQUE
- Si emailVerified: true → OK
- Google OAuth: user.password n'existe pas → contourné
```

**Google OAuth:**
Lors de la création/liaison d'un compte Google:

```javascript
{
  emailVerified: true,        // ← Google vérifie déjà
  emailVerifiedAt: new Date() // ← Timestamp de vérification
}
```

---

### 6. Renvoi d'Email (Cas Token Expiré)

**Fichier:** `src/app/api/auth/resend-verification/route.js`

**Route:** `POST /api/auth/resend-verification`

```javascript
// Processus:
1. Récupère email depuis body { email }
2. Cherche utilisateur
3. Vérifications:
   - Utilisateur existe? (retour message générique pour sécurité)
   - Email déjà vérifié? → retour erreur
   - Compte avec mot de passe? (pas Google OAuth)
4. Appel createVerificationToken(userId, email)
   → L'ancien token est supprimé automatiquement
5. Appel sendResendVerificationEmail(email, username, token)
6. Retour message "Nouveau lien envoyé"
```

---

## Fichiers et fonctions

### Utilitaires

| Fichier                         | Fonction                                              | Rôle                                              |
| ------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| `src/libs/emailVerification.js` | `generateVerificationToken()`                         | Génère token aléatoire (32 bytes)                 |
|                                 | `hashToken(token)`                                    | Hash SHA-256 du token                             |
|                                 | `createVerificationToken(userId, email)`              | Crée + stocke token dans DB, retourne token clair |
|                                 | `verifyToken(plainToken)`                             | Vérifie token clair contre hash en DB             |
|                                 | `deleteToken(plainToken)`                             | Supprime token après utilisation                  |
|                                 | `cleanupExpiredTokens()`                              | Nettoie les tokens expirés (cron job optionnel)   |
| `src/libs/emailService.js`      | `sendVerificationEmail(email, username, token)`       | Envoie email initial                              |
|                                 | `sendResendVerificationEmail(email, username, token)` | Envoie email de renvoi                            |

### Routes API

| Route                           | Méthode | Fichier                                         | Rôle                                      |
| ------------------------------- | ------- | ----------------------------------------------- | ----------------------------------------- |
| `/api/auth/signup`              | POST    | `src/app/api/auth/signup/route.js`              | Crée utilisateur + token + email          |
| `/api/auth/verify-email`        | GET     | `src/app/api/auth/verify-email/route.js`        | Valide token + marque email comme vérifié |
| `/api/auth/resend-verification` | POST    | `src/app/api/auth/resend-verification/route.js` | Génère nouveau token + envoie email       |

### Pages

| Route                     | Fichier                                                                 | Rôle                                  |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| `/verify-email?token=xxx` | `src/app/verify-email/page.jsx` + `VerifyEmailClient.jsx`               | Affiche résultat vérification         |
| `/resend-verification`    | `src/app/resend-verification/page.jsx` + `ResendVerificationClient.jsx` | Formulaire pour demander nouveau lien |

### Connexion

| Fichier            | Modification                      | Rôle                                    |
| ------------------ | --------------------------------- | --------------------------------------- |
| `src/libs/auth.js` | CredentialsProvider `authorize()` | Vérifie `emailVerified` avant connexion |
|                    | Callback `signIn()`               | Marque Google OAuth comme vérifié       |

---

## Variables d'environnement

```bash
# .env.local

# Resend API (récupérer sur https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email expéditeur (domaine must être vérifié dans Resend)
RESEND_FROM_EMAIL="FitBuilder <noreply@votredomaine.com>"

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"        # DEV
NEXT_PUBLIC_APP_URL="https://fitbuilder.com"       # PROD

# NextAuth (obligatoire pour auth)
NEXTAUTH_URL="http://localhost:3000"               # DEV
NEXTAUTH_URL="https://fitbuilder.com"              # PROD
NEXTAUTH_SECRET="votre_secret_aleatoire"
```

---

## Collection MongoDB

### Collection: `users`

Champs importants pour la vérification:

```javascript
{
  _id: ObjectId,
  email: string,
  username: string,
  password: string (hashé),

  // ← Champs de vérification
  emailVerified: boolean,        // false à l'inscription
  emailVerifiedAt: Date | null,  // null jusqu'à vérification

  // Autres champs
  createdAt: Date,
  updatedAt: Date,
  exercises: Array,
  workouts: Array,
  sessions: Array,
  // ... autres champs
}
```

### Collection: `emailVerificationTokens`

Structure:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // Référence à l'utilisateur
  email: string,                 // Email de l'utilisateur
  token: string,                 // SHA-256 du token (PAS le token en clair!)
  expiresAt: Date,              // new Date(Date.now() + 24*60*60*1000)
  createdAt: Date,

  // Index recommandé pour nettoyer automatiquement:
  // db.emailVerificationTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
}
```

**Important:** Le token stocké est HASHÉ. Le token en clair ne doit jamais être stocké en DB.

---

## Points de sécurité

### 1. **Token sécurisé**

- ✅ 32 bytes aléatoires (256 bits d'entropie)
- ✅ Hashé SHA-256 avant stockage
- ✅ Token en clair envoyé par email uniquement
- ✅ Supprimé après utilisation (pas de réutilisation)
- ✅ Expiration 24h

### 2. **Pas de révélation d'information**

- ✅ `/api/auth/resend-verification`: Message générique si email introuvable
  - Évite l'énumération d'utilisateurs

### 3. **Vérification bloquante**

- ✅ Impossible de se connecter sans vérifier l'email
- ✅ Exception pour Google OAuth (Google vérifie déjà)

### 4. **Email en minuscules**

- ✅ Toujours `.toLowerCase()` pour éviter les doublons

### 5. **Gestion d'erreurs**

- ✅ Utilisateur créé même si email ne peut pas être envoyé
- ✅ Page `/resend-verification` permet un renvoi

---

## Debugging

### Vérifier qu'un token est généré

Dans `/api/auth/signup` (avant d'envoyer):

```javascript
console.log("🔐 Token généré:", verificationToken);
console.log(
  "🔗 URL de vérification:",
  `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
);
```

### Tester la vérification manuellement

1. Créer un utilisateur via `/signup`
2. Aller dans la console serveur et copier le token
3. Appel manuel:

```bash
curl "http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN"
```

### Vérifier la DB

```bash
# Collection users
db.users.findOne({ email: "test@example.com" })
# Résultat: { emailVerified: false, emailVerifiedAt: null }

# Collection emailVerificationTokens
db.emailVerificationTokens.find({ email: "test@example.com" })
# Résultat: { token: "abc123...", expiresAt: Date, ... }

# Après vérification
db.users.findOne({ email: "test@example.com" })
# Résultat: { emailVerified: true, emailVerifiedAt: ISODate("2024-01-08T...") }

db.emailVerificationTokens.find({ email: "test@example.com" })
# Résultat: [] (token supprimé)
```

### Problèmes courants

| Problème                             | Cause                                | Solution                                  |
| ------------------------------------ | ------------------------------------ | ----------------------------------------- |
| Email ne s'envoie pas                | RESEND_API_KEY manquante ou invalide | Vérifier `.env.local`                     |
| Lien d'email mauvais                 | `NEXT_PUBLIC_APP_URL` incorrect      | Vérifier `.env.local`                     |
| "Token invalide"                     | Token malformé ou expiré             | Token stocké est HASHÉ, pas en clair      |
| Utilisateur ne peut pas se connecter | `emailVerified: false`               | Vérifier que le token a bien été appliqué |
| Erreur "Email déjà utilisé"          | Email en casse différente            | Tous les emails sont en minuscules        |

### Logs recommandés

```javascript
// signup
console.log("✅ Utilisateur créé:", userId);
console.log("🔐 Token généré (clair):", verificationToken);
console.log("📧 Email envoyé à:", email);

// verify-email
console.log("✓ Token reçu:", token);
console.log("✓ Token valide, utilisateur:", userId);
console.log("✓ Email marqué comme vérifié");
console.log("✓ Token supprimé après utilisation");

// resend-verification
console.log("✓ Utilisateur trouvé:", email);
console.log("🔐 Nouveau token généré");
console.log("📧 Email de renvoi envoyé");
```

---

## Réutilisation dans un autre projet

Pour adapter ce système à un autre projet:

1. **Copier les fichiers utilitaires:**

   - `src/libs/emailVerification.js`
   - `src/libs/emailService.js`

2. **Adapter les emails:** Modifier les templates HTML dans `emailService.js`

3. **Adapter les routes API:** Copier les 3 routes avec vos logiques métier spécifiques

4. **Adapter la validation:** Modifier la Zod schema dans votre route signup

5. **Adapter la connexion:** Ajouter les vérifications `emailVerified` dans votre provider auth

6. **Configurer Resend:**

   - Créer compte sur https://resend.com
   - Vérifier un domaine
   - Générer une API key
   - Ajouter variables d'environnement

7. **Créer les collections MongoDB:**
   ```javascript
   db.createCollection("emailVerificationTokens");
   db.emailVerificationTokens.createIndex(
     { expiresAt: 1 },
     { expireAfterSeconds: 0 },
   );
   ```

---

**Dernière modification:** Jan 2025
**Statut:** ✅ Production ready
