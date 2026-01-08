import crypto from "crypto";
import { ObjectId } from "mongodb";
import connectDB from "./mongodb";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Génère un token aléatoire sécurisé
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash le token avec SHA-256
 * SHA-256 suffit car le token a déjà 256 bits d'entropie
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Crée et stocke un token de vérification
 */
export async function createVerificationToken(userId, email) {
  const db = await connectDB();
  const tokensCollection = db.collection("emailVerificationTokens");

  // Génère le token
  const plainToken = generateVerificationToken();
  const hashedToken = hashToken(plainToken);

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // Supprime les anciens tokens pour cet utilisateur
  await tokensCollection.deleteMany({
    userId: new ObjectId(userId), // ✅ Convertit en ObjectId
  });

  // Insère le nouveau token
  await tokensCollection.insertOne({
    userId: new ObjectId(userId), // ✅ ObjectId
    email: email.toLowerCase(),
    token: hashedToken,
    expiresAt: expiresAt,
    createdAt: new Date(),
  });

  return plainToken; // Envoyer par email
}

/**
 * Vérifie un token - RECHERCHE DIRECTE (pas d'itération !)
 */
export async function verifyToken(plainToken) {
  const db = await connectDB();
  const tokensCollection = db.collection("emailVerificationTokens");

  // Hash le token reçu
  const hashedToken = hashToken(plainToken);

  // ✅ Recherche DIRECTE par le hash (une seule requête, instantané)
  const tokenDocument = await tokensCollection.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDocument) {
    return null; // Token invalide ou expiré
  }

  return {
    userId: tokenDocument.userId.toString(),
    email: tokenDocument.email,
  };
}

/**
 * Supprime un token après utilisation
 */
export async function deleteToken(plainToken) {
  const db = await connectDB();
  const tokensCollection = db.collection("emailVerificationTokens");

  const hashedToken = hashToken(plainToken);

  // ✅ Suppression directe par le hash
  await tokensCollection.deleteOne({ token: hashedToken });
}

/**
 * Nettoie les tokens expirés
 */
export async function cleanupExpiredTokens() {
  const db = await connectDB();
  const tokensCollection = db.collection("emailVerificationTokens");

  const result = await tokensCollection.deleteMany({
    expiresAt: { $lte: new Date() },
  });

  return result.deletedCount;
}
