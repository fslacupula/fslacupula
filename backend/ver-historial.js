import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function verDatos() {
  const client = await pool.connect();

  try {
    console.log("📋 Registros del último partido (ID 9):\n");

    const registros = await client.query(`
      SELECT id, accion, equipo, dorsal, jugador_nombre, 
             minuto_partido, timestamp, orden_accion, partido_id
      FROM historial_acciones_partido
      WHERE partido_id = 9
      ORDER BY orden_accion ASC
    `);

    if (registros.rows.length === 0) {
      console.log("No hay registros para el partido 9");
    } else {
      console.log(`Total de acciones: ${registros.rows.length}\n`);
      registros.rows.forEach((row) => {
        console.log(
          `Orden ${row.orden_accion}: ${row.accion} | Equipo: ${row.equipo} | Dorsal: ${row.dorsal}`
        );
        console.log(`   Jugador: ${row.jugador_nombre}`);
        console.log(`   ⏱️  Minuto partido: ${row.minuto_partido}`);
        console.log(`   🕐 Timestamp: ${row.timestamp}`);
        console.log("---");
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verDatos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
