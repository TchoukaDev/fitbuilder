import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./libs/mongodb";

export const authOptions = {
  providers: [
    // ------------------------------------
    // 🟢 GOOGLE OAUTH
    // ------------------------------------
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ------------------------------------
    // 🔑 CREDENTIALS (Email/Password)
    // ------------------------------------
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        autoLogin: { label: "Auto Login", type: "text" },
      },

      async authorize(credentials) {
        // Validation des champs
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis.");
        }

        try {
          // Connexion MongoDB
          const db = await connectDB();
          const users = db.collection("users");

          // ÉTAPE 1 : Vérifier si l'utilisateur existe
          const user = await users.findOne({ email: credentials.email });

          // ÉTAPE 2 : Vérifier si le compte est bloqué
          if (user && user.blocked) {
            throw new Error(
              "Votre compte est bloqué. Veuillez contacter l'administrateur.",
            );
          }

          // ÉTAPE 3 : Vérifier le mot de passe
          const isValidPassword =
            user && (await bcrypt.compare(credentials.password, user.password));

          // ÉTAPE 4 : Gérer l'échec de connexion
          if (!user || !isValidPassword) {
            if (user) {
              const newAttempts = (user.loginAttempts || 0) + 1;
              const shouldBlock = newAttempts >= 5;

              // Incrémenter les tentatives et bloquer si >= 5
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
                  "Votre compte a été bloqué après 5 tentatives échouées.",
                );
              } else {
                throw new Error(
                  `Identifiants incorrects. Il vous reste ${
                    5 - newAttempts
                  } tentative(s).`,
                );
              }
            }

            throw new Error("Email ou mot de passe incorrect.");
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
            blocked: false,
            autoLogin: credentials.autoLogin === "true",
          };
        } catch (error) {
          console.error("💥 Erreur auth:", error);
          throw error;
        }
      },
    }),
  ],

  // ========================================
  // 🕐 CONFIGURATION DE LA SESSION
  // ========================================

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  // ========================================
  // 🍪 CONFIGURATION DES COOKIES
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
  // 🔐 SECRET JWT
  // ========================================

  secret: process.env.NEXTAUTH_SECRET,

  // ========================================
  // 🔄 CALLBACKS
  // ========================================

  callbacks: {
    // ------------------------------------
    // 🔐 CALLBACK JWT
    // ------------------------------------

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.blocked = user.blocked;
        token.autoLogin = user.autoLogin;
        token.provider = account?.provider;

        if (user.autoLogin) {
          token.maxAge = 30 * 24 * 60 * 60;
        } else {
          token.maxAge = 24 * 60 * 60;
        }

        token.exp = Math.floor(Date.now() / 1000) + token.maxAge;
      }

      // Vérification du statut blocked
      if (token?.id && token.provider === "credentials") {
        try {
          const db = await connectDB(); // ✅ Utilise ta fonction
          const users = db.collection("users");
          const userData = await users.findOne({ _id: token.id });

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
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.blocked = token.blocked;
      session.user.provider = token.provider;

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

    // ------------------------------------
    // ✅ CALLBACK SIGNIN
    // ------------------------------------

    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          const db = await connectDB();
          const users = db.collection("users");

          const existingUser = await users.findOne({ email: profile.email });

          if (!existingUser) {
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
          console.error("❌ Erreur création user Google:", error);
          return false;
        }
      }

      return true;
    },
  },
};

// ========================================
// 📤 EXPORT DES HANDLERS
// ========================================

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
