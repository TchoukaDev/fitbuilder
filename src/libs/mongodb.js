// libs/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let clientPromise;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true, // ← Important pour Node.js 22
    serverSelectionTimeoutMS: 10000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function connectDB() {
  try {
    const client = await clientPromise;
    const db = client.db();
    return db;
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error.message);
    throw error;
  }
}
