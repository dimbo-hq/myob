import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 4000,
};

let cachedClient: MongoClient | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientInstance: MongoClient | undefined;
}

export async function getDatabase(): Promise<Db | null> {
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set in environment variables.');
    return null;
  }

  const dbName = process.env.MONGODB_DB || 'myob-db';

  try {
    let client = global._mongoClientInstance || cachedClient;

    if (!client) {
      client = new MongoClient(uri, options);
      await client.connect();
      
      if (process.env.NODE_ENV === 'development') {
        global._mongoClientInstance = client;
      } else {
        cachedClient = client;
      }
    }

    // Ping to verify connection is alive
    await client.db('admin').command({ ping: 1 });
    return client.db(dbName);
  } catch (error: any) {
    // Reset cached client if topology is closed or connection failed
    global._mongoClientInstance = undefined;
    cachedClient = null;

    console.warn(
      '⚠️ MongoDB Atlas connection notice (ensure 0.0.0.0/0 is added in MongoDB Atlas -> Network Access):',
      error.message
    );
    return null;
  }
}

export default getDatabase;
