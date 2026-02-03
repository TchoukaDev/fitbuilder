import "next-auth";
import "next-auth/jwt";

/**
 * ===== MODULE AUGMENTATION =====
 * 
 * NextAuth a des types par défaut (User, Session, JWT).
 * Mais on a ajouté des propriétés custom (username, role, blocked, etc.).
 * 
 * Ce fichier "étend" les types de NextAuth pour ajouter nos propriétés.
 * TypeScript va FUSIONNER ces définitions avec celles de NextAuth.
 * 
 * 📌 Le nom du fichier DOIT être .d.ts (declaration file)
 */

// Étend le module "next-auth"
declare module "next-auth" {
  /**
   * Profile retourné par Google OAuth
   * Contient les infos du compte Google
   */
  interface Profile {
    sub?: string;        // ID unique Google
    name?: string;       // Nom complet
    email?: string;      // Email
    picture?: string;    // URL de l'avatar
  }
  /**
   * L'objet User retourné par authorize() dans CredentialsProvider
   * et utilisé dans les callbacks
   */
  interface User {
    id: string;
    email: string;
    username?: string | null;
    image?: string | null;
    role?: string | null;
    blocked?: boolean;
    autoLogin?: boolean;
  }

  /**
   * L'objet Session retourné par useSession() et getServerSession()
   * C'est ce que le CLIENT reçoit
   */
  interface Session {
    user: {
      id: string;
      email: string;
      username?: string | null;
      image?: string | null;
      role?: string | null;
      blocked?: boolean;
      provider?: "credentials" | "google";
    };
    expires: string;
  }
}

// Étend le module "next-auth/jwt"
declare module "next-auth/jwt" {
  /**
   * L'objet JWT stocké dans le cookie
   * Contient TOUTES les données (plus que Session)
   */
  interface JWT {
    id: string;
    email: string;
    username?: string | null;
    image?: string | null;
    role?: string | null;
    blocked?: boolean;
    provider?: "credentials" | "google";
    autoLogin?: boolean;
    maxAge?: number;
    lastCheck?: number;
    exp?: number;
  }
}
