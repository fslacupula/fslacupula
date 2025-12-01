/**
 * Migración: Agregar campo periodo a historial_acciones_partido
 * Creada: 2024-12-01
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Agregar columna periodo a historial_acciones_partido
    ALTER TABLE historial_acciones_partido 
    ADD COLUMN periodo INTEGER DEFAULT 1 CHECK (periodo IN (1, 2));

    -- Crear índice para consultas por período
    CREATE INDEX idx_historial_periodo ON historial_acciones_partido(periodo);

    -- Comentario
    COMMENT ON COLUMN historial_acciones_partido.periodo IS 'Período del partido en que ocurrió la acción: 1 = Primera parte, 2 = Segunda parte';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    -- Eliminar índice
    DROP INDEX IF EXISTS idx_historial_periodo;

    -- Eliminar columna periodo
    ALTER TABLE historial_acciones_partido 
    DROP COLUMN IF EXISTS periodo;
  `);
}
