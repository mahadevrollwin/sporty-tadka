import { MongoClient, ServerApiVersion, type Collection, type Document } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "sporty-tadka";

const globalForMongo = globalThis as unknown as {
  mongoClient?: Promise<MongoClient>;
  scoresReady?: Promise<Collection<Document>>;
};

export function mongoConfigured() {
  return Boolean(uri);
}

function clientPromise() {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalForMongo.mongoClient) {
    const client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    globalForMongo.mongoClient = client.connect();
  }
  return globalForMongo.mongoClient;
}

export function scoresCollection() {
  if (!uri) return null;
  if (!globalForMongo.scoresReady) {
    globalForMongo.scoresReady = clientPromise()
      .then(async (client) => {
        const scores = client.db(dbName).collection("scores");
        await scores.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true });
        await scores.createIndex({ createdAt: -1 });
        return scores;
      })
      .catch((error: unknown) => {
        globalForMongo.scoresReady = undefined;
        globalForMongo.mongoClient = undefined;
        throw error;
      });
  }
  return globalForMongo.scoresReady;
}

export async function getCollection(name: string) {
  if (!uri) return null;
  const client = await clientPromise();
  return client.db(dbName).collection(name);
}
