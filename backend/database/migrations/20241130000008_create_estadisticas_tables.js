/**
 * Migración: Crear tablas de estadísticas de partidos
 * Creada: 2024-11-30
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  await client.query(`
    -- Tabla estadisticas_partidos
    CREATE TABLE estadisticas_partidos (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      duracion_total_segundos INTEGER DEFAULT 0,
      faltas_local INTEGER DEFAULT 0,
      faltas_visitante INTEGER DEFAULT 0,
      corners_local INTEGER DEFAULT 0,
      corners_visitante INTEGER DEFAULT 0,
      penales_local INTEGER DEFAULT 0,
      penales_visitante INTEGER DEFAULT 0,
      tarjetas_amarillas_local INTEGER DEFAULT 0,
      tarjetas_amarillas_visitante INTEGER DEFAULT 0,
      tarjetas_rojas_local INTEGER DEFAULT 0,
      tarjetas_rojas_visitante INTEGER DEFAULT 0,
      goles_local INTEGER DEFAULT 0,
      goles_visitante INTEGER DEFAULT 0,
      posesion_local NUMERIC(5,2),
      posesion_visitante NUMERIC(5,2),
      tiros_puerta_local INTEGER DEFAULT 0,
      tiros_puerta_visitante INTEGER DEFAULT 0,
      paradas_portero_local INTEGER DEFAULT 0,
      paradas_portero_visitante INTEGER DEFAULT 0,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(partido_id)
    );

    -- Tabla estadisticas_jugadores_partido
    CREATE TABLE estadisticas_jugadores_partido (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      minutos_jugados INTEGER DEFAULT 0,
      goles INTEGER DEFAULT 0,
      asistencias INTEGER DEFAULT 0,
      tarjetas_amarillas INTEGER DEFAULT 0,
      tarjetas_rojas INTEGER DEFAULT 0,
      titular BOOLEAN DEFAULT false,
      UNIQUE(partido_id, jugador_id)
    );

    -- Tabla historial_acciones_partido
    CREATE TABLE historial_acciones_partido (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      jugador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      tipo_accion VARCHAR(50) NOT NULL,
      minuto_partido INTEGER NOT NULL,
      equipo VARCHAR(20) NOT NULL CHECK (equipo IN ('local', 'visitante')),
      timestamp_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla tiempos_juego_partido
    CREATE TABLE tiempos_juego_partido (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      timestamp_entrada BIGINT NOT NULL,
      timestamp_salida BIGINT,
      duracion_segundos INTEGER,
      UNIQUE(partido_id, jugador_id, timestamp_entrada)
    );

    -- Tabla staff_partido
    CREATE TABLE staff_partido (
      id SERIAL PRIMARY KEY,
      partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      rol VARCHAR(50) NOT NULL,
      tarjetas_amarillas INTEGER DEFAULT 0,
      tarjetas_rojas INTEGER DEFAULT 0,
      UNIQUE(partido_id, usuario_id)
    );

    -- Índices para estadisticas_partidos
    CREATE INDEX idx_estadisticas_partido ON estadisticas_partidos(partido_id);
    CREATE INDEX idx_estadisticas_fecha_registro ON estadisticas_partidos(fecha_registro);

    -- Índices para estadisticas_jugadores_partido
    CREATE INDEX idx_estadisticas_jugadores_partido ON estadisticas_jugadores_partido(partido_id);
    CREATE INDEX idx_estadisticas_jugadores_jugador ON estadisticas_jugadores_partido(jugador_id);

    -- Índices para historial_acciones_partido
    CREATE INDEX idx_historial_partido ON historial_acciones_partido(partido_id);
    CREATE INDEX idx_historial_jugador ON historial_acciones_partido(jugador_id);
    CREATE INDEX idx_historial_tipo ON historial_acciones_partido(tipo_accion);
    CREATE INDEX idx_historial_equipo ON historial_acciones_partido(equipo);

    -- Índices para tiempos_juego_partido
    CREATE INDEX idx_tiempos_partido ON tiempos_juego_partido(partido_id);
    CREATE INDEX idx_tiempos_jugador ON tiempos_juego_partido(jugador_id);

    -- Índices para staff_partido
    CREATE INDEX idx_staff_partido ON staff_partido(partido_id);
    CREATE INDEX idx_staff_usuario ON staff_partido(usuario_id);

    -- Comentarios
    COMMENT ON TABLE estadisticas_partidos IS 'Estadísticas generales de cada partido';
    COMMENT ON TABLE estadisticas_jugadores_partido IS 'Estadísticas individuales de jugadores en cada partido';
    COMMENT ON TABLE historial_acciones_partido IS 'Registro cronológico de todas las acciones del partido (goles, tarjetas, etc)';
    COMMENT ON TABLE tiempos_juego_partido IS 'Registro de tiempos de juego de cada jugador (entradas/salidas)';
    COMMENT ON TABLE staff_partido IS 'Registro del staff técnico que participó en el partido';

    COMMENT ON COLUMN estadisticas_partidos.duracion_total_segundos IS 'Duración total del partido en segundos';
    COMMENT ON COLUMN estadisticas_jugadores_partido.minutos_jugados IS 'Segundos jugados por el jugador';
    COMMENT ON COLUMN historial_acciones_partido.minuto_partido IS 'Minuto del partido en que ocurrió la acción';
    COMMENT ON COLUMN historial_acciones_partido.equipo IS 'Equipo: local o visitante';
    COMMENT ON COLUMN tiempos_juego_partido.timestamp_entrada IS 'Timestamp en milisegundos cuando entró el jugador';
    COMMENT ON COLUMN tiempos_juego_partido.timestamp_salida IS 'Timestamp en milisegundos cuando salió el jugador';
    COMMENT ON COLUMN tiempos_juego_partido.duracion_segundos IS 'Duración en segundos de este período de juego';
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS staff_partido CASCADE;
    DROP TABLE IF EXISTS tiempos_juego_partido CASCADE;
    DROP TABLE IF EXISTS historial_acciones_partido CASCADE;
    DROP TABLE IF EXISTS estadisticas_jugadores_partido CASCADE;
    DROP TABLE IF EXISTS estadisticas_partidos CASCADE;
  `);
}
