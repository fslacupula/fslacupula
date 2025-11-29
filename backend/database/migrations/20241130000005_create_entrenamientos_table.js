/**
 * Migración: Crear tabla entrenamientos
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla entrenamientos
    CREATE TABLE entrenamientos (
      id SERIAL PRIMARY KEY,
      fecha_hora TIMESTAMPTZ NOT NULL,
      lugar VARCHAR(255) NOT NULL,
      descripcion TEXT,
      duracion_minutos INTEGER DEFAULT 90,
      creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX idx_entrenamientos_fecha_hora ON entrenamientos(fecha_hora);
    CREATE INDEX idx_entrenamientos_creado_por ON entrenamientos(creado_por);
    CREATE INDEX idx_entrenamientos_lugar ON entrenamientos(lugar);

    -- Constraints
    ALTER TABLE entrenamientos ADD CONSTRAINT check_duracion_positive 
      CHECK (duracion_minutos > 0);

    -- Comentarios
    COMMENT ON TABLE entrenamientos IS 'Entrenamientos programados';
    COMMENT ON COLUMN entrenamientos.fecha_hora IS 'Fecha y hora con timezone (TIMESTAMPTZ)';
    COMMENT ON COLUMN entrenamientos.duracion_minutos IS 'Duración en minutos (default 90)';
    COMMENT ON COLUMN entrenamientos.creado_por IS 'Usuario gestor que creó el entrenamiento';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS entrenamientos CASCADE;
  `);
}
