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
    const data = user?.sessions.find((session) => (session._id = sessionId));
    const session = {
      ...data,
      userId: data.userId.toString(),
      templateId: data.templateId.toString(),
    };

    return session;
  } catch (error) {
    console.error(error || "Erreur getSessionby Id");
  }
};
