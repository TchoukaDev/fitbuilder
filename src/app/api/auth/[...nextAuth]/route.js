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

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await connectDB();
          const users = db.collection("users");

          // ÉTAPE 1 : Vérifier si l'utilisateur existe
          const user = await users.findOne({ email: credentials.email });

          // ÉTAPE 2 : Vérifier si compte bloqué
          if (user && user.blocked) {
            throw new Error(
              "Votre compte est bloqué. Veuillez contacter l'administrateur du site",
            );
          }

          // ÉTAPE 3 : Vérifier le mot de passe
          const isValidPassword =
            user && (await bcrypt.compare(credentials.password, user.password));

          // ÉTAPE 4 : Échec de connexion
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

              // Si compte bloqué
              if (shouldBlock) {
                throw new Error(
                  "Votre compte a été bloqué après 5 tentatives échouées. Contactez l'administrateur.",
                );
              } else {
                const remainingAttempts = 5 - newAttempts;
                // On indique le nmbre de tentatvies restantes après  3 essais
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

          // ÉTAPE 5 : Succès - Réinitialiser les tentatives
          await users.updateOne(
            { _id: user._id },
            {
              $set: {
                loginAttempts: 0,
                lastFailedLogin: null,
              },
            },
          );

          // ÉTAPE 6 : Retourner les données utilisateur
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
  // 🕐 CONFIGURATION SESSION
  // ========================================
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Refresh toutes les 24h
  },

  // ========================================
  // 🍪 CONFIGURATION COOKIES
  // ========================================
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },

  // ========================================
  // 🎨 PAGES PERSONNALISÉES
  // ========================================
  pages: {
    signIn: "/",
  },

  // ========================================
  // 🔐 SECRET
  // ========================================
  secret: process.env.NEXTAUTH_SECRET,

  // ========================================
  // 🔄 CALLBACKS
  // ========================================
  callbacks: {
    // ------------------------------------
    // ✅ CALLBACK SIGNIN
    // ------------------------------------
    async signIn({ user, account, profile }) {
      console.log("🔵 SIGNIN callback - Provider:", account?.provider);

      // Gestion Google OAuth
      if (account?.provider === "google") {
        try {
          const db = await connectDB();
          const users = db.collection("users");

          const existingUser = await users.findOne({ email: profile.email });

          if (existingUser) {
            console.log("👤 User existe, liaison compte Google");

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
            console.log("🆕 Création nouveau user Google");

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

          console.log("✅ Google signin terminé");
        } catch (error) {
          console.error("❌ Erreur signIn Google:", error);
          return false;
        }
      }

      return true;
    },

    // ------------------------------------
    // 🔐 CALLBACK JWT
    // ------------------------------------
    async jwt({ token, user, account, profile }) {
      console.log("🟢 JWT callback");

      // Premier login
      if (user) {
        console.log("🟢 Premier login");

        if (account?.provider === "google") {
          console.log("🟢 Google provider");

          // Récupérer l'ID MongoDB du user Google
          try {
            const db = await connectDB();
            const users = db.collection("users");
            const dbUser = await users.findOne({ email: profile.email });

            token.id = dbUser ? dbUser._id.toString() : user.id;
            token.email = user.email || profile.email;
            token.username = user.username || profile.name;
            token.image = user.image || profile.picture;
            token.provider = "google";
            token.autoLogin = true; // Google = toujours session longue
            token.maxAge = 30 * 24 * 60 * 60;
          } catch (error) {
            console.error("Erreur récupération user Google:", error);
            token.id = user.id;
            token.email = user.email;
            token.username = user.username;
            token.image = user.image;
            token.provider = "google";
            token.autoLogin = true;
            token.maxAge = 30 * 24 * 60 * 60;
          }
        } else {
          console.log("🟢 Credentials provider");

          token.id = user.id;
          token.email = user.email;
          token.username = user.username;
          token.image = user.image || null;
          token.blocked = user.blocked;
          token.provider = "credentials";
          token.autoLogin = user.autoLogin;
          token.maxAge = user.autoLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60; //30 jours, sinon 24 heures
        }

        token.exp = Math.floor(Date.now() / 1000) + token.maxAge;
      }

      // Vérification du statut blocked (credentials uniquement)
      if (token?.id && token.provider === "credentials") {
        try {
          const db = await connectDB();
          const users = db.collection("users");
          const userData = await users.findOne({
            _id: new (await import("mongodb")).ObjectId(token.id),
          });

          if (userData) {
            token.blocked = userData.blocked || false;
          }
        } catch (error) {
          console.error("❌ Erreur vérification blocked:", error);
        }
      }

      return token;
    },

    // ------------------------------------
    // 🌐 CALLBACK SESSION
    // ------------------------------------
    async session({ session, token }) {
      console.log("🟡 SESSION callback");

      // Copier les données du token dans la session
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.blocked = token.blocked || false;
      session.user.provider = token.provider;
      session.user.image = token.image || null;

      // Définir l'expiration
      const now = Date.now();

      if (token.autoLogin) {
        session.expires = new Date(
          now + 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
      } else {
        session.expires = new Date(now + 24 * 60 * 60 * 1000).toISOString();
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
