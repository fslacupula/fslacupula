/**
 * Migración: Crear tabla usuarios
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla usuarios
    CREATE TABLE usuarios (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'gestor', 'jugador')),
      activo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices
    CREATE INDEX idx_usuarios_email ON usuarios(email);
    CREATE INDEX idx_usuarios_rol ON usuarios(rol);
    CREATE INDEX idx_usuarios_activo ON usuarios(activo);

    -- Comentarios
    COMMENT ON TABLE usuarios IS 'Usuarios del sistema (admins, gestores, jugadores)';
    COMMENT ON COLUMN usuarios.rol IS 'Roles: admin, gestor, jugador';
    COMMENT ON COLUMN usuarios.activo IS 'Usuario activo o desactivado (soft delete)';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS usuarios CASCADE;
  `);
}
