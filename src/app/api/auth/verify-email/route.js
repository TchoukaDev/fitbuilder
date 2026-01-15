// API Route pour vérifier l'email d'un utilisateur via le token
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { verifyToken, deleteToken } from "@/libs/emailVerification";
import { ObjectId } from "mongodb";

// GET - Vérifier le token et activer le compte
export async function GET(req) {
  try {
    // Récupère le token depuis les query params (?token=xxx)
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // Vérifie que le token existe
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Token manquant",
        },
        { status: 400 },
      );
    }

    // Vérifie la validité du token (hash + expiration)
    const tokenData = await verifyToken(token);

    // Token invalide ou expiré
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          error: "Token invalide ou expiré",
          expired: true, // Flag pour afficher "demander un nouveau lien"
        },
        { status: 400 },
      );
    }

    // Connexion DB et récupération de l'utilisateur
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(tokenData.userId),
    });

    // Vérifie que l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur introuvable",
        },
        { status: 404 },
      );
    }

    // Vérifie si l'email est déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Votre email est déjà vérifié. Vous pouvez vous connecter.",
          alreadyVerified: true,
        },
        { status: 200 },
      );
    }

    // Met à jour l'utilisateur : marque l'email comme vérifié
    await usersCollection.updateOne(
      { _id: new ObjectId(tokenData.userId) },
      {
        $set: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    // Supprime le token utilisé (évite la réutilisation)
    await deleteToken(token);

    // Succès : email vérifié
    return NextResponse.json(
      {
        success: true,
        email: tokenData.email,
        message: "Votre email a été vérifié avec succès ! ",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erreur vérification email:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de la vérification",
      },
      { status: 500 },
    );
  }
}
