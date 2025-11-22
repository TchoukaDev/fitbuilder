// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/libs/mongodb";

export const authOptions = {
  providers: [
    // ========================================
    // 🟢 GOOGLE OAUTH
    // ========================================
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ✅ AJOUTEZ CECI :
      authorization: {
        params: {
          prompt: "select_account", // Force le choix du compte
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // ========================================
    // 🔑 CREDENTIALS (Email/Password)
    // ========================================
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        autoLogin: { label: "Auto Login", type: "text" },
      },

      // ⚠️ authorize() s'exécute UNIQUEMENT lors de signIn()
      // Retourne un objet user si succès, null/throw si échec
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ou mot de passe incorrect.");
        }

        try {
          const db = await connectDB();
          const users = db.collection("users");

          const user = await users.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("Email ou mot de passe incorrect");
          }

          if (user && !user.password) {
            throw new Error(
              "Echec de connexion. Essayer une autre méthode d'authentification.",
            );
          }
          // Vérifier si compte bloqué
          if (user?.blocked) {
            throw new Error(
              "Votre compte est bloqué. Veuillez contacter l'administrateur du site",
            );
          }

          // Vérifier le mot de passe
          const isValidPassword =
            user && (await bcrypt.compare(credentials.password, user.password));

          // ❌ Échec de connexion : incrémenter tentatives
          if (!isValidPassword) {
            if (user) {
              const newAttempts = (user.loginAttempts || 0) + 1;
              const shouldBlock = newAttempts >= 5;

              await users.updateOne(
                { _id: user._id },
                {
                  $set: {
                    loginAttempts: newAttempts,
                    lastFailedLogin: new Date(),
                    blocked: shouldBlock,
                  },
                },
              );

              if (shouldBlock) {
                throw new Error(
                  "Votre compte a été bloqué après 5 tentatives échouées. Contactez l'administrateur.",
                );
              } else {
                const remainingAttempts = 5 - newAttempts;
                if (remainingAttempts < 3) {
                  throw new Error(
                    `Identifiants incorrects. Il vous reste ${remainingAttempts} tentative(s).`,
                  );
                } else {
                  throw new Error("Adresse E-mail ou mot de passe incorrect");
                }
              }
            }
            throw new Error("Adresse E-mail ou mot de passe incorrect");
          }

          // ✅ Succès : réinitialiser les tentatives
          await users.updateOne(
            { _id: user._id },
            {
              $set: {
                loginAttempts: 0,
                lastFailedLogin: null,
              },
            },
          );

          // ✅ Retourner l'objet user (sera accessible dans jwt callback)
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username || null,
            role: user.role || null,
            blocked: false,
            autoLogin: credentials.autoLogin === "true",
          };
        } catch (error) {
          console.error("💥 Erreur authorize:", error);
          throw error;
        }
      },
    }),
  ],

  // ========================================
  // 🕐 SESSION : Mode JWT + durées
  // ========================================
  session: {
    strategy: "jwt", // Token stocké dans cookie (pas en DB)
    maxAge: 30 * 24 * 60 * 60, // 30j par défaut (⚠️ sera écrasé dynamiquement)
    updateAge: 24 * 60 * 60, // Regénère le token toutes les 24h
  },

  // ========================================
  // 🍪 COOKIES : Configuration du cookie de session
  // ========================================
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true, // Pas accessible via JS (sécurité XSS)
        sameSite: "lax", // Protection CSRF
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS uniquement
      },
    },
  },

  pages: {
    signIn: "/", // Redirection vers page de connexion
  },

  secret: process.env.NEXTAUTH_SECRET,

  // ========================================
  // 🔄 CALLBACKS : Le cœur de NextAuth
  // ========================================
  callbacks: {
    // ------------------------------------
    // ✅ SIGNIN : Autoriser/bloquer la connexion
    // S'exécute AVANT jwt callback
    // ------------------------------------
    async signIn({ user, account, profile }) {
      // Google OAuth : créer/lier le compte en DB
      if (account?.provider === "google") {
        try {
          const db = await connectDB();
          const users = db.collection("users");
          const existingUser = await users.findOne({ email: profile.email });

          if (existingUser) {
            // Lier le compte Google à l'utilisateur existant
            await users.updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  googleId: profile.sub,
                  image: profile.picture,
                  username: profile.name,
                },
              },
            );
          } else {
            // Créer un nouvel utilisateur
            await users.insertOne({
              email: profile.email,
              username: profile.name,
              image: profile.picture,
              provider: "google",
              googleId: profile.sub,
              createdAt: new Date(),
              blocked: false,
              loginAttempts: 0,
            });
          }
        } catch (error) {
          console.error("❌ Erreur signIn Google:", error);
          return false; // Bloque la connexion
        }
      }

      return true; // ✅ Autoriser la connexion
    },

    // ------------------------------------
    // 🔐 JWT : Construire le token
    // S'exécute à CHAQUE requête + lors du signIn
    // ------------------------------------
    async jwt({ token, user, account, profile }) {
      // 1️⃣ Premier login : "user" existe
      if (user) {
        // Google OAuth
        if (account?.provider === "google") {
          try {
            const db = await connectDB();
            const users = db.collection("users");
            const dbUser = await users.findOne({ email: profile.email });

            token.id = dbUser ? dbUser._id.toString() : user.id;
            token.email = user.email || profile.email;
            token.username = user.username || profile.name;
            token.image = user.image || profile.picture;
            token.provider = "google";
            token.role =
              user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";
            token.autoLogin = true; // Google = session longue
            token.maxAge = 30 * 24 * 60 * 60; // 30 jours
          } catch (error) {
            console.error("Erreur récupération user Google:", error);
            // Fallback si erreur DB
            token.id = user.id;
            token.email = user.email;
            token.role =
              user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";
            token.username = user.username;
            token.image = user.image;
            token.provider = "google";
            token.autoLogin = true;
            token.maxAge = 30 * 24 * 60 * 60;
          }
        }
        // Credentials (email/password)
        else {
          token.id = user.id;
          token.email = user.email;
          (token.role =
            user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER"),
            (token.username = user.username);
          token.image = user.image || null;
          token.blocked = user.blocked;
          token.provider = "credentials";
          token.autoLogin = user.autoLogin;
          // 📌 Durée dynamique selon "Rester connecté"
          token.maxAge = user.autoLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        }

        // Calculer l'expiration
        token.exp = Math.floor(Date.now() / 1000) + token.maxAge;
      }

      // Vérifier seulement toutes les 5 minutes si l'utilisateur est bloqué
      if (token?.id && token.provider === "credentials") {
        // Vérifier si dernière vérif > 5 min
        const now = Date.now();
        const cinqMinutes = 5 * 60 * 1000; // 5 min en millisecondes

        // SI pas de lastCheck OU si > 5 min
        if (!token.lastCheck || now - token.lastCheck > cinqMinutes) {
          // ALORS on vérifie en DB
          const db = await connectDB();
          const users = db.collection("users");
          const userData = await users.findOne({
            _id: new (await import("mongodb")).ObjectId(token.id),
          });

          if (userData) {
            token.blocked = userData.blocked;
            token.lastCheck = now; // 📌 Mémoriser l'heure
          }
        }
        // SINON on ne fait rien, on garde le token tel quel
      }

      return token; // ✅ Token renvoyé au cookie
    },

    // ------------------------------------
    // 🌐 SESSION : Ce que reçoit le client
    // S'exécute à chaque appel useSession() / getServerSession()
    // ------------------------------------
    async session({ session, token }) {
      // Transférer les données du token vers la session
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.blocked = token.blocked || false;
      session.user.provider = token.provider;
      session.user.image = token.image || null;

      // 📌 Définir l'expiration selon autoLogin
      const now = Date.now();
      if (token.autoLogin) {
        session.expires = new Date(
          now + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(); // 30j
      } else {
        session.expires = new Date(now + 24 * 60 * 60 * 1000).toISOString(); // 24h
      }

      return session; // ✅ Accessible via useSession()
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
