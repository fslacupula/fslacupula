#!/usr/bin/env node

/**
 * Script para ejecutar la migración de estadísticas manualmente
 */

import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Usar DATABASE_URL si está disponible (producción), sino usar config local
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "futbolclub",
      password: process.env.DB_PASSWORD || "postgres",
      port: parseInt(process.env.DB_PORT || "5432"),
    };

const pool = new Pool(poolConfig);

async function ejecutarMigracion() {
  const client = await pool.connect();

  try {
    console.log("🔄 Ejecutando migración 004_crear_tablas_estadisticas.sql...");

    // Leer el archivo SQL
    const sqlPath = path.join(
      __dirname,
      "migrations",
      "004_crear_tablas_estadisticas.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Ejecutar en una transacción
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    console.log("✅ Migración ejecutada exitosamente");
    console.log("📊 Tablas creadas:");
    console.log("   - estadisticas_partidos");
    console.log("   - estadisticas_jugadores_partido");
    console.log("   - historial_acciones_partido");
    console.log("   - tiempos_juego_partido");
    console.log("   - staff_partido");
    console.log('   + Columna "estado" en tabla partidos');

    // Verificar que las tablas existen
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'estadisticas_partidos',
          'estadisticas_jugadores_partido',
          'historial_acciones_partido',
          'tiempos_juego_partido',
          'staff_partido'
        )
      ORDER BY table_name;
    `);

    console.log("\n✅ Verificación: Tablas encontradas en la base de datos:");
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al ejecutar la migración:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarMigracion()
  .then(() => {
    console.log("\n✅ Proceso completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error fatal:", error);
    process.exit(1);
  });
