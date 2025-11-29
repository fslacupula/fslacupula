import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    "postgresql://futbolclub_user:0aPGCWQKDaH6Z9sh0I9kZq2PdogdVU2w@dpg-d4jq522li9vc73dadslg-a.frankfurt-postgres.render.com/futbolclub",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkConstraints() {
  const client = await pool.connect();

  try {
    console.log("📊 Revisando TODAS las constraints NOT NULL...\n");

    const tables = [
      "estadisticas_partidos",
      "estadisticas_jugadores_partido",
      "historial_acciones_partido",
      "tiempos_juego_partido",
      "staff_partido",
    ];

    for (const table of tables) {
      const result = await client.query(
        `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `,
        [table]
      );

      console.log(`\n✅ Tabla: ${table}`);
      console.log("=".repeat(80));
      result.rows.forEach((col) => {
        const nullable = col.is_nullable === "YES" ? "✓ NULL" : "✗ NOT NULL";
        const hasDefault = col.column_default
          ? `(default: ${col.column_default})`
          : "";
        console.log(
          `  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(
            25
          )} ${nullable} ${hasDefault}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkConstraints();
