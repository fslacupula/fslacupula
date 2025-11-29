#!/usr/bin/env node

import { pool, closePool } from "../config/database.js";

async function extractData() {
  try {
    console.log("📊 Extrayendo datos actuales de la base de datos...\n");

    // Usuarios
    const usuarios = await pool.query(`
      SELECT id, email, password, nombre, rol, activo, created_at 
      FROM usuarios 
      ORDER BY id
    `);
    console.log("=== USUARIOS ===");
    console.log(JSON.stringify(usuarios.rows, null, 2));
    console.log("\n");

    // Jugadores
    const jugadores = await pool.query(`
      SELECT * 
      FROM jugadores 
      ORDER BY id
    `);
    console.log("=== JUGADORES ===");
    console.log(JSON.stringify(jugadores.rows, null, 2));
    console.log("\n");

    // Posiciones
    const posiciones = await pool.query(`
      SELECT id, nombre, abreviatura 
      FROM posiciones 
      ORDER BY id
    `);
    console.log("=== POSICIONES ===");
    console.log(JSON.stringify(posiciones.rows, null, 2));
    console.log("\n");

    // Motivos Ausencia
    const motivos = await pool.query(`
      SELECT * 
      FROM motivos_ausencia 
      ORDER BY id
    `);
    console.log("=== MOTIVOS AUSENCIA ===");
    console.log(JSON.stringify(motivos.rows, null, 2));
    console.log("\n");

    // Partidos
    const partidos = await pool.query(`
      SELECT * 
      FROM partidos 
      ORDER BY id
    `);
    console.log("=== PARTIDOS ===");
    console.log(JSON.stringify(partidos.rows, null, 2));
    console.log("\n");

    // Entrenamientos
    const entrenamientos = await pool.query(`
      SELECT * 
      FROM entrenamientos 
      ORDER BY id
    `);
    console.log("=== ENTRENAMIENTOS ===");
    console.log(JSON.stringify(entrenamientos.rows, null, 2));
    console.log("\n");

    // Asistencias Partidos
    const asistenciasPartidos = await pool.query(`
      SELECT * 
      FROM asistencias_partidos 
      ORDER BY id
    `);
    console.log("=== ASISTENCIAS PARTIDOS ===");
    console.log(JSON.stringify(asistenciasPartidos.rows, null, 2));
    console.log("\n");

    // Asistencias Entrenamientos
    const asistenciasEntrenamientos = await pool.query(`
      SELECT * 
      FROM asistencias_entrenamientos 
      ORDER BY id
    `);
    console.log("=== ASISTENCIAS ENTRENAMIENTOS ===");
    console.log(JSON.stringify(asistenciasEntrenamientos.rows, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await closePool();
  }
}

extractData();
