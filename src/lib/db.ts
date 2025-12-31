import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in environment variables");
}

const pool = mysql.createPool(process.env.DATABASE_URL || "");

export const db = drizzle(pool, { schema, mode: "default" });
