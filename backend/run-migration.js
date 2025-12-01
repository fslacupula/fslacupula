import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString:
    "postgresql://futbolclub_user:0aPGCWQKDaH6Z9sh0I9kZq2PdogdVU2w@dpg-d4jq522li9vc73dadslg-a.frankfurt-postgres.render.com/futbolclub",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("📊 Conectando a la base de datos...");

    const migrationPath = path.join(
      __dirname,
      "database",
      "migrations",
      "20241201000001_add_periodo_to_historial_acciones.js"
    );

    // Importar y ejecutar la migración (usar pathToFileURL para Windows)
    const migration = await import(pathToFileURL(migrationPath).href);

    console.log("🔄 Ejecutando migración...");
    await migration.up(client);

    console.log("✅ Migración ejecutada exitosamente");
  } catch (error) {
    console.error("❌ Error ejecutando migración:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
