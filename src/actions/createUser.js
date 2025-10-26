"use server";

import connectDB from "@/libs/mongodb";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/utils/validation";

export async function createUser(prevState, formData) {
  const standardError =
    "Une erreur est survenue côté serveur. Merci de réessayer plus tard.";

  try {
    // 1. Extraction des données
    const rawData = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    // 2. Validation Zod
    const validationResult = signUpSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });

      return {
        success: false,
        error: standardError,
        fieldErrors: fieldErrors,
      };
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
      return {
        success: false,
        error: standardError,
        fieldErrors: { email: "Cet email est déjà utilisé" },
      };
    }

    // 5. Vérifier si le username existe
    const existingUsername = await usersCollection.findOne({
      username: validatedData.username,
    });

    if (existingUsername) {
      return {
        success: false,
        error: standardError,
        fieldErrors: { username: "Ce nom d'utilisateur est déjà pris" },
      };
    }

    // 6. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 7. Créer l'utilisateur
    const result = await usersCollection.insertOne({
      username: validatedData.username,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 8. Retourner le succès
    return {
      success: true,
      message: "Compte créé avec succès !",
      user: {
        id: result.insertedId.toString(),
        username: validatedData.username,
        email: validatedData.email.toLowerCase(),
      },
    };
  } catch (error) {
    console.error("Erreur création utilisateur:", error);

    return {
      success: false,
      error: standardError,
    };
  }
}
