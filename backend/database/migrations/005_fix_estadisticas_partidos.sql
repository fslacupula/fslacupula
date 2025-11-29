-- Migración: Corrección de tablas de estadísticas
-- Fecha: 2025-11-29
-- Descripción: Ajusta las tablas de estadísticas para que coincidan con el código del backend

-- 1. Agregar columnas faltantes a estadisticas_partidos
ALTER TABLE estadisticas_partidos 
  ADD COLUMN IF NOT EXISTS faltas_local_primera INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faltas_local_segunda INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faltas_visitante_primera INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faltas_visitante_segunda INTEGER DEFAULT 0;

-- 2. Renombrar fecha_finalizacion a fecha_registro (si existe)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='estadisticas_partidos' AND column_name='fecha_finalizacion'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='estadisticas_partidos' AND column_name='fecha_registro'
  ) THEN
    ALTER TABLE estadisticas_partidos 
    RENAME COLUMN fecha_finalizacion TO fecha_registro;
  END IF;
END $$;

-- 3. Agregar columna estadisticas_partido_id a estadisticas_jugadores_partido
ALTER TABLE estadisticas_jugadores_partido 
  ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;

-- 4. Agregar columna estadisticas_partido_id a historial_acciones_partido
ALTER TABLE historial_acciones_partido 
  ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;

-- 5. Agregar columnas faltantes a historial_acciones_partido
ALTER TABLE historial_acciones_partido 
  ADD COLUMN IF NOT EXISTS minuto INTEGER,
  ADD COLUMN IF NOT EXISTS detalles TEXT;

-- 6. Agregar columna estadisticas_partido_id a tiempos_juego_partido
ALTER TABLE tiempos_juego_partido 
  ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;

-- 7. Agregar columnas faltantes a tiempos_juego_partido
ALTER TABLE tiempos_juego_partido 
  ADD COLUMN IF NOT EXISTS minuto_entrada INTEGER,
  ADD COLUMN IF NOT EXISTS minuto_salida INTEGER,
  ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER;

-- 8. Agregar columna estadisticas_partido_id a staff_partido
ALTER TABLE staff_partido 
  ADD COLUMN IF NOT EXISTS estadisticas_partido_id INTEGER REFERENCES estadisticas_partidos(id) ON DELETE CASCADE;

-- 9. Agregar columnas faltantes a estadisticas_jugadores_partido
ALTER TABLE estadisticas_jugadores_partido
  ADD COLUMN IF NOT EXISTS goles_recibidos INTEGER DEFAULT 0;

-- 10. Actualizar índices
DROP INDEX IF EXISTS idx_estadisticas_fecha_finalizacion;
CREATE INDEX IF NOT EXISTS idx_estadisticas_fecha_registro ON estadisticas_partidos(fecha_registro);

-- Comentarios
COMMENT ON COLUMN estadisticas_partidos.faltas_local_primera IS 'Faltas del equipo local en la primera parte';
COMMENT ON COLUMN estadisticas_partidos.faltas_local_segunda IS 'Faltas del equipo local en la segunda parte';
COMMENT ON COLUMN estadisticas_partidos.faltas_visitante_primera IS 'Faltas del equipo visitante en la primera parte';
COMMENT ON COLUMN estadisticas_partidos.faltas_visitante_segunda IS 'Faltas del equipo visitante en la segunda parte';

-- Fin de la migración
