-- Migración: Tablas para Sistema de Estadísticas de Partido
-- Fecha: 2025-11-29
-- Descripción: Crea las tablas necesarias para almacenar estadísticas de partidos finalizados

-- 1. Agregar campo estado a la tabla partidos (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='partidos' AND column_name='estado'
  ) THEN
    ALTER TABLE partidos 
    ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente';
    
    COMMENT ON COLUMN partidos.estado IS 'Estado del partido: pendiente, en_curso, finalizado, cancelado';
  END IF;
END $$;

-- 2. Tabla: estadisticas_partidos
CREATE TABLE IF NOT EXISTS estadisticas_partidos (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,

  -- Marcador Final
  goles_local INTEGER DEFAULT 0,
  goles_visitante INTEGER DEFAULT 0,

  -- Faltas de Equipo
  faltas_local INTEGER DEFAULT 0,
  faltas_visitante INTEGER DEFAULT 0,

  -- Datos del Rival
  rival_nombre VARCHAR(255),
  dorsales_visitantes JSONB,  -- {1: "5", 2: "10", ...}

  -- Metadata
  duracion_minutos INTEGER,           -- Tiempo total del partido
  fecha_finalizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  finalizado_por INTEGER REFERENCES usuarios(id),

  -- Observaciones
  observaciones TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Restricción única: un partido solo puede finalizarse una vez
  UNIQUE(partido_id)
);

-- Índices para estadisticas_partidos
CREATE INDEX IF NOT EXISTS idx_estadisticas_partido_id ON estadisticas_partidos(partido_id);
CREATE INDEX IF NOT EXISTS idx_estadisticas_fecha_finalizacion ON estadisticas_partidos(fecha_finalizacion);

COMMENT ON TABLE estadisticas_partidos IS 'Estadísticas generales de partidos finalizados';
COMMENT ON COLUMN estadisticas_partidos.dorsales_visitantes IS 'JSON con mapeo de dorsales personalizados del equipo visitante';

-- 3. Tabla: estadisticas_jugadores_partido
CREATE TABLE IF NOT EXISTS estadisticas_jugadores_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Tipo de participación
  equipo VARCHAR(20) NOT NULL DEFAULT 'local',  -- 'local' o 'visitante'
  dorsal VARCHAR(10),                            -- Dorsal usado en el partido

  -- Tiempo de Juego
  minutos_jugados INTEGER DEFAULT 0,             -- En segundos

  -- Goles y Asistencias
  goles INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  paradas INTEGER DEFAULT 0,                     -- Para porteros

  -- Disciplina
  faltas INTEGER DEFAULT 0,
  tarjetas_amarillas INTEGER DEFAULT 0,
  tarjetas_rojas INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Restricción única: un jugador solo aparece una vez por partido
  UNIQUE(partido_id, jugador_id, equipo, dorsal)
);

-- Índices para estadisticas_jugadores_partido
CREATE INDEX IF NOT EXISTS idx_estadisticas_jugadores_partido ON estadisticas_jugadores_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_estadisticas_jugadores_jugador ON estadisticas_jugadores_partido(jugador_id);
CREATE INDEX IF NOT EXISTS idx_estadisticas_jugadores_equipo ON estadisticas_jugadores_partido(equipo);

COMMENT ON TABLE estadisticas_jugadores_partido IS 'Estadísticas individuales de jugadores por partido';
COMMENT ON COLUMN estadisticas_jugadores_partido.minutos_jugados IS 'Tiempo jugado en segundos';

-- 4. Tabla: historial_acciones_partido
CREATE TABLE IF NOT EXISTS historial_acciones_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Datos de la Acción
  accion VARCHAR(50) NOT NULL,                  -- 'gol', 'falta', 'amarilla', 'roja', 'asistencia', 'parada'
  equipo VARCHAR(20) NOT NULL,                  -- 'local' o 'visitante'
  dorsal VARCHAR(10),
  jugador_nombre VARCHAR(100),

  -- Timestamp de la Acción
  timestamp TIMESTAMPTZ NOT NULL,
  minuto_partido INTEGER,                       -- Minuto del partido en que ocurrió

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Orden de las acciones
  orden_accion INTEGER
);

-- Índices para historial_acciones_partido
CREATE INDEX IF NOT EXISTS idx_historial_partido ON historial_acciones_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_historial_timestamp ON historial_acciones_partido(timestamp);
CREATE INDEX IF NOT EXISTS idx_historial_jugador ON historial_acciones_partido(jugador_id);
CREATE INDEX IF NOT EXISTS idx_historial_accion ON historial_acciones_partido(accion);

COMMENT ON TABLE historial_acciones_partido IS 'Registro cronológico de todas las acciones del partido';
COMMENT ON COLUMN historial_acciones_partido.orden_accion IS 'Orden secuencial de la acción para replay del partido';

-- 5. Tabla: tiempos_juego_partido
CREATE TABLE IF NOT EXISTS tiempos_juego_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Control de Tiempo
  timestamp_entrada TIMESTAMPTZ NOT NULL,
  timestamp_salida TIMESTAMPTZ,

  -- Posición en la que jugó
  posicion VARCHAR(50),                         -- 'portero', 'cierre', 'alaSuperior', 'alaInferior', 'pivote'

  -- Duración calculada
  duracion_segundos INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tiempos_juego_partido
CREATE INDEX IF NOT EXISTS idx_tiempos_partido ON tiempos_juego_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_tiempos_jugador ON tiempos_juego_partido(jugador_id);

COMMENT ON TABLE tiempos_juego_partido IS 'Registro detallado de entradas/salidas de jugadores (para análisis avanzado)';

-- 6. Tabla: staff_partido
CREATE TABLE IF NOT EXISTS staff_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,

  -- Identificación del staff
  tipo_staff VARCHAR(50) NOT NULL,              -- 'ENT', 'DEL', 'AUX', 'MAT', o equivalente visitante
  nombre VARCHAR(100),
  equipo VARCHAR(20) NOT NULL DEFAULT 'local',  -- 'local' o 'visitante'

  -- Tarjetas
  tarjetas_amarillas INTEGER DEFAULT 0,
  tarjetas_rojas INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para staff_partido
CREATE INDEX IF NOT EXISTS idx_staff_partido ON staff_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_staff_equipo ON staff_partido(equipo);

COMMENT ON TABLE staff_partido IS 'Registro de tarjetas al staff técnico durante el partido';

-- Comentarios adicionales
COMMENT ON COLUMN partidos.resultado IS 'Formato: "goles_local-goles_visitante" ej: "5-3"';

-- Fin de la migración
