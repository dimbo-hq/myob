import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://admin-bimbok:bimbok123@cluster0.1w1cxot.mongodb.net/myob-db?retryWrites=true&w=majority';
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.warn('⚠️ MongoDB connection warning (will use in-memory fallback if server is offline):', err.message);
      return client as MongoClient;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    return client as MongoClient;
  });
}

export async function getDatabase(): Promise<Db | null> {
  try {
    if (!clientPromise) return null;
    const client = await clientPromise;
    if (!client) return null;
    const dbName = process.env.MONGODB_DB || 'myob-db';
    return client.db(dbName);
  } catch (error) {
    console.warn('⚠️ Could not connect to MongoDB database:', error);
    return null;
  }
}

export default clientPromise;
