import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function getPublicTemplates() {
  const db = await connectDB();
  const publicTemplates =
    (await db
      .collection("workoutTemplates")
      .find({ isPublic: true })
      .toArray()) || [];

  return publicTemplates?.map((e) => ({
    ...e,
    type: "public",
    _id: e._id.toString(),
  }));
}

export async function getPrivateTemplates(userId) {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const privateTemplates = user?.workoutTemplates || [];

  return privateTemplates.map((e) => ({
    ...e,
    type: "private",
    _id: e._id.toString(),
  }));
}

export async function getAllTemplates(userId) {
  const [publicTemplates, privateTemplates] = await Promise.all([
    getPublicTemplates(),
    getPrivateTemplates(userId),
  ]);

  const allTemplates = [...publicTemplates, ...privateTemplates];

  return allTemplates;
}
