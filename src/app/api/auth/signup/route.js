import connectDB from "@/libs/mongodb";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/Features/Auth/utils";
import { NextResponse } from "next/server";

// Création d'utilisateur
export async function POST(req) {
  const standardError =
    "Une erreur est survenue côté serveur. Merci de réessayer plus tard.";

  try {
    // 2. Extraction des données du body
    const body = await req.json();

    // 2. Validation Zod
    const validationResult = signUpSchema.safeParse(body);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: standardError,
          fieldErrors: fieldErrors,
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    // 3. Connexion à MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // 4. Vérifier si l'email existe
    const existingEmail = await usersCollection.findOne({
      email: validatedData.email.toLowerCase(),
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: standardError,
          fieldErrors: { email: "Cet email est déjà utilisé" },
        },
        { status: 409 },
      );
    }

    // 5. Vérifier si le username existe
    const existingUsername = await usersCollection.findOne({
      username: validatedData.username,
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          error: standardError,
          fieldErrors: { username: "Ce nom d'utilisateur est déjà pris" },
        },
        { status: 409 },
      );
    }

    // 6. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 7. Créer l'utilisateur
    const result = await usersCollection.insertOne({
      username: validatedData.username,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      exercises: [],
      favoritesExercises: [],
      workouts: [],
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 8. Retourner le succès
    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès !",
        user: {
          id: result.insertedId.toString(),
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
        error: standardError,
      },
      { status: 500 },
    );
  }
}
