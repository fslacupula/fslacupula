/**
 * Migración: Crear tabla jugadores
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla jugadores
    CREATE TABLE jugadores (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
      numero_dorsal INTEGER,
      posicion VARCHAR(50),
      telefono VARCHAR(20),
      fecha_nacimiento DATE,
      foto_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      alias VARCHAR(50),
      posicion_id INTEGER REFERENCES posiciones(id) ON DELETE SET NULL
    );

    -- Índices
    CREATE INDEX idx_jugadores_usuario_id ON jugadores(usuario_id);
    CREATE INDEX idx_jugadores_numero_dorsal ON jugadores(numero_dorsal);
    CREATE INDEX idx_jugadores_posicion_id ON jugadores(posicion_id);

    -- Constraints adicionales
    ALTER TABLE jugadores ADD CONSTRAINT check_numero_dorsal_positive 
      CHECK (numero_dorsal IS NULL OR numero_dorsal > 0);

    -- Comentarios
    COMMENT ON TABLE jugadores IS 'Perfil extendido de jugadores';
    COMMENT ON COLUMN jugadores.usuario_id IS 'Relación 1:1 con usuarios';
    COMMENT ON COLUMN jugadores.numero_dorsal IS 'Número de camiseta (único por jugador activo)';
    COMMENT ON COLUMN jugadores.posicion IS 'Posición principal (deprecado, usar posicion_id)';
    COMMENT ON COLUMN jugadores.posicion_id IS 'FK a tabla posiciones';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS jugadores CASCADE;
  `);
}
