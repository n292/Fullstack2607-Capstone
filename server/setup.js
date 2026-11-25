import { readFile } from "node:fs/promises";
import { pool } from "./db.js";

try {
  const sql = await readFile(
    new URL("./database.sql", import.meta.url),
    "utf8"
  );

  await pool.query(sql);
  console.log("Database tables and sample data are ready.");
} catch (error) {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}