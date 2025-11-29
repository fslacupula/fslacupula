/**
 * Database Test Helpers
 * Utilidades para tests de integración con base de datos
 */

import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const { Pool } = pg;

dotenv.config();

let testPool = null;

/**
 * Crea una conexión a la base de datos de test
 */
export function createTestDatabaseConnection() {
  if (!testPool) {
    testPool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "futbolclub_test",
    });

    testPool.on("error", (err) => {
      console.error("Error en pool de test:", err);
    });
  }

  return testPool;
}

/**
 * Cierra la conexión a la base de datos de test
 */
export async function closeDatabaseConnection() {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

/**
 * Limpia todas las tablas de la base de datos
 */
export async function cleanDatabase() {
  const pool = createTestDatabaseConnection();

  await pool.query(
    "TRUNCATE TABLE asistencias_entrenamientos RESTART IDENTITY CASCADE"
  );
  await pool.query(
    "TRUNCATE TABLE asistencias_partidos RESTART IDENTITY CASCADE"
  );
  await pool.query("TRUNCATE TABLE entrenamientos RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE partidos RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE jugadores RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE motivos_ausencia RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE posiciones RESTART IDENTITY CASCADE");
}

/**
 * Inicializa el schema de la base de datos
 */
export async function initializeTestDatabase() {
  const pool = createTestDatabaseConnection();

  // Leer el archivo schema.sql
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const schemaPath = join(__dirname, "../../database/schema.sql");

  try {
    const schema = readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("✅ Test database initialized");
  } catch (error) {
    console.error("❌ Error initializing test database:", error);
    throw error;
  }
}

/**
 * Seed básico de datos para tests
 */
export async function seedTestData() {
  const pool = createTestDatabaseConnection();

  // Insertar posiciones
  await pool.query(`
    INSERT INTO posiciones (nombre, abreviatura, color, orden) VALUES
    ('Portero', 'POR', 'blue', 1),
    ('Cierre', 'CIE', 'blue', 2),
    ('Ala', 'ALA', 'blue', 3),
    ('Pivot', 'PIV', 'blue', 4)
  `);

  // Insertar motivos de ausencia
  await pool.query(`
    INSERT INTO motivos_ausencia (motivo) VALUES
    ('Trabajo'),
    ('Lesión'),
    ('Enfermedad'),
    ('Personal')
  `);

  console.log("✅ Test data seeded");
}

/**
 * Ejecuta una query en la base de datos de test
 */
export async function query(sql, params = []) {
  const pool = createTestDatabaseConnection();
  return pool.query(sql, params);
}

export default {
  createTestDatabaseConnection,
  closeDatabaseConnection,
  cleanDatabase,
  initializeTestDatabase,
  seedTestData,
  query,
};
