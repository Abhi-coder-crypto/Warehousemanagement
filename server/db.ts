// Mock db.ts to satisfy imports if any, though we use MemStorage.
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// We are using MemStorage, so we don't need a real DB connection.
// This is just a placeholder to prevent import errors in standard template code if it were used.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://mock:mock@localhost:5432/mock" });
export const db = drizzle(pool, { schema });
