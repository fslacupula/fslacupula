/**
 * Migración: Crear tablas de asistencias
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla asistencias_entrenamientos
    CREATE TABLE asistencias_entrenamientos (
      id SERIAL PRIMARY KEY,
      entrenamiento_id INTEGER NOT NULL REFERENCES entrenamientos(id) ON DELETE CASCADE,
      jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado VARCHAR(20) NOT NULL CHECK (estado IN ('confirmado', 'ausente', 'pendiente')),
      motivo_ausencia_id INTEGER REFERENCES motivos_ausencia(id) ON DELETE SET NULL,
      comentario TEXT,
      fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entrenamiento_id, jugador_id)
    );

    -- Tabla asistencias_partidos
    CREATE TABLE asistencias_partidos (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado VARCHAR(20) NOT NULL CHECK (estado IN ('confirmado', 'ausente', 'pendiente')),
      motivo_ausencia_id INTEGER REFERENCES motivos_ausencia(id) ON DELETE SET NULL,
      comentario TEXT,
      fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(partido_id, jugador_id)
    );

    -- Índices para asistencias_entrenamientos
    CREATE INDEX idx_asistencias_entrenamientos_entrenamiento ON asistencias_entrenamientos(entrenamiento_id);
    CREATE INDEX idx_asistencias_entrenamientos_jugador ON asistencias_entrenamientos(jugador_id);
    CREATE INDEX idx_asistencias_entrenamientos_estado ON asistencias_entrenamientos(estado);

    -- Índices para asistencias_partidos
    CREATE INDEX idx_asistencias_partidos_partido ON asistencias_partidos(partido_id);
    CREATE INDEX idx_asistencias_partidos_jugador ON asistencias_partidos(jugador_id);
    CREATE INDEX idx_asistencias_partidos_estado ON asistencias_partidos(estado);

    -- Comentarios
    COMMENT ON TABLE asistencias_entrenamientos IS 'Registro de asistencia a entrenamientos';
    COMMENT ON TABLE asistencias_partidos IS 'Registro de asistencia a partidos';
    COMMENT ON COLUMN asistencias_entrenamientos.estado IS 'Estado: confirmado, ausente, pendiente';
    COMMENT ON COLUMN asistencias_partidos.estado IS 'Estado: confirmado, ausente, pendiente';
    COMMENT ON COLUMN asistencias_entrenamientos.motivo_ausencia_id IS 'Requerido cuando estado=ausente';
    COMMENT ON COLUMN asistencias_partidos.motivo_ausencia_id IS 'Requerido cuando estado=ausente';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS asistencias_entrenamientos CASCADE;
    DROP TABLE IF EXISTS asistencias_partidos CASCADE;
  `);
}
