// API Route pour renvoyer un email de vérification
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { createVerificationToken } from "@/libs/emailVerification";
import { sendResendVerificationEmail } from "@/libs/emailService";
import { resendVerificationSchema } from "@/Features/Auth/utils";

// POST - Renvoyer un email de vérification
export async function POST(req) {
  try {
    // Récupère l'email
    const body = await req.json();

    const validatedData = resendVerificationSchema.safeParse(body);
    if (!validatedData.success) {
      console.log(validatedData.error.issues[0].message);
      return NextResponse.json(
        {
          success: false,
          error: validatedData.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const email = validatedData.data.email.toLowerCase();

    // Vérifie que l'email est fourni
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email manquant",
        },
        { status: 400 },
      );
    }

    // Connexion DB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Cherche l'utilisateur par email
    const user = await usersCollection.findOne({
      email: email,
    });

    // Vérifie que l'utilisateur existe
    if (!user) {
      // Par sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json(
        {
          success: true,
          message:
            "Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé.",
        },
        { status: 200 },
      );
    }

    // Vérifie si l'email est déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Cet email est déjà vérifié. Vous pouvez vous connecter.",
          alreadyVerified: true,
        },
        { status: 400 },
      );
    }

    // Vérifie que c'est un compte avec mot de passe (pas Google OAuth)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ce compte utilise une authentification externe (Google). Aucune vérification d'email nécessaire.",
        },
        { status: 400 },
      );
    }

    // Génère un nouveau token de vérification
    const verificationToken = await createVerificationToken(
      user._id.toString(),
      user.email,
    );

    // Envoie le nouvel email de vérification
    try {
      await sendResendVerificationEmail(
        user.email,
        user.username,
        verificationToken,
      );

      console.log("✅ Email de renvoi envoyé à:", user.email);

      return NextResponse.json(
        {
          success: true,
          message:
            "Un nouveau lien de vérification a été envoyé à votre adresse email. Consultez votre boîte mail (et les spams).",
        },
        { status: 200 },
      );
    } catch (emailError) {
      console.error("❌ Erreur envoi email:", emailError);

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible d'envoyer l'email. Veuillez réessayer dans quelques instants.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Erreur renvoi vérification:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue",
      },
      { status: 500 },
    );
  }
}
