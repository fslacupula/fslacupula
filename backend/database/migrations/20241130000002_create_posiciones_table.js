/**
 * Migración: Crear tabla posiciones
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla posiciones
    CREATE TABLE posiciones (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      descripcion TEXT,
      orden INTEGER,
      activo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      abreviatura VARCHAR(5) DEFAULT 'J',
      color VARCHAR(20) DEFAULT 'blue'
    );

    -- Índices
    CREATE INDEX idx_posiciones_nombre ON posiciones(nombre);
    CREATE INDEX idx_posiciones_orden ON posiciones(orden);

    -- Comentarios
    COMMENT ON TABLE posiciones IS 'Posiciones de fútbol sala disponibles';
    COMMENT ON COLUMN posiciones.abreviatura IS 'Abreviatura de la posición (J=Jugador, E=Extra, S=Staff)';
    COMMENT ON COLUMN posiciones.orden IS 'Orden de visualización';

    -- Insertar posiciones por defecto
    INSERT INTO posiciones (nombre, abreviatura, color, orden) VALUES
      ('Portero', 'J', 'blue', 1),
      ('Cierre', 'J', 'blue', 2),
      ('Ala', 'J', 'blue', 3),
      ('Pivot', 'J', 'blue', 4),
      ('Ala-Pivot', 'J', 'blue', 5),
      ('Extra', 'E', 'orange-600', 6),
      ('Staff', 'S', 'red', 7);
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS posiciones CASCADE;
  `);
}
