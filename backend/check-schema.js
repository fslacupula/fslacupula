import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    "postgresql://futbolclub_user:0aPGCWQKDaH6Z9sh0I9kZq2PdogdVU2w@dpg-d4jq522li9vc73dadslg-a.frankfurt-postgres.render.com/futbolclub",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkSchema() {
  const client = await pool.connect();

  try {
    console.log("📊 Revisando esquema de la base de datos...\n");

    // Verificar columnas de estadisticas_partidos
    const resultPartidos = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'estadisticas_partidos'
      ORDER BY ordinal_position
    `);
    console.log("✅ Columnas de estadisticas_partidos:");
    resultPartidos.rows.forEach((col) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );

    // Verificar columnas de estadisticas_jugadores_partido
    const resultJugadores = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'estadisticas_jugadores_partido'
      ORDER BY ordinal_position
    `);
    console.log("\n✅ Columnas de estadisticas_jugadores_partido:");
    resultJugadores.rows.forEach((col) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );

    // Verificar columnas de historial_acciones_partido
    const resultHistorial = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'historial_acciones_partido'
      ORDER BY ordinal_position
    `);
    console.log("\n✅ Columnas de historial_acciones_partido:");
    resultHistorial.rows.forEach((col) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );

    // Verificar columnas de tiempos_juego_partido
    const resultTiempos = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tiempos_juego_partido'
      ORDER BY ordinal_position
    `);
    console.log("\n✅ Columnas de tiempos_juego_partido:");
    resultTiempos.rows.forEach((col) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );

    // Verificar columnas de staff_partido
    const resultStaff = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'staff_partido'
      ORDER BY ordinal_position
    `);
    console.log("\n✅ Columnas de staff_partido:");
    resultStaff.rows.forEach((col) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
