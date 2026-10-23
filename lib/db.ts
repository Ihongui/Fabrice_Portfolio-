import mongoose from "mongoose";
mongoose.set("sanitizeFilter", true);
const uri = process.env.MONGODB_URI;
type Cache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalCache = globalThis as typeof globalThis & { mongooseCache?: Cache };
const cache = globalCache.mongooseCache ??= { connection: null, promise: null };
export async function connectDb() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (cache.connection) return cache.connection;
  cache.promise ??= mongoose.connect(uri!, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 });
  cache.connection = await cache.promise;
  return cache.connection;
}
