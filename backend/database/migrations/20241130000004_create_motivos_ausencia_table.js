/**
 * Migración: Crear tabla motivos_ausencia
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla motivos_ausencia
    CREATE TABLE motivos_ausencia (
      id SERIAL PRIMARY KEY,
      motivo VARCHAR(100) NOT NULL UNIQUE,
      activo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX idx_motivos_ausencia_activo ON motivos_ausencia(activo);

    -- Comentarios
    COMMENT ON TABLE motivos_ausencia IS 'Catálogo de motivos de ausencia';
    COMMENT ON COLUMN motivos_ausencia.activo IS 'Motivo activo o desactivado';

    -- Insertar motivos por defecto
    INSERT INTO motivos_ausencia (motivo) VALUES
      ('Trabajo'),
      ('Lesión'),
      ('Enfermedad'),
      ('Viaje'),
      ('Personal'),
      ('Otro');
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS motivos_ausencia CASCADE;
  `);
}
