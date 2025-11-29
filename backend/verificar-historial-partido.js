import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "futbolclub",
  password: "postgres",
  port: 5432,
});

async function verificarHistorial() {
  const client = await pool.connect();

  try {
    console.log("\n🔍 Verificando historial_acciones_partido...\n");

    // Obtener el último partido finalizado
    const resultPartidos = await client.query(`
      SELECT id, rival, fecha_hora, estado
      FROM partidos
      WHERE estado = 'finalizado'
      ORDER BY fecha_hora DESC
      LIMIT 1
    `);

    if (resultPartidos.rows.length === 0) {
      console.log("❌ No hay partidos finalizados en la base de datos");
      return;
    }

    const partido = resultPartidos.rows[0];
    console.log(`📋 Partido seleccionado:`);
    console.log(`   ID: ${partido.id}`);
    console.log(`   Rival: ${partido.rival}`);
    console.log(`   Fecha: ${partido.fecha_hora}`);
    console.log(`   Estado: ${partido.estado}\n`);

    // Obtener historial de acciones
    const resultHistorial = await client.query(
      `SELECT * FROM historial_acciones_partido 
       WHERE partido_id = $1 
       ORDER BY timestamp ASC`,
      [partido.id]
    );

    console.log(
      `📊 Total de acciones registradas: ${resultHistorial.rows.length}\n`
    );

    if (resultHistorial.rows.length > 0) {
      console.log("📝 Detalle de acciones:\n");
      resultHistorial.rows.forEach((accion, index) => {
        console.log(`${index + 1}. ${accion.accion.toUpperCase()}`);
        console.log(`   Jugador ID: ${accion.jugador_id}`);
        console.log(`   Dorsal: ${accion.dorsal}`);
        console.log(`   Minuto partido: ${accion.minuto_partido}`);
        console.log(`   Equipo: ${accion.equipo}`);
        console.log(`   Período: ${accion.periodo}`);
        console.log(`   Timestamp: ${accion.timestamp}`);
        console.log(`   Orden: ${accion.orden_accion}`);
        console.log("");
      });
    } else {
      console.log("ℹ️  No hay acciones registradas para este partido");
    }

    console.log("\n✅ Verificación completada");
  } catch (error) {
    console.error("❌ Error al verificar historial:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarHistorial();
