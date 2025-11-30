/**
 * Migración: Corrección de tablas de estadísticas
 * Creada: 2024-11-30
 * Descripción: Ajusta las tablas de estadísticas para que coincidan con el código del backend
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  // 1. Agregar columnas faltantes a estadisticas_partidos
  await client.query(`
    ALTER TABLE estadisticas_partidos 
      ADD COLUMN IF NOT EXISTS faltas_local_primera INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS faltas_local_segunda INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS faltas_visitante_primera INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS faltas_visitante_segunda INTEGER DEFAULT 0;
  `);

  // 2. Agregar columna estadisticas_partido_id a estadisticas_jugadores_partido
  await client.query(`
    ALTER TABLE estadisticas_jugadores_partido 
      ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;
  `);

  // 3. Agregar columna estadisticas_partido_id a historial_acciones_partido
  await client.query(`
    ALTER TABLE historial_acciones_partido 
      ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;
  `);

  // 4. Agregar columnas faltantes a historial_acciones_partido
  await client.query(`
    ALTER TABLE historial_acciones_partido 
      ADD COLUMN IF NOT EXISTS minuto INTEGER,
      ADD COLUMN IF NOT EXISTS detalles TEXT;
  `);

  // 5. Agregar columna estadisticas_partido_id a tiempos_juego_partido
  await client.query(`
    ALTER TABLE tiempos_juego_partido 
      ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;
  `);

  // 6. Agregar columnas faltantes a tiempos_juego_partido
  await client.query(`
    ALTER TABLE tiempos_juego_partido 
      ADD COLUMN IF NOT EXISTS minuto_entrada INTEGER,
      ADD COLUMN IF NOT EXISTS minuto_salida INTEGER,
      ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER;
  `);

  // 7. Agregar columna estadisticas_partido_id a staff_partido
  await client.query(`
    ALTER TABLE staff_partido 
      ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;
  `);

  // 8. Agregar columnas faltantes a estadisticas_jugadores_partido
  await client.query(`
    ALTER TABLE estadisticas_jugadores_partido
      ADD COLUMN IF NOT EXISTS goles_recibidos INTEGER DEFAULT 0;
  `);

  // 9. Comentarios
  await client.query(`
    COMMENT ON COLUMN estadisticas_partidos.faltas_local_primera IS 'Faltas del equipo local en la primera parte';
    COMMENT ON COLUMN estadisticas_partidos.faltas_local_segunda IS 'Faltas del equipo local en la segunda parte';
    COMMENT ON COLUMN estadisticas_partidos.faltas_visitante_primera IS 'Faltas del equipo visitante en la primera parte';
    COMMENT ON COLUMN estadisticas_partidos.faltas_visitante_segunda IS 'Faltas del equipo visitante en la segunda parte';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  // Revertir cambios en orden inverso
  await client.query(`
    ALTER TABLE estadisticas_jugadores_partido DROP COLUMN IF EXISTS goles_recibidos;
    ALTER TABLE staff_partido DROP COLUMN IF EXISTS estadisticas_partido_id;
    ALTER TABLE tiempos_juego_partido DROP COLUMN IF EXISTS duracion_minutos;
    ALTER TABLE tiempos_juego_partido DROP COLUMN IF EXISTS minuto_salida;
    ALTER TABLE tiempos_juego_partido DROP COLUMN IF EXISTS minuto_entrada;
    ALTER TABLE tiempos_juego_partido DROP COLUMN IF EXISTS estadisticas_partido_id;
    ALTER TABLE historial_acciones_partido DROP COLUMN IF EXISTS detalles;
    ALTER TABLE historial_acciones_partido DROP COLUMN IF EXISTS minuto;
    ALTER TABLE historial_acciones_partido DROP COLUMN IF EXISTS estadisticas_partido_id;
    ALTER TABLE estadisticas_jugadores_partido DROP COLUMN IF EXISTS estadisticas_partido_id;
    ALTER TABLE estadisticas_partidos DROP COLUMN IF EXISTS faltas_visitante_segunda;
    ALTER TABLE estadisticas_partidos DROP COLUMN IF EXISTS faltas_visitante_primera;
    ALTER TABLE estadisticas_partidos DROP COLUMN IF EXISTS faltas_local_segunda;
    ALTER TABLE estadisticas_partidos DROP COLUMN IF EXISTS faltas_local_primera;
  `);
}
