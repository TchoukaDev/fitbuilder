const { default: connectDB } = require("@/libs/mongodb");
const { ObjectId } = require("mongodb");

export const getAllSessions = async (userId) => {
  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const sessions = user?.sessions;

    return sessions;
  } catch (error) {
    console.error(
      error ||
        "une erreur est survenue lors de la récupération des sessions côtés serveur",
    );
    throw new Error("Erreur lors de la récupération des sessions");
  }
};

export const getSessionbyId = async (userId, sessionId) => {
  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      console.error("❌ Utilisateur non trouvé:", userId);
      return null;
    }

    if (!user.sessions || user.sessions.length === 0) {
      console.error("❌ Aucune session pour cet utilisateur");
      return null;
    }

    // ✅ Trouver la bonne session
    const data = user.sessions.find(
      (session) => session._id.toString() === sessionId,
    );

    if (!data) {
      console.error("❌ Session non trouvée:", sessionId);
      console.log(
        "📋 Sessions disponibles:",
        user.sessions.map((s) => s._id.toString()),
      );
      return null;
    }

    // ✅ Convertir les ObjectId en strings
    const session = {
      ...data,
      _id: data._id.toString(),
      userId: data.userId.toString(),
      templateId: data.templateId.toString(),
    };

    console.log("✅ Session trouvée:", session._id);
    return session;
  } catch (error) {
    console.error("❌ Erreur getSessionbyId:", error);
    return null;
  }
};
