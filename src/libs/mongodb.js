import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

async function getClient() {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10, // ✅ Limite le nombre de connexions
      minPoolSize: 2, // ✅ Garde 2 connexions ouvertes minimum
    });
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export default async function connectDB() {
  try {
    const client = await getClient();

    // ✅ Test de ping pour vérifier si la connexion est active
    await client.db().admin().ping();

    return client.db();
  } catch (error) {
    console.error("❌ Connexion perdue, reconnexion...");

    // ✅ Réinitialiser et reconnecter
    global._mongoClientPromise = null;
    const client = await getClient();
    return client.db();
  }
}
