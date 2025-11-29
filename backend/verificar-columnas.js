import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function verificarColumnas() {
  const client = await pool.connect();

  try {
    console.log("🔍 Verificando columnas de tablas relacionadas con tiempo:\n");

    // estadisticas_jugadores_partido
    console.log("📋 Columnas de estadisticas_jugadores_partido:");
    const colsJugadores = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'estadisticas_jugadores_partido' 
      AND column_name LIKE '%minutos%'
      ORDER BY ordinal_position
    `);
    colsJugadores.rows.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // tiempos_juego_partido
    console.log("\n📋 Columnas de tiempos_juego_partido:");
    const colsTiempos = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tiempos_juego_partido' 
      AND (column_name LIKE '%duracion%' OR column_name LIKE '%minuto%')
      ORDER BY ordinal_position
    `);
    colsTiempos.rows.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // estadisticas_partidos
    console.log("\n📋 Columnas de estadisticas_partidos:");
    const colsPartidos = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'estadisticas_partidos' 
      AND column_name LIKE '%duracion%'
      ORDER BY ordinal_position
    `);
    colsPartidos.rows.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verificarColumnas()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
