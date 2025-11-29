#!/usr/bin/env node

/**
 * Script para eliminar TODAS las tablas de la base de datos
 * ⚠️ USAR CON PRECAUCIÓN - Solo para desarrollo
 */

import { pool, closePool } from "../config/database.js";

async function dropAllTables() {
  try {
    console.log("⚠️  ELIMINANDO TODAS LAS TABLAS...");

    await pool.query(`
      DROP TABLE IF EXISTS asistencias_entrenamientos CASCADE;
      DROP TABLE IF EXISTS asistencias_partidos CASCADE;
      DROP TABLE IF EXISTS entrenamientos CASCADE;
      DROP TABLE IF EXISTS partidos CASCADE;
      DROP TABLE IF EXISTS jugadores CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
      DROP TABLE IF EXISTS posiciones CASCADE;
      DROP TABLE IF EXISTS motivos_ausencia CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
    `);

    console.log("✅ Todas las tablas eliminadas correctamente");
  } catch (error) {
    console.error("❌ Error eliminando tablas:", error.message);
    throw error;
  } finally {
    await closePool();
  }
}

dropAllTables();
