import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Checking tables...");
        const tables = await db.execute(sql`SHOW TABLES;`);
        console.log("Tables found:", JSON.stringify(tables, null, 2));
    } catch (e) {
        console.error("Error checking tables:", e);
    } finally {
        process.exit(0);
    }
}

main();
