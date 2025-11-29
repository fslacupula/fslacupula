import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function limpiarDatos() {
  const client = await pool.connect();

  try {
    console.log("🗑️  Iniciando limpieza de datos...\n");

    // Borrar datos de tablas relacionadas con partidos
    console.log("Eliminando historial de acciones de partidos...");
    await client.query("TRUNCATE TABLE historial_acciones_partido CASCADE");

    console.log("Eliminando tiempos de juego de partidos...");
    await client.query("TRUNCATE TABLE tiempos_juego_partido CASCADE");

    console.log("Eliminando estadísticas de jugadores en partidos...");
    await client.query("TRUNCATE TABLE estadisticas_jugadores_partido CASCADE");

    console.log("Eliminando staff de partidos...");
    await client.query("TRUNCATE TABLE staff_partido CASCADE");

    console.log("Eliminando estadísticas de partidos...");
    await client.query("TRUNCATE TABLE estadisticas_partidos CASCADE");

    console.log("Eliminando asistencias a partidos...");
    await client.query("TRUNCATE TABLE asistencias_partidos CASCADE");

    console.log("Eliminando partidos...");
    await client.query("TRUNCATE TABLE partidos CASCADE");

    // Borrar datos de tablas relacionadas con entrenamientos
    console.log("Eliminando asistencias a entrenamientos...");
    await client.query("TRUNCATE TABLE asistencias_entrenamientos CASCADE");

    console.log("Eliminando entrenamientos...");
    await client.query("TRUNCATE TABLE entrenamientos CASCADE");

    console.log(
      "\n✅ Datos de partidos y entrenamientos eliminados correctamente"
    );
    console.log(
      "✅ Usuarios, jugadores, motivos de ausencia y posiciones preservados\n"
    );
  } catch (error) {
    console.error("❌ Error al limpiar datos:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

limpiarDatos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
