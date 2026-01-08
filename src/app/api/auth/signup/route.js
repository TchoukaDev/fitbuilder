// API Route pour l'inscription d'un nouvel utilisateur
import connectDB from "@/libs/mongodb";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/Features/Auth/utils";
import { NextResponse } from "next/server";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { createVerificationToken } from "@/libs/emailVerification";
import { sendVerificationEmail } from "@/libs/emailService";

// POST - Créer un nouveau compte utilisateur
export async function POST(req) {
  try {
    // Extraction et validation des données
    const body = await req.json();
    const validationResult = signUpSchema.safeParse(body);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: ApiError.VALIDATION_ERROR.message,
          fieldErrors: fieldErrors,
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Vérification de l'unicité de l'email
    const existingEmail = await usersCollection.findOne({
      email: validatedData.email.toLowerCase(),
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: ApiError.ALREADY_EXISTS("Email").message,
          fieldErrors: { email: "Cet email est déjà utilisé" },
        },
        { status: 409 },
      );
    }

    // Vérification de l'unicité du username
    const existingUsername = await usersCollection.findOne({
      username: validatedData.username,
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          error: ApiError.ALREADY_EXISTS("Nom d'utilisateur").message,
          fieldErrors: { username: "Ce nom d'utilisateur est déjà pris" },
        },
        { status: 409 },
      );
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Création de l'utilisateur
    const result = await usersCollection.insertOne({
      username: validatedData.username,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      emailVerifiedAt: null,
      exercises: [],
      favoritesExercises: [],
      workouts: [],
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = result.insertedId.toString();

    // Génération et stockage du token de vérification (24h)
    const verificationToken = await createVerificationToken(
      userId,
      validatedData.email.toLowerCase(),
    );

    // Envoi de l'email de vérification avec le token
    try {
      await sendVerificationEmail(
        validatedData.email.toLowerCase(),
        validatedData.username,
        verificationToken,
      );

      console.log("✅ Email de vérification envoyé à:", validatedData.email);
    } catch (emailError) {
      // L'utilisateur est créé mais l'email n'a pas pu être envoyé
      console.error("❌ Erreur envoi email:", emailError);

      // On retourne quand même un succès mais avec un message différent
      return NextResponse.json(
        {
          success: true,
          message:
            "Compte créé mais l'email de vérification n'a pas pu être envoyé. Veuillez demander un renvoi.",
          user: {
            id: userId,
            username: validatedData.username,
            email: validatedData.email.toLowerCase(),
          },
        },
        { status: 201 },
      );
    }

    // Succès complet : utilisateur créé + email envoyé
    return NextResponse.json(
      {
        success: true,
        message:
          "Compte créé avec succès ! Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte mail (pensez aux spams).",
        user: {
          id: userId,
          username: validatedData.username,
          email: validatedData.email.toLowerCase(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur création utilisateur:", error);

    return NextResponse.json(
      {
        success: false,
        error: ApiError.SERVER_ERROR,
      },
      { status: 500 },
    );
  }
}
