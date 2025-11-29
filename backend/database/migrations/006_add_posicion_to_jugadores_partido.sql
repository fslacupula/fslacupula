-- Migración: Agregar columna posicion a estadisticas_jugadores_partido
-- Fecha: 2025-11-29

ALTER TABLE estadisticas_jugadores_partido 
  ADD COLUMN IF NOT EXISTS posicion VARCHAR(50);

COMMENT ON COLUMN estadisticas_jugadores_partido.posicion IS 'Posición en la que jugó el jugador durante el partido';
