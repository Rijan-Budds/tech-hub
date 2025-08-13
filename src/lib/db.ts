import mongoose from "mongoose";

interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare const global: GlobalWithMongoose & typeof globalThis;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) return cached!.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local or set it as an environment variable. " +
      "For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority " +
      "For local MongoDB, use: mongodb://localhost:27017/ecommerce"
    );
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;


