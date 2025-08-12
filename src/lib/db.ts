import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

interface GlobalWithMongoose {
  mongooseConn?: Promise<typeof import("mongoose")>;
}

declare const global: GlobalWithMongoose & typeof globalThis;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!global.mongooseConn) {
    global.mongooseConn = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  return global.mongooseConn;
}


