import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function verificarMinutoPartido() {
  const client = await pool.connect();

  try {
    console.log(
      "🔍 Verificando columna minuto_partido en historial_acciones_partido...\n"
    );

    // Verificar si la columna existe
    const columnaExiste = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'historial_acciones_partido' 
      AND column_name = 'minuto_partido'
    `);

    if (columnaExiste.rows.length === 0) {
      console.log("❌ La columna minuto_partido NO existe en la tabla");
      console.log("📝 Agregando columna minuto_partido...");

      await client.query(`
        ALTER TABLE historial_acciones_partido 
        ADD COLUMN IF NOT EXISTS minuto_partido INTEGER
      `);

      console.log("✅ Columna minuto_partido agregada correctamente\n");
    } else {
      console.log("✅ La columna minuto_partido existe");
      console.log(`   Tipo de dato: ${columnaExiste.rows[0].data_type}\n`);
    }

    // Mostrar estructura de la tabla
    console.log("📋 Estructura completa de historial_acciones_partido:");
    const estructura = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'historial_acciones_partido'
      ORDER BY ordinal_position
    `);

    estructura.rows.forEach((col) => {
      console.log(
        `   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    // Verificar si hay registros con minuto_partido
    const registros = await client.query(`
      SELECT COUNT(*) as total, 
             COUNT(minuto_partido) as con_minuto,
             COUNT(*) - COUNT(minuto_partido) as sin_minuto
      FROM historial_acciones_partido
    `);

    console.log("\n📊 Registros en la tabla:");
    console.log(`   Total: ${registros.rows[0].total}`);
    console.log(`   Con minuto_partido: ${registros.rows[0].con_minuto}`);
    console.log(
      `   Sin minuto_partido (NULL): ${registros.rows[0].sin_minuto}`
    );
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verificarMinutoPartido()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
