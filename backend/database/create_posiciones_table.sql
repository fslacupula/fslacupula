-- Crear tabla de posiciones
CREATE TABLE IF NOT EXISTS posiciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  orden INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar posiciones predefinidas
INSERT INTO posiciones (nombre, orden) VALUES
  ('Portero', 1),
  ('Cierre', 2),
  ('Ala', 3),
  ('Pivot', 4)
ON CONFLICT (nombre) DO NOTHING;

-- Agregar columna posicion_id a la tabla jugadores
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS posicion_id INTEGER REFERENCES posiciones(id);

-- Migrar datos existentes de posicion a posicion_id
UPDATE jugadores 
SET posicion_id = (SELECT id FROM posiciones WHERE LOWER(posiciones.nombre) = LOWER(jugadores.posicion))
WHERE posicion IS NOT NULL;

-- Opcional: Una vez migrados los datos, puedes eliminar la columna antigua
-- ALTER TABLE jugadores DROP COLUMN IF EXISTS posicion;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_jugadores_posicion ON jugadores(posicion_id);
