/**
 * Migración: Agregar columna posicion a estadisticas_jugadores_partido
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    ALTER TABLE estadisticas_jugadores_partido 
      ADD COLUMN IF NOT EXISTS posicion VARCHAR(50);

    COMMENT ON COLUMN estadisticas_jugadores_partido.posicion IS 'Posición en la que jugó el jugador durante el partido';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    ALTER TABLE estadisticas_jugadores_partido DROP COLUMN IF EXISTS posicion;
  `);
}
