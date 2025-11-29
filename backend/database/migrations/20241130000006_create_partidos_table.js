/**
 * Migración: Crear tabla partidos
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla partidos
    CREATE TABLE partidos (
      id SERIAL PRIMARY KEY,
      fecha_hora TIMESTAMPTZ NOT NULL,
      rival VARCHAR(255) NOT NULL,
      lugar VARCHAR(255) NOT NULL,
      tipo VARCHAR(50),
      es_local BOOLEAN DEFAULT true,
      resultado VARCHAR(20),
      observaciones TEXT,
      creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX idx_partidos_fecha_hora ON partidos(fecha_hora);
    CREATE INDEX idx_partidos_rival ON partidos(rival);
    CREATE INDEX idx_partidos_tipo ON partidos(tipo);
    CREATE INDEX idx_partidos_creado_por ON partidos(creado_por);

    -- Constraints
    ALTER TABLE partidos ADD CONSTRAINT check_tipo_valido 
      CHECK (tipo IS NULL OR tipo IN ('amistoso', 'liga', 'copa', 'playoff'));

    -- Comentarios
    COMMENT ON TABLE partidos IS 'Partidos programados';
    COMMENT ON COLUMN partidos.fecha_hora IS 'Fecha y hora con timezone (TIMESTAMPTZ)';
    COMMENT ON COLUMN partidos.tipo IS 'Tipo de partido: amistoso, liga, copa, playoff';
    COMMENT ON COLUMN partidos.es_local IS 'true si jugamos en casa, false si es fuera';
    COMMENT ON COLUMN partidos.resultado IS 'Resultado final (ej: 5-3)';
    COMMENT ON COLUMN partidos.creado_por IS 'Usuario gestor que creó el partido';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS partidos CASCADE;
  `);
}
